import { ExploreAuditRecord, SeoAuditReport } from "@/types/audit";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { extractCanonicalHostname } from "@/lib/url";

interface CacheEntry {
  report: SeoAuditReport;
  createdAt: number;
}

class AuditStore {
  private cache = new Map<string, CacheEntry>();
  private recentAudits: ExploreAuditRecord[] = [];
  private readonly maxRecent = 50;

  constructor() {
    const now = Date.now();
    // Preload demo audit
    this.cache.set("demo", {
      report: DEMO_AUDIT,
      createdAt: now,
    });
    this.cache.set(DEMO_AUDIT.id, {
      report: DEMO_AUDIT,
      createdAt: now,
    });
    this.cache.set(DEMO_AUDIT.domain.toLowerCase(), {
      report: DEMO_AUDIT,
      createdAt: now,
    });
  }

  public set(report: SeoAuditReport): void {
    const now = Date.now();
    this.cache.set(report.id, {
      report,
      createdAt: now,
    });

    const canonicalDomain = extractCanonicalHostname(report.domain);
    this.cache.set(canonicalDomain, {
      report,
      createdAt: now,
    });

    // Also index under the audit's explicit normalized hostname
    if (report.domain.toLowerCase() !== canonicalDomain) {
      this.cache.set(report.domain.toLowerCase(), {
        report,
        createdAt: now,
      });
    }

    // Add sanitized record to public index list
    this.addToRecent({
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
    });
  }

  public get(idOrDomain: string): SeoAuditReport | null {
    const key = idOrDomain.toLowerCase().trim();
    if (key === "demo") return DEMO_AUDIT;

    // Check direct ID or key in cache
    const entry = this.cache.get(key);
    if (entry) return entry.report;

    const byId = this.cache.get(idOrDomain);
    if (byId) return byId.report;

    // Try canonical hostname resolution
    const canonicalKey = extractCanonicalHostname(idOrDomain);
    const canonicalEntry = this.cache.get(canonicalKey);
    if (canonicalEntry) return canonicalEntry.report;

    return null;
  }

  public getRecent(): ExploreAuditRecord[] {
    const now = Date.now();
    return this.recentAudits.map((item) => {
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

  private addToRecent(record: ExploreAuditRecord): void {
    this.recentAudits = this.recentAudits.filter(
      (item) => item.domain !== record.domain && item.id !== record.id
    );
    this.recentAudits.unshift(record);

    if (this.recentAudits.length > this.maxRecent) {
      this.recentAudits = this.recentAudits.slice(0, this.maxRecent);
    }
  }

  public clear(): void {
    this.cache.clear();
    this.recentAudits = [];
  }
}

// HMR-safe: Attach to globalThis so the store survives Next.js hot module reloads.
// Without this, every HMR reload creates a fresh empty AuditStore, losing all audit data.
const globalForStore = globalThis as unknown as { __auditStore?: AuditStore };

if (!globalForStore.__auditStore) {
  globalForStore.__auditStore = new AuditStore();
}

export const auditStore: AuditStore = globalForStore.__auditStore;
