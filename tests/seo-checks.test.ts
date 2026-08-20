import { describe, it, expect } from "vitest";
import { parseHtml } from "../src/lib/seo/parser";
import { runOnPageChecks } from "../src/lib/seo/checks/on-page";
import { runTechnicalChecks } from "../src/lib/seo/checks/technical";
import { analyzeSeo } from "../src/lib/seo/analyzer";
import { calculateIntelligenceScores, getScoreInterpretation } from "../src/lib/seo/scorer";
import { detectPageType } from "../src/lib/seo/page-classifier";

describe("Strict SEO, AEO & GEO Scoring Engine", () => {
  const goodHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Rankly — AI Website Search and AI Visibility Intelligence</title>
        <meta name="description" content="Rankly analyzes your website technical and on-page SEO signals, answer-engine readiness, and AI discoverability signals with prioritized actions." />
        <link rel="canonical" href="https://rankly.app/" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Rankly SEO Platform" />
        <meta property="og:description" content="AI-assisted SEO checks and audits." />
        <meta property="og:image" content="https://rankly.app/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Rankly",
          "applicationCategory": "BusinessApplication"
        }
        </script>
      </head>
      <body>
        <h1>Understand how your website is seen by search & AI systems</h1>
        <h2>How does the SEO scoring engine calculate results?</h2>
        <p>Rankly evaluates 22 deterministic checks across traditional search, answer engines, and generative systems.</p>
        <h2>What is the difference between AEO and GEO?</h2>
        <p>AEO focuses on direct snippet extraction, while GEO grounds entities into AI knowledge graphs.</p>
        <section class="faq">
          <h3>Frequently Asked Questions</h3>
          <p>Answers to common questions about search and AI visibility.</p>
        </section>
        <img src="/hero.png" alt="Rankly Dashboard Visual" />
        <a href="/features">Features</a>
        <a href="https://github.com" rel="noopener noreferrer" target="_blank">External Link</a>
        <p>Visible body text content explaining all the features and tools offered by Rankly for modern web developers. Extensive copy providing valuable depth and context for readers with comprehensive details and technical instructions.</p>
      </body>
    </html>
  `;

  const weakHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <!-- Missing title, meta description, viewport, canonical -->
      </head>
      <body>
        <!-- Missing H1 -->
        <p>Bare text with no headings.</p>
        <img src="/unnamed.png" />
      </body>
    </html>
  `;

  it("classifies page types accurately", () => {
    const doc = parseHtml(goodHtml, "https://rankly.app");
    const pageType = detectPageType(doc, "https://rankly.app");
    expect(["Product / SaaS", "Homepage"]).toContain(pageType);
  });

  it("penalizes weak websites and caps scores below 50", () => {
    const doc = parseHtml(weakHtml, "https://weak-site.com");
    const checks = analyzeSeo(
      {
        url: "https://weak-site.com",
        finalUrl: "https://weak-site.com",
        status: 200,
        statusText: "OK",
        headers: {},
        html: weakHtml,
        responseTimeMs: 350,
        redirectCount: 0,
        isHttps: true,
        contentType: "text/html",
        contentLength: weakHtml.length,
      },
      doc,
      { url: "https://weak-site.com/robots.txt", status: 404, content: "", exists: false },
      { url: "https://weak-site.com/sitemap.xml", status: 404, content: "", exists: false },
      "Unknown"
    );

    const { overallScore, scoreInterpretation, scoreDeductions } = calculateIntelligenceScores(checks, doc, "Unknown");
    
    // Weak site with missing title and H1 MUST be capped below 50
    expect(overallScore).toBeLessThanOrEqual(48);
    expect(scoreInterpretation).toMatch(/attention|improvements/i);
    expect(scoreDeductions.length).toBeGreaterThan(3);
  });

  it("awards earned scores to strong websites without inflation", () => {
    const doc = parseHtml(goodHtml, "https://rankly.app");
    const checks = analyzeSeo(
      {
        url: "https://rankly.app",
        finalUrl: "https://rankly.app",
        status: 200,
        statusText: "OK",
        headers: {},
        html: goodHtml,
        responseTimeMs: 95,
        redirectCount: 0,
        isHttps: true,
        contentType: "text/html",
        contentLength: goodHtml.length,
      },
      doc,
      { url: "https://rankly.app/robots.txt", status: 200, content: "User-agent: *", exists: true },
      { url: "https://rankly.app/sitemap.xml", status: 200, content: "<xml></xml>", exists: true },
      "Product / SaaS"
    );

    const { overallScore, scoreBreakdown, pillars } = calculateIntelligenceScores(checks, doc, "Product / SaaS");
    
    expect(overallScore).toBeGreaterThanOrEqual(70);
    expect(overallScore).toBeLessThanOrEqual(95); // High scores must be genuinely earned
    expect(scoreBreakdown.technical.earned).toBeGreaterThan(20);
    expect(scoreBreakdown.onpage.earned).toBeGreaterThan(20);
    expect(pillars.aeo.score).toBeGreaterThan(65);
    expect(pillars.geo.score).toBeGreaterThan(70);
  });

  it("uses the new strict score interpretation bands", () => {
    expect(getScoreInterpretation(95)).toBe("Exceptional foundation");
    expect(getScoreInterpretation(85)).toBe("Strong, with room to refine");
    expect(getScoreInterpretation(75)).toBe("Good, but important gaps remain");
    expect(getScoreInterpretation(65)).toBe("Needs focused improvement");
    expect(getScoreInterpretation(45)).toBe("Several important issues need attention");
    expect(getScoreInterpretation(25)).toBe("Major improvements recommended");
  });
});
