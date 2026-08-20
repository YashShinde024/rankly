import { NextRequest } from "next/server";
import { persistenceEngine } from "@/lib/store/persistence";
import { extractCanonicalHostname } from "@/lib/url";

interface RateLimitRecord {
  timestamps: number[];
}

export interface DomainCooldownRecord {
  auditId: string;
  timestamp: number;
}

class AntiAbuseManager {
  private ipStore = new Map<string, RateLimitRecord>();
  private domainStore = new Map<string, DomainCooldownRecord>();
  private activeConcurrency = 0;
  private readonly maxConcurrency = 10;
  private readonly maxRequestsPerIp = 5;
  private readonly ipWindowMs = 60 * 60 * 1000; // 1 hour
  private readonly domainCooldownMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 60 * 60 * 1000);
    }
  }

  /**
   * Safely extract the client IP from proxy headers without trusting arbitrary client spoofing.
   */
  public extractClientIp(req: NextRequest): string {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      const clientIp = xForwardedFor.split(",")[0].trim();
      if (clientIp) return clientIp;
    }

    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp) return xRealIp.trim();

    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp.trim();

    return "127.0.0.1";
  }

  /**
   * IP Rate Limit: 5 audits per IP per hour
   */
  public checkIpLimit(ip: string): {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const windowStart = now - this.ipWindowMs;

    let record = this.ipStore.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.ipStore.set(ip, record);
    }

    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequestsPerIp) {
      const oldest = record.timestamps[0] || now;
      const resetTime = oldest + this.ipWindowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequestsPerIp - record.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Domain Cooldown: A normalized hostname can only receive one new public audit every 7 DAYS.
   * Returns recent auditId, next allowed date, and remaining seconds if existing audit is found within cooldown window.
   */
  public async checkDomainCooldown(domain: string): Promise<{
    allowed: boolean;
    cooldownActive: boolean;
    existingAuditId?: string;
    cooldownRemainingSeconds: number;
    nextAllowedDate?: string;
  }> {
    const now = Date.now();
    const canonical = extractCanonicalHostname(domain);

    // Check memory first, then persistent storage
    let existing = this.domainStore.get(canonical);
    if (!existing) {
      const persisted = await persistenceEngine.getDomainCooldown(canonical);
      if (persisted) {
        existing = persisted;
        this.domainStore.set(canonical, existing);
      }
    }

    if (existing) {
      const elapsed = now - existing.timestamp;
      if (elapsed < this.domainCooldownMs) {
        const remainingSec = Math.ceil((this.domainCooldownMs - elapsed) / 1000);
        const nextAllowedTimestamp = existing.timestamp + this.domainCooldownMs;
        const nextAllowedDate = new Date(nextAllowedTimestamp).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        return {
          allowed: false,
          cooldownActive: true,
          existingAuditId: existing.auditId,
          cooldownRemainingSeconds: remainingSec,
          nextAllowedDate,
        };
      }
    }

    return {
      allowed: true,
      cooldownActive: false,
      cooldownRemainingSeconds: 0,
    };
  }

  public async recordDomainAudit(domain: string, auditId: string, timestamp = Date.now()): Promise<void> {
    const canonical = extractCanonicalHostname(domain);
    this.domainStore.set(canonical, {
      auditId,
      timestamp,
    });
    await persistenceEngine.saveDomainCooldown(canonical, auditId, timestamp);
  }

  /**
   * Server Concurrency Protection
   */
  public acquireConcurrency(): boolean {
    if (this.activeConcurrency >= this.maxConcurrency) {
      return false;
    }
    this.activeConcurrency++;
    return true;
  }

  public releaseConcurrency(): void {
    this.activeConcurrency = Math.max(0, this.activeConcurrency - 1);
  }

  private cleanup(): void {
    const now = Date.now();
    const ipWindowStart = now - this.ipWindowMs;
    for (const [key, record] of this.ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > ipWindowStart);
      if (record.timestamps.length === 0) {
        this.ipStore.delete(key);
      }
    }

    const domainWindowStart = now - this.domainCooldownMs;
    for (const [domain, record] of this.domainStore.entries()) {
      if (record.timestamp < domainWindowStart) {
        this.domainStore.delete(domain);
      }
    }
  }

  public reset(identifier?: string): void {
    if (identifier) {
      this.ipStore.delete(identifier);
      this.domainStore.delete(extractCanonicalHostname(identifier));
    } else {
      this.ipStore.clear();
      this.domainStore.clear();
      this.activeConcurrency = 0;
    }
  }
}

export const antiAbuse = new AntiAbuseManager();
export const rateLimiter = {
  extractClientIp: (req: NextRequest) => antiAbuse.extractClientIp(req),
  check: (ip: string) => {
    const res = antiAbuse.checkIpLimit(ip);
    return {
      allowed: res.allowed,
      remaining: res.remaining,
      resetTime: Date.now() + res.retryAfterSeconds * 1000,
      retryAfterSeconds: res.retryAfterSeconds,
    };
  },
  reset: (ip: string) => antiAbuse.reset(ip),
};
