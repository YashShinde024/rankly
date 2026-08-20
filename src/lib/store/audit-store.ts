import { ExploreAuditRecord, SeoAuditReport } from "@/types/audit";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { persistenceEngine, normalizeAuditId } from "./persistence";
import { extractCanonicalHostname } from "@/lib/url";

class AuditStoreWrapper {
  /**
   * Async retrieval from persistent storage (KV, file, memory)
   */
  public async get(idOrDomain: string): Promise<SeoAuditReport | null> {
    if (!idOrDomain) return null;
    return await persistenceEngine.getAudit(idOrDomain);
  }

  /**
   * Async persistence of audit report
   */
  public async set(report: SeoAuditReport): Promise<void> {
    await persistenceEngine.saveAudit(report);
  }

  /**
   * Async retrieval of recent audits for Rankly Index
   */
  public async getRecent(): Promise<ExploreAuditRecord[]> {
    return await persistenceEngine.getRecentAudits();
  }

  /**
   * Clear all stored audits & cache
   */
  public async clear(): Promise<void> {
    await persistenceEngine.clear();
  }

  /**
   * Synchronous fallback for demo or cached items
   */
  public getSync(idOrDomain: string): SeoAuditReport | null {
    if (!idOrDomain) return null;
    const cleanKey = decodeURIComponent(idOrDomain).trim();
    if (cleanKey.toLowerCase() === "demo") return DEMO_AUDIT;
    if (cleanKey.toLowerCase() === DEMO_AUDIT.id.toLowerCase()) return DEMO_AUDIT;
    if (cleanKey.toLowerCase() === DEMO_AUDIT.domain.toLowerCase()) return DEMO_AUDIT;
    return null;
  }
}

export const auditStore = new AuditStoreWrapper();
export { normalizeAuditId };
