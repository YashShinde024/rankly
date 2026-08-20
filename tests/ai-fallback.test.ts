import { describe, it, expect } from "vitest";
import { generateDeterministicAiFallback } from "../src/lib/ai/gemini";
import { AuditCheck } from "../src/types/audit";

describe("AI Fallback & Synthesis Tests", () => {
  it("gracefully generates structured insights when AI is offline or key missing", () => {
    const checks: AuditCheck[] = [
      {
        id: "onpage-meta-desc",
        category: "onpage",
        area: "SEO",
        title: "Meta Description Tag",
        description: "Evaluates meta description.",
        status: "error",
        severity: "high",
        impact: "high",
        recommendation: "Add a concise description between 120-160 characters.",
      },
      {
        id: "tech-https",
        category: "technical",
        area: "SEO",
        title: "HTTPS & SSL Encryption",
        description: "Enforces SSL.",
        status: "pass",
        severity: "info",
        impact: "high",
      },
    ];

    const fallback = generateDeterministicAiFallback(
      "example.com",
      75,
      {
        technical: { category: "technical", name: "Technical SEO", score: 90, weight: 0.25, passedCount: 1, warningCount: 0, errorCount: 0, summary: "" },
        onpage: { category: "onpage", name: "On-page SEO", score: 60, weight: 0.25, passedCount: 0, warningCount: 0, errorCount: 1, summary: "" },
        content: { category: "content", name: "Content", score: 80, weight: 0.15, passedCount: 1, warningCount: 0, errorCount: 0, summary: "" },
        social: { category: "social", name: "Social", score: 80, weight: 0.1, passedCount: 1, warningCount: 0, errorCount: 0, summary: "" },
        aeo: { category: "aeo", name: "AEO", score: 75, weight: 0.15, passedCount: 1, warningCount: 0, errorCount: 0, summary: "" },
        geo: { category: "geo", name: "GEO", score: 80, weight: 0.1, passedCount: 1, warningCount: 0, errorCount: 0, summary: "" },
      },
      checks
    );

    expect(fallback.aiInsight.overview).toContain("example.com");
    expect(fallback.aiInsight.strengths.length).toBeGreaterThan(0);
    expect(fallback.recommendations.length).toBeGreaterThan(0);
    expect(fallback.recommendations[0].priority).toBe("important");
  });
});
