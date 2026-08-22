import fs from "fs";
import path from "path";
import { ExploreAuditRecord, SeoAuditReport } from "@/types/audit";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { extractCanonicalHostname } from "@/lib/url";

export interface DomainCooldownRecord {
  auditId: string;
  timestamp: number;
}

/** Raised when an audit could not be durably persisted (production correctness). */
export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceError";
  }
}

// --- Retention configuration ---
const AUDIT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // AUDIT_TTL_DAYS = 30
const MAX_PUBLIC_AUDITS = 500;

export function normalizeAuditId(id: string): string {
  if (!id) return "";
  const clean = decodeURIComponent(id).trim();
  // If it's a domain name, keep lowercase
  if (clean.includes(".")) {
    return extractCanonicalHostname(clean);
  }
  // If it's demo
  if (clean.toLowerCase() === "demo") {
    return "demo";
  }
  // Standardize RKL- prefix to uppercase
  if (/^rkl-/i.test(clean)) {
    return clean.toUpperCase();
  }
  // If it's a 6-character hex ref like "84AD35"
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `RKL-${clean.toUpperCase()}`;
  }
  return clean.toUpperCase();
}

export class AuditPersistenceEngine {
  private memoryCache = new Map<string, SeoAuditReport>();
  private memoryCooldowns = new Map<string, DomainCooldownRecord>();
  private memoryRecent: ExploreAuditRecord[] = [];
  private readonly maxRecent = MAX_PUBLIC_AUDITS;
  /** Dedupes identical Blob writes within this warm instance. */
  private lastWriteFingerprint = new Map<string, string>();
  private storageDir: string;
  private isServerless: boolean;
  private hasBlobStorage: boolean;

  constructor(customStorageDir?: string) {
    this.isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.hasBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    // Local development uses the filesystem; serverless /tmp is best-effort cache only.
    if (customStorageDir) {
      this.storageDir = customStorageDir;
    } else if (process.env.STORAGE_PATH && !this.isServerless) {
      this.storageDir = process.env.STORAGE_PATH;
    } else if (this.isServerless) {
      this.storageDir = path.join("/tmp", "rankly-data");
    } else {
      this.storageDir = path.join(process.cwd(), ".data");
    }

    this.preloadDemo();
    this.ensureStorageDir();
  }

  /**
   * Whether a durable storage layer (Vercel Blob in production) backs this engine.
   * When false, only local-dev filesystem durability exists.
   */
  public get isDurable(): boolean {
    return this.hasBlobStorage || (!this.isServerless && typeof fs !== "undefined");
  }

  private preloadDemo(): void {
    this.memoryCache.set("demo", DEMO_AUDIT);
    this.memoryCache.set(DEMO_AUDIT.id, DEMO_AUDIT);
    this.memoryCache.set(DEMO_AUDIT.id.toLowerCase(), DEMO_AUDIT);
    this.memoryCache.set(DEMO_AUDIT.domain.toLowerCase(), DEMO_AUDIT);
  }

  private ensureStorageDir(): void {
    if (typeof window === "undefined" && typeof fs !== "undefined" && fs.mkdirSync) {
      try {
        if (!fs.existsSync(this.storageDir)) {
          fs.mkdirSync(this.storageDir, { recursive: true });
        }
      } catch {
        // Fallback gracefully if filesystem is read-only
      }
    }
  }

  // --- KV / REST API CONFIGURATION (optional replication layer) ---
  private getKvConfig(): { url: string; token: string } | null {
    const url =
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_URL;
    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_READ_ONLY_TOKEN;

    if (url && token && url.startsWith("http")) {
      return { url: url.replace(/\/$/, ""), token };
    }
    return null;
  }

  private async kvCommand<T = unknown>(command: string, ...args: (string | number)[]): Promise<T | null> {
    const config = this.getKvConfig();
    if (!config) return null;

    try {
      const endpoint = `${config.url}/${[command, ...args.map((a) => encodeURIComponent(a.toString()))].join("/")}`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const data = await res.json();
      return (data.result ?? null) as T;
    } catch {
      return null;
    }
  }

