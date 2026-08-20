import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "os";
import path from "path";
import fs from "fs";
import { AuditPersistenceEngine, normalizeAuditId } from "../src/lib/store/persistence";
import { DEMO_AUDIT } from "../src/lib/demo-data";
import { SeoAuditReport } from "../src/types/audit";

describe("Production Serverless Persistence & ID Normalization Tests", () => {
  let primaryEngine: AuditPersistenceEngine;
  let testStorageDir: string;

  beforeEach(async () => {
    testStorageDir = path.join(os.tmpdir(), `rankly-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    primaryEngine = new AuditPersistenceEngine(testStorageDir);
  });

  afterEach(async () => {
    try {
      if (fs.existsSync(testStorageDir)) {
        await fs.promises.rm(testStorageDir, { recursive: true, force: true });
      }
    } catch {}
  });

  it("normalizes audit IDs reliably across formats", () => {
    expect(normalizeAuditId("RKL-84AD35")).toBe("RKL-84AD35");
    expect(normalizeAuditId("rkl-84ad35")).toBe("RKL-84AD35");
    expect(normalizeAuditId("RKL%2D84AD35")).toBe("RKL-84AD35");
    expect(normalizeAuditId("84ad35")).toBe("RKL-84AD35");
    expect(normalizeAuditId("demo")).toBe("demo");
    expect(normalizeAuditId("DEMO")).toBe("demo");
    expect(normalizeAuditId("example.com")).toBe("example.com");
    expect(normalizeAuditId("https://www.example.com/path")).toBe("example.com");
  });

  it("persists audit in one context and successfully retrieves it in a completely fresh engine instance", async () => {
    const testAuditId = "RKL-84AD35";
    const testReport: SeoAuditReport = {
      ...DEMO_AUDIT,
      id: testAuditId,
      domain: "production-test.org",
      url: "https://production-test.org",
      overallScore: 89,
    };

    // 1. Persist audit using first context
    await primaryEngine.saveAudit(testReport);

    // 2. Instantiate a brand new storage context simulating a new Vercel serverless function container / cold start
    const freshContainerEngine = new AuditPersistenceEngine(testStorageDir);

    // 3. Fetch audit by ID from new container context
    const retrieved = await freshContainerEngine.getAudit(testAuditId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(testAuditId);
    expect(retrieved?.domain).toBe("production-test.org");
    expect(retrieved?.overallScore).toBe(89);

    // 4. Verify case-insensitive lookup
    const lowerRetrieved = await freshContainerEngine.getAudit("rkl-84ad35");
    expect(lowerRetrieved?.id).toBe(testAuditId);

    // 5. Verify URL encoded lookup
    const encodedRetrieved = await freshContainerEngine.getAudit("RKL%2D84AD35");
    expect(encodedRetrieved?.id).toBe(testAuditId);

    // 6. Verify canonical domain lookup
    const domainRetrieved = await freshContainerEngine.getAudit("production-test.org");
    expect(domainRetrieved?.id).toBe(testAuditId);
  });

  it("persists 7-day domain cooldowns across independent serverless instances", async () => {
    const domain = "cooldown-isolated.io";
    const auditId = "RKL-COOL99";

    // Record in instance A
    await primaryEngine.saveDomainCooldown(domain, auditId);

    // Read from independent instance B
    const separateInstance = new AuditPersistenceEngine(testStorageDir);
    const cooldownRecord = await separateInstance.getDomainCooldown(domain);

    expect(cooldownRecord).not.toBeNull();
    expect(cooldownRecord?.auditId).toBe(auditId);
    expect(cooldownRecord?.timestamp).toBeGreaterThan(0);
  });

  it("maintains recent audits index for Rankly Index across isolated containers", async () => {
    const audit1: SeoAuditReport = {
      ...DEMO_AUDIT,
      id: "RKL-AAA111",
      domain: "alpha.dev",
      overallScore: 92,
    };
    const audit2: SeoAuditReport = {
      ...DEMO_AUDIT,
      id: "RKL-BBB222",
      domain: "beta.dev",
      overallScore: 78,
    };

    await primaryEngine.saveAudit(audit1);
    await primaryEngine.saveAudit(audit2);

    // Read from fresh context
    const newContext = new AuditPersistenceEngine(testStorageDir);
    const recent = await newContext.getRecentAudits();

    expect(recent.length).toBeGreaterThanOrEqual(2);
    expect(recent.some((r) => r.domain === "alpha.dev" && r.id === "RKL-AAA111")).toBe(true);
    expect(recent.some((r) => r.domain === "beta.dev" && r.id === "RKL-BBB222")).toBe(true);
  });
});
