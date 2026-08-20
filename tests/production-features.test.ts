import { describe, it, expect } from "vitest";
import { rateLimiter } from "../src/lib/security/rate-limiter";
import { sanitizeFilename } from "../src/app/api/audit/[id]/pdf/route";
import { auditStore } from "../src/lib/store/audit-store";
import { generateAuditPdfHtml } from "../src/lib/pdf/generate-pdf";
import { DEMO_AUDIT } from "../src/lib/demo-data";

describe("Production Audit Engine, PDF & Explore Tests", () => {
  it("enforces 5 audits per IP rate limiting strictly", () => {
    const testIp = "203.0.113.195";
    rateLimiter.reset(testIp);

    for (let i = 0; i < 5; i++) {
      const res = rateLimiter.check(testIp);
      expect(res.allowed).toBe(true);
    }

    const blocked = rateLimiter.check(testIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("sanitizes filenames safely for PDF downloads", () => {
    expect(sanitizeFilename("https://example.com/path?token=123")).toBe("https-example-com-path-token-123");
    expect(sanitizeFilename("linear.app")).toBe("linear-app");
    expect(sanitizeFilename("github.com/org/repo")).toBe("github-com-org-repo");
  });

  it("generates valid structured PDF HTML document", () => {
    const pdfHtml = generateAuditPdfHtml(DEMO_AUDIT);
    expect(pdfHtml).toContain("rankly");
    expect(pdfHtml).toContain("example.com");
    expect(pdfHtml).toContain("Search (SEO)");
    expect(pdfHtml).toContain("Page Health Snapshot");
    expect(pdfHtml).toContain("Your Next 3 Moves");
  });

  it("records sanitized audits to the public explore index", async () => {
    await auditStore.set(DEMO_AUDIT);
    const recent = await auditStore.getRecent();
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0].domain).toBe("example.com");
    expect(recent[0].overallScore).toBe(DEMO_AUDIT.overallScore);
    expect(recent[0].pillars.seo).toBeDefined();
  });
});
