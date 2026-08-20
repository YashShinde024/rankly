import fs from "fs";
import path from "path";
import { ExploreAuditRecord, SeoAuditReport } from "@/types/audit";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { extractCanonicalHostname } from "@/lib/url";

export interface DomainCooldownRecord {
  auditId: string;
  timestamp: number;
}

export function normalizeAuditId(id: string): string {
  if (!id) return "";
  let clean = decodeURIComponent(id).trim();
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
  private readonly maxRecent = 50;
  private storageDir: string;
  private isServerless: boolean;

  constructor(customStorageDir?: string) {
    this.isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    // In serverless / Vercel, /tmp is available for local caching; in regular node/dev, use ./.data
    if (customStorageDir) {
      this.storageDir = customStorageDir;
    } else if (process.env.STORAGE_PATH) {
      this.storageDir = process.env.STORAGE_PATH;
    } else if (this.isServerless) {
      this.storageDir = path.join("/tmp", "rankly-data");
    } else {
      this.storageDir = path.join(process.cwd(), ".data");
    }

    // Preload demo audit into memory
    this.preloadDemo();
    // Attempt local storage directory creation if in Node environment
    this.ensureStorageDir();
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

  // --- KV / REST API CONFIGURATION ---
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

  private async kvCommand<T = any>(command: string, ...args: (string | number)[]): Promise<T | null> {
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

  // --- FILE STORAGE HELPERS ---
  private getFilePath(filename: string): string {
    return path.join(this.storageDir, filename);
  }

  private async readJsonFile<T>(filename: string): Promise<T | null> {
    if (typeof window !== "undefined" || !fs.promises) return null;
    try {
      const filePath = this.getFilePath(filename);
      const data = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  private async writeJsonFile<T>(filename: string, data: T): Promise<boolean> {
    if (typeof window !== "undefined" || !fs.promises) return false;
    try {
      this.ensureStorageDir();
      const filePath = this.getFilePath(filename);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch {
      return false;
    }
  }

  // --- AUDIT OPERATIONS ---
  public async saveAudit(report: SeoAuditReport): Promise<void> {
    const now = Date.now();
    const normalizedId = normalizeAuditId(report.id);
    const canonicalDomain = extractCanonicalHostname(report.domain);

    // 1. Update L1 In-Memory Cache
    this.memoryCache.set(normalizedId, report);
    this.memoryCache.set(normalizedId.toLowerCase(), report);
    this.memoryCache.set(canonicalDomain, report);
    this.memoryCache.set(report.domain.toLowerCase(), report);

    // 2. Add to Recent / Explore list
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

    // 3. Save to KV if configured
    const kv = this.getKvConfig();
    if (kv) {
      try {
        const payload = JSON.stringify(report);
        // Store under audit ID (e.g. audit:RKL-84AD35) with 30-day TTL (2592000s)
        await this.kvCommand("set", `audit:${normalizedId}`, payload, "ex", 2592000);
        await this.kvCommand("set", `audit:domain:${canonicalDomain}`, normalizedId, "ex", 2592000);
        // Save to recent list
        const recentList = await this.getRecentAudits();
        await this.kvCommand("set", "rankly:recent_audits", JSON.stringify(recentList));
      } catch (err) {
        console.warn("[AuditPersistenceEngine] KV write warning:", err);
      }
    }

    // 4. Save to File Storage (Local disk or serverless /tmp)
    try {
      await this.writeJsonFile(`audit_${normalizedId}.json`, report);
      if (canonicalDomain) {
        await this.writeJsonFile(`domain_${canonicalDomain}.json`, { auditId: normalizedId });
      }
      const allRecent = await this.getRecentAudits();
      await this.writeJsonFile("recent_audits.json", allRecent);
    } catch {
      // Ignore file storage errors if in strictly read-only environment
    }
  }

  public async getAudit(idOrDomain: string): Promise<SeoAuditReport | null> {
    if (!idOrDomain) return null;
    const cleanKey = decodeURIComponent(idOrDomain).trim();

    if (cleanKey.toLowerCase() === "demo") {
      return DEMO_AUDIT;
    }

    const normalizedId = normalizeAuditId(cleanKey);
    const canonicalKey = extractCanonicalHostname(cleanKey);

    // 1. Check L1 Memory Cache
    if (this.memoryCache.has(normalizedId)) {
      return this.memoryCache.get(normalizedId)!;
    }
    if (this.memoryCache.has(cleanKey.toLowerCase())) {
      return this.memoryCache.get(cleanKey.toLowerCase())!;
    }
    if (this.memoryCache.has(canonicalKey)) {
      return this.memoryCache.get(canonicalKey)!;
    }

    // 2. Check KV Store
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
          // Populate L1 cache
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

    // 3. Check File Storage
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
      // Fallback
    }

    return null;
  }

  // --- RECENT / EXPLORE AUDITS ---
  public async getRecentAudits(): Promise<ExploreAuditRecord[]> {
    const now = Date.now();

    // 1. Try KV
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
        // Fall back to memory/file
      }
    }

    // 2. Try File Storage if memory is empty
    if (this.memoryRecent.length === 0) {
      const fileRecent = await this.readJsonFile<ExploreAuditRecord[]>("recent_audits.json");
      if (fileRecent && Array.isArray(fileRecent)) {
        this.memoryRecent = fileRecent;
      }
    }

    // 3. Format relative timeAgo
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

    // 1. Memory
    this.memoryCooldowns.set(canonical, record);

    // 2. KV (7-day TTL = 604800s)
    const kv = this.getKvConfig();
    if (kv) {
      try {
        await this.kvCommand("set", `cooldown:${canonical}`, JSON.stringify(record), "ex", 604800);
      } catch {
        // ignore
      }
    }

    // 3. File
    try {
      await this.writeJsonFile(`cooldown_${canonical}.json`, record);
    } catch {
      // ignore
    }
  }

  public async getDomainCooldown(domain: string): Promise<DomainCooldownRecord | null> {
    const canonical = extractCanonicalHostname(domain);

    // 1. Memory
    if (this.memoryCooldowns.has(canonical)) {
      return this.memoryCooldowns.get(canonical)!;
    }

    // 2. KV
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

    // 3. File
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

export const persistenceEngine: AuditPersistenceEngine = globalForPersistence.__auditPersistenceEngine;