  // --- VERCEL BLOB STORAGE — authoritative production layer ---
  private getBlobToken(): string | undefined {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  private async blobPut(filename: string, data: string): Promise<boolean> {
    const token = this.getBlobToken();
    if (!token) return false;
    try {
      const { put } = await import("@vercel/blob");
      await put(`rankly/${filename}`, data, { access: "public", token, addRandomSuffix: false });
      return true;
    } catch (err) {
      console.warn("[AuditPersistenceEngine] Blob write warning:", err);
      return false;
    }
  }

  private async blobGetJson<T>(filename: string): Promise<T | null> {
    const token = this.getBlobToken();
    if (!token) return null;
    try {
      const { head } = await import("@vercel/blob");
      const meta = await head(`rankly/${filename}`);
      const res = await fetch(meta.url, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  private async blobDelete(filename: string): Promise<void> {
    const token = this.getBlobToken();
    if (!token) return;
    try {
      const { head, del } = await import("@vercel/blob");
      const meta = await head(`rankly/${filename}`);
      await del(meta.url, { token });
    } catch {
      // Already gone or unreachable — retention is best-effort cleanup
    }
  }

  /**
   * Opportunistic TTL enforcement over stored blobs using uploadedAt metadata.
   * Runs at most once per warm instance and never blocks the request path on failure.
   */
  private blobRetentionSweepRunning = false;
  private async runBlobRetentionSweep(): Promise<void> {
    const token = this.getBlobToken();
    if (!token || this.blobRetentionSweepRunning) return;
    this.blobRetentionSweepRunning = true;
    try {
      const { list } = await import("@vercel/blob");
      const cutoff = Date.now() - AUDIT_TTL_MS;
      let cursor: string | undefined;
      do {
        const result = await list({ prefix: "rankly/", token, cursor, limit: 100 });
        const expired = result.blobs.filter(
          (b) => b.pathname.startsWith("rankly/audit_") && new Date(b.uploadedAt).getTime() < cutoff
        );
        if (expired.length > 0) {
          const { del } = await import("@vercel/blob");
          await del(expired.map((b) => b.url), { token }).catch(() => {});
        }
        cursor = result.cursor;
      } while (cursor);
    } catch {
      // Best-effort housekeeping
    } finally {
      this.blobRetentionSweepRunning = false;
    }
  }

  // --- FILE STORAGE HELPERS (local development / ephemeral cache) ---
  private getFilePath(filename: string): string {
    return path.join(this.storageDir, filename);
  }

  private fingerprint(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch {
      return String(Date.now());
    }
  }

  private isDuplicateWrite(filename: string, data: unknown): boolean {
    const fp = this.fingerprint(data);
    if (this.lastWriteFingerprint.get(filename) === fp) return true;
    this.lastWriteFingerprint.set(filename, fp);
    return false;
  }

  private async readJsonFile<T>(filename: string): Promise<T | null> {
    if (typeof window !== "undefined" || !fs.promises) return null;

    // 1. Authoritative Vercel Blob storage (production)
    const fromBlob = await this.blobGetJson<T>(filename);
    if (fromBlob) return fromBlob;

    // 2. Local filesystem (development) or /tmp best-effort cache
    try {
      const filePath = this.getFilePath(filename);
      const data = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  /**
   * Writes JSON to durable storage. Returns true ONLY if a durable write succeeded:
   * - Production: Vercel Blob
   * - Local dev: project .data directory
   * Serverless /tmp alone does NOT count as durable.
   */
  private async writeJsonFile<T>(filename: string, data: T): Promise<boolean> {
    if (typeof window !== "undefined" || !fs.promises) return false;
    if (this.isDuplicateWrite(filename, data)) return true;

    // 1. Durable Vercel Blob storage (production source of truth)
    const serialized = JSON.stringify(data);
    const blobWritten = await this.blobPut(filename, serialized);

    // 2. Filesystem mirror (local dev durability + serverless read cache)
    let fileWritten = false;
    try {
      this.ensureStorageDir();
      const filePath = this.getFilePath(filename);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      fileWritten = true;
    } catch {
      fileWritten = false;
    }

    if (blobWritten) return true;
    if (this.hasBlobStorage) return false; // Blob configured but write failed → not durable
    // No Blob configured: local filesystem is durable only outside serverless
    return !this.isServerless && fileWritten;
  }

  // --- RETENTION ---
  private enforceRetention(recent: ExploreAuditRecord[]): { kept: ExploreAuditRecord[]; removedIds: string[] } {
    const cutoff = Date.now() - AUDIT_TTL_MS;
    const fresh = recent.filter((r) => r.timestamp >= cutoff);
    const capped = fresh.slice(0, MAX_PUBLIC_AUDITS); // newest-first list
    const removedIds = recent
      .filter((r) => !capped.some((k) => k.id === r.id))
      .map((r) => normalizeAuditId(r.id));
    return { kept: capped, removedIds };
  }

  // --- AUDIT OPERATIONS ---
  public async saveAudit(report: SeoAuditReport): Promise<void> {
    const now = Date.now();
    const normalizedId = normalizeAuditId(report.id);
    const canonicalDomain = extractCanonicalHostname(report.domain);

    // 1. Update L1 In-Memory Cache (optimization only)
    this.memoryCache.set(normalizedId, report);
    this.memoryCache.set(normalizedId.toLowerCase(), report);
    this.memoryCache.set(canonicalDomain, report);
    this.memoryCache.set(report.domain.toLowerCase(), report);

    // 2. Add to Recent / Explore list with retention applied
    const exploreRecord: ExploreAuditRecord = {
      id: report.id,
      domain: canonicalDomain,
      overallScore: report.overallScore,
      scoreInterpretation: report.scoreInterpretation,
      pillars: {
        seo: report.pillars.seo.score,
        aeo: report.pillars.aeo.score,
        geo: report.pillars.geo.score,
      },
      categories: {
        technical: report.categories.technical.score,
        onpage: report.categories.onpage.score,
        content: report.categories.content.score,
        social: report.categories.social.score,
      },
      timestamp: now,
      timeAgo: "just now",
    };
    this.addToMemoryRecent(exploreRecord);

    // 3. Optional KV replication (extra resilience when configured)
    const kv = this.getKvConfig();
    if (kv) {
      try {
        const payload = JSON.stringify(report);
        await this.kvCommand("set", `audit:${normalizedId}`, payload, "ex", 2592000);
        await this.kvCommand("set", `audit:domain:${canonicalDomain}`, normalizedId, "ex", 2592000);
        const recentList = await this.getRecentAudits();
        await this.kvCommand("set", "rankly:recent_audits", JSON.stringify(recentList));
      } catch (err) {
        console.warn("[AuditPersistenceEngine] KV replication warning:", err);
      }
    }

    // 4. Durable persistence — failures must propagate so the API can reject the audit
    const auditPayload = JSON.stringify(report);
    const auditWritten = await this.writeJsonFileRaw(`audit_${normalizedId}.json`, auditPayload);
    const domainWritten = canonicalDomain
      ? await this.writeJsonFile(`domain_${canonicalDomain}.json`, { auditId: normalizedId })
      : true;
    const allRecent = await this.getRecentAudits();
    const recentWritten = await this.writeJsonFile("recent_audits.json", allRecent);

    if (!auditWritten || !recentWritten || !domainWritten) {
      throw new PersistenceError(
        `Failed to persist audit ${normalizedId} to durable storage (Blob configured=${this.hasBlobStorage}).`
      );
    }

    // 5. Housekeeping: delete expired blobs (best-effort, non-blocking semantics)
    void this.runBlobRetentionSweep();
  }

  private async writeJsonFileRaw(filename: string, serialized: string): Promise<boolean> {
    if (typeof window !== "undefined" || !fs.promises) return false;
    const parsed = JSON.parse(serialized);
    return this.writeJsonFile(filename, parsed);
  }

  public async getAudit(idOrDomain: string): Promise<SeoAuditReport | null> {
    if (!idOrDomain) return null;
    const cleanKey = decodeURIComponent(idOrDomain).trim();

    if (cleanKey.toLowerCase() === "demo") {
      return DEMO_AUDIT;
    }

    const normalizedId = normalizeAuditId(cleanKey);
    const canonicalKey = extractCanonicalHostname(cleanKey);

    // 1. Check L1 Memory Cache (read optimization only)
    if (this.memoryCache.has(normalizedId)) {
      return this.memoryCache.get(normalizedId)!;
    }
    if (this.memoryCache.has(cleanKey.toLowerCase())) {
      return this.memoryCache.get(cleanKey.toLowerCase())!;
    }
    if (this.memoryCache.has(canonicalKey)) {
      return this.memoryCache.get(canonicalKey)!;
    }

    // 2. Check optional KV replica
    const kv = this.getKvConfig();
    if (kv) {
      try {
        let auditRaw = await this.kvCommand<string>("get", `audit:${normalizedId}`);
        if (!auditRaw && canonicalKey) {
          const mappedId = await this.kvCommand<string>("get", `audit:domain:${canonicalKey}`);
          if (mappedId) {
            auditRaw = await this.kvCommand<string>("get", `audit:${mappedId}`);
          }
        }
        if (auditRaw) {
          const report: SeoAuditReport = typeof auditRaw === "string" ? JSON.parse(auditRaw) : auditRaw;
          this.memoryCache.set(report.id, report);
          this.memoryCache.set(normalizedId, report);
          if (report.domain) {
            this.memoryCache.set(extractCanonicalHostname(report.domain), report);
          }
          return report;
        }
      } catch (err) {
        console.warn("[AuditPersistenceEngine] KV read error:", err);
      }
    }

    // 3. Check durable storage (Blob first, then filesystem mirror)
    try {
      let report = await this.readJsonFile<SeoAuditReport>(`audit_${normalizedId}.json`);
      if (!report && canonicalKey) {
        const domainMap = await this.readJsonFile<{ auditId: string }>(`domain_${canonicalKey}.json`);
        if (domainMap?.auditId) {
          report = await this.readJsonFile<SeoAuditReport>(`audit_${domainMap.auditId}.json`);
        }
      }

      if (report) {
        this.memoryCache.set(report.id, report);
        this.memoryCache.set(normalizedId, report);
        return report;
      }
    } catch {
      // Fall through to not-found
    }

    return null;
  }

  // --- RECENT / EXPLORE AUDITS ---
  public async getRecentAudits(): Promise<ExploreAuditRecord[]> {
    const now = Date.now();

    // 1. Try optional KV replica
    const kv = this.getKvConfig();
    if (kv) {
      try {
        const recentRaw = await this.kvCommand<string>("get", "rankly:recent_audits");
        if (recentRaw) {
          const parsed: ExploreAuditRecord[] = typeof recentRaw === "string" ? JSON.parse(recentRaw) : recentRaw;
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryRecent = parsed;
          }
        }
      } catch {
        // Fall back to memory/durable storage
      }
    }

    // 2. Read from durable storage if memory is empty
    if (this.memoryRecent.length === 0) {
      const persisted = await this.readJsonFile<ExploreAuditRecord[]>("recent_audits.json");
      if (persisted && Array.isArray(persisted)) {
        this.memoryRecent = persisted;
      }
    }

    // 3. Apply retention & format relative timestamps
    const { kept } = this.enforceRetention(this.memoryRecent);
    this.memoryRecent = kept;

    return this.memoryRecent.map((item) => {
      const diffMinutes = Math.floor((now - item.timestamp) / 60000);
      let timeAgo = "just now";
      if (diffMinutes >= 60 * 24) {
        const days = Math.floor(diffMinutes / (60 * 24));
        timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (diffMinutes >= 60) {
        const hours = Math.floor(diffMinutes / 60);
        timeAgo = `${hours} hr${hours > 1 ? "s" : ""} ago`;
      } else if (diffMinutes > 0) {
        timeAgo = `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
      }
      return { ...item, timeAgo };
    });
  }

  private addToMemoryRecent(record: ExploreAuditRecord): void {
    this.memoryRecent = this.memoryRecent.filter(
      (item) => item.domain !== record.domain && item.id !== record.id
    );
    this.memoryRecent.unshift(record);
    if (this.memoryRecent.length > this.maxRecent) {
      this.memoryRecent = this.memoryRecent.slice(0, this.maxRecent);
    }
  }

  // --- 7-DAY DOMAIN COOLDOWN OPERATIONS ---
  public async saveDomainCooldown(domain: string, auditId: string, timestamp = Date.now()): Promise<void> {
    const canonical = extractCanonicalHostname(domain);
    const record: DomainCooldownRecord = { auditId, timestamp };

    // 1. Memory cache
    this.memoryCooldowns.set(canonical, record);

    // 2. Optional KV replica (7-day TTL = 604800s)
    const kv = this.getKvConfig();
    if (kv) {
      try {
        await this.kvCommand("set", `cooldown:${canonical}`, JSON.stringify(record), "ex", 604800);
      } catch {
        // ignore
      }
    }

    // 3. Durable storage (Blob in production)
    await this.writeJsonFile(`cooldown_${canonical}.json`, record);
  }

  public async getDomainCooldown(domain: string): Promise<DomainCooldownRecord | null> {
    const canonical = extractCanonicalHostname(domain);

    // 1. Memory cache
    if (this.memoryCooldowns.has(canonical)) {
      return this.memoryCooldowns.get(canonical)!;
    }

    // 2. Optional KV replica
    const kv = this.getKvConfig();
    if (kv) {
      try {
        const raw = await this.kvCommand<string>("get", `cooldown:${canonical}`);
        if (raw) {
          const rec: DomainCooldownRecord = typeof raw === "string" ? JSON.parse(raw) : raw;
          this.memoryCooldowns.set(canonical, rec);
          return rec;
        }
      } catch {
        // ignore
      }
    }

    // 3. Durable storage
    try {
      const fileRec = await this.readJsonFile<DomainCooldownRecord>(`cooldown_${canonical}.json`);
      if (fileRec) {
        this.memoryCooldowns.set(canonical, fileRec);
        return fileRec;
      }
    } catch {
      // ignore
    }

    return null;
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
    this.memoryCooldowns.clear();
    this.memoryRecent = [];
    this.lastWriteFingerprint.clear();
    this.preloadDemo();

    if (typeof window === "undefined" && typeof fs !== "undefined" && fs.promises) {
      try {
        const files = await fs.promises.readdir(this.storageDir);
        for (const file of files) {
          await fs.promises.unlink(path.join(this.storageDir, file)).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  }
}

// Global Singleton for HMR safety & shared instances
const globalForPersistence = globalThis as unknown as { __auditPersistenceEngine?: AuditPersistenceEngine };

if (!globalForPersistence.__auditPersistenceEngine) {
  globalForPersistence.__auditPersistenceEngine = new AuditPersistenceEngine();
}

export const persistenceEngine = globalForPersistence.__auditPersistenceEngine;
