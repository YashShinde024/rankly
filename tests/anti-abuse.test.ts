import { describe, it, expect, beforeEach } from "vitest";
import { antiAbuse } from "../src/lib/security/rate-limiter";
import { auditStore } from "../src/lib/store/audit-store";
import { DEMO_AUDIT } from "../src/lib/demo-data";

describe("7-Day Cooldown & Anti-Abuse Protection", () => {
  beforeEach(() => {
    antiAbuse.reset();
  });

  it("enforces strict 5 audits per IP rate limiting with retry indicator", () => {
    const testIp = "198.51.100.42";

    for (let i = 0; i < 5; i++) {
      const res = antiAbuse.checkIpLimit(testIp);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(4 - i);
    }

    const blocked = antiAbuse.checkIpLimit(testIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("enforces 7-day domain cooldown on normalized hostnames", () => {
    const domain = "sampledomain.com";
    antiAbuse.recordDomainAudit(domain, "RKL-TEST01");

    // Immediate re-audit attempt should be blocked
    const check = antiAbuse.checkDomainCooldown(domain);
    expect(check.allowed).toBe(false);
    expect(check.cooldownActive).toBe(true);
    expect(check.existingAuditId).toBe("RKL-TEST01");
    expect(check.cooldownRemainingSeconds).toBeGreaterThan(6 * 24 * 60 * 60);
    expect(check.nextAllowedDate).toBeDefined();

    // Re-audit with www. should also be blocked (same canonical hostname)
    const checkWww = antiAbuse.checkDomainCooldown("www.sampledomain.com");
    expect(checkWww.allowed).toBe(false);
  });

  it("allows new audit once 7-day cooldown expires", () => {
    const domain = "expired-cooldown.com";
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    antiAbuse.recordDomainAudit(domain, "RKL-OLD01", eightDaysAgo);

    const check = antiAbuse.checkDomainCooldown(domain);
    expect(check.allowed).toBe(true);
    expect(check.cooldownActive).toBe(false);
  });

  it("allows different domains from the same IP within limit", () => {
    const testIp = "198.51.100.99";
    expect(antiAbuse.checkIpLimit(testIp).allowed).toBe(true);
    expect(antiAbuse.checkDomainCooldown("first-domain.com").allowed).toBe(true);

    antiAbuse.recordDomainAudit("first-domain.com", "RKL-D1");
    expect(antiAbuse.checkDomainCooldown("first-domain.com").allowed).toBe(false);
    expect(antiAbuse.checkDomainCooldown("second-domain.com").allowed).toBe(true);
  });

  it("persists sanitized audits into Rankly Index correctly with canonical domains", () => {
    auditStore.clear();
    expect(auditStore.getRecent().length).toBe(0);

    auditStore.set(DEMO_AUDIT);
    const recent = auditStore.getRecent();
    expect(recent.length).toBe(1);
    expect(recent[0].domain).toBe("example.com");
    expect(recent[0].overallScore).toBe(DEMO_AUDIT.overallScore);
    expect(recent[0].pillars.seo).toBe(DEMO_AUDIT.pillars.seo.score);
  });
});
