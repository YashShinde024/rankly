const PREFIX = "rankly:audit:";

export function cacheAuditReport(auditId: string, report: unknown): void {
  if (typeof window === "undefined" || !auditId || !report) return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${auditId}`, JSON.stringify(report));
  } catch {
    // Storage full or unavailable — best-effort only
  }
}

export function getCachedAuditReport<T = unknown>(auditId: string): T | null {
  if (typeof window === "undefined" || !auditId) return null;
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${auditId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearCachedAuditReport(auditId: string): void {
  if (typeof window === "undefined" || !auditId) return;
  try {
    window.sessionStorage.removeItem(`${PREFIX}${auditId}`);
  } catch {}
}
