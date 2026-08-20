import { NextRequest, NextResponse } from "next/server";
import { validateAndNormalizeUrl } from "@/lib/security/ssrf";
import { antiAbuse } from "@/lib/security/rate-limiter";
import { fetchAuxiliaryFile, fetchWebsite, FetchError } from "@/lib/seo/fetcher";
import { parseHtml } from "@/lib/seo/parser";
import { analyzeSeo } from "@/lib/seo/analyzer";
import { calculateIntelligenceScores } from "@/lib/seo/scorer";
import { analyzeWithGemini } from "@/lib/ai/gemini";
import { auditStore } from "@/lib/store/audit-store";
import { detectPageType } from "@/lib/seo/page-classifier";
import { SeoAuditReport } from "@/types/audit";

function generateAuditRef(): string {
  const chars = "0123456789ABCDEF";
  let hex = "";
  for (let i = 0; i < 6; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RKL-${hex}`;
}

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (5 audits / IP / hour)
  const clientIp = antiAbuse.extractClientIp(req);
  const ipCheck = antiAbuse.checkIpLimit(clientIp);

  if (!ipCheck.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "You've reached the current audit limit (5 audits per hour). Please try again later.",
        retryAfter: ipCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": ipCheck.retryAfterSeconds.toString() },
      }
    );
  }

  // 2. Request body validation
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Malformed JSON request body." },
      { status: 400 }
    );
  }

  const { url } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "MISSING_URL", message: "Enter a valid public website URL." },
      { status: 400 }
    );
  }

  // 3. Canonical URL Validation & SSRF Guard (Single source of truth)
  const validation = validateAndNormalizeUrl(url);
  if (!validation.isValid || !validation.normalizedUrl || !validation.domain) {
    return NextResponse.json(
      { error: "INVALID_URL", message: validation.error || "That doesn't look like a valid website URL." },
      { status: 400 }
    );
  }

  const canonicalHostname = validation.domain;

  // 4. Strict 7-Day Server-Side Domain Cooldown Enforcement
  // Check the persistent audit store before consuming crawler or AI resources.
  const domainCheck = antiAbuse.checkDomainCooldown(canonicalHostname);
  if (!domainCheck.allowed && domainCheck.existingAuditId) {
    const existingReport = auditStore.get(domainCheck.existingAuditId);
    return NextResponse.json(
      {
        error: "DOMAIN_COOLDOWN",
        message: `This website was recently analyzed. ${canonicalHostname} can be analyzed again on: ${domainCheck.nextAllowedDate || "7 days from scan"}.`,
        domain: canonicalHostname,
        existingAuditId: domainCheck.existingAuditId,
        nextAllowedDate: domainCheck.nextAllowedDate,
        cooldownRemainingSeconds: domainCheck.cooldownRemainingSeconds,
        report: existingReport || undefined,
      },
      { status: 409 }
    );
  }

  // 5. Server Concurrency Throttling
  if (!antiAbuse.acquireConcurrency()) {
    return NextResponse.json(
      {
        error: "SERVER_CAPACITY",
        message: "Rankly is processing several audits right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  try {
    // 6. Fetch Website HTML & Server Headers
    const targetUrl = validation.normalizedUrl;
    const fetchResult = await fetchWebsite(targetUrl);

    // 7. Parallel Probes for robots.txt & sitemap.xml
    const baseUrl = new URL(fetchResult.finalUrl).origin;
    const [robotsTxt, sitemapXml] = await Promise.all([
      fetchAuxiliaryFile(baseUrl, "/robots.txt"),
      fetchAuxiliaryFile(baseUrl, "/sitemap.xml"),
    ]);

    // 8. Cheerio DOM & Signal Parser
    const parsedDoc = parseHtml(fetchResult.html, fetchResult.finalUrl);

    // 9. Page-Type Detection (Deterministic classification)
    const pageType = detectPageType(parsedDoc, fetchResult.finalUrl);

    // 10. SEO, AEO, and GEO Deterministic Analyzers (Page-Type Aware)
    const checks = analyzeSeo(fetchResult, parsedDoc, robotsTxt, sitemapXml, pageType);

    // 11. Multi-Pillar Strict Scoring Engine with Deductions & Mathematical Breakdown
    const {
      overallScore,
      scoreInterpretation,
      scoreDeductions,
      scoreBreakdown,
      executiveSummary,
      pillars,
      categories,
      aeoSignals,
      geoSignals,
      visibilityRadar,
      summary,
      nextSteps,
    } = calculateIntelligenceScores(checks, parsedDoc, pageType);

    // 12. AI Layer (Gemini with Resilient Fallback)
    const { aiInsight, recommendations } = await analyzeWithGemini(
      canonicalHostname,
      overallScore,
      categories,
      checks
    );

    // 13. Build Final Structured Report with Verified Canonical Identity
    const totalImgs = parsedDoc.images.length;
    const missingAltCount = parsedDoc.images.filter((img) => !img.hasAlt).length;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) +
      " IST";

    const auditId = generateAuditRef();

    const report: SeoAuditReport = {
      id: auditId,
      url: fetchResult.finalUrl,
      domain: canonicalHostname,
      title: parsedDoc.title || `${canonicalHostname} — Search & AI Visibility Intelligence`,
      pageType,
      timestamp: "Scanned just now",
      formattedDate,
      overallScore,
      scoreInterpretation,
      scoreDeductions,
      scoreBreakdown,
      executiveSummary,
      pillars,
      categories,
      summary,
      snapshot: {
        domain: canonicalHostname,
        title: parsedDoc.title || "Not detected",
        titleLength: parsedDoc.title?.length || 0,
        metaDescriptionPresent: Boolean(parsedDoc.metaDescription),
        metaDescriptionLength: parsedDoc.metaDescription?.length || 0,
        h1Count: parsedDoc.h1s.length,
        h1Text: parsedDoc.h1s[0] || undefined,
        totalImages: totalImgs,
        imagesMissingAlt: missingAltCount,
        internalLinksCount: parsedDoc.internalLinks.length,
        externalLinksCount: parsedDoc.externalLinks.length,
        hasSchemaJsonLd: parsedDoc.jsonLdBlocks.length > 0,
        schemaTypesCount: parsedDoc.schemaTypes.length,
        schemaTypes: parsedDoc.schemaTypes,
        hasOpenGraph: Boolean(parsedDoc.ogTitle || parsedDoc.ogImage),
        hasTwitterCard: Boolean(parsedDoc.twitterCard),
        wordCount: parsedDoc.wordCount,
        isHttps: fetchResult.isHttps,
        httpStatus: fetchResult.status,
        responseTimeMs: fetchResult.responseTimeMs,
        contentType: fetchResult.contentType,
        headingCounts: {
          h1: parsedDoc.h1s.length,
          h2: parsedDoc.h2s.length,
          h3: parsedDoc.h3s.length,
          h4: parsedDoc.h4s.length,
        },
      },
      headingTree: parsedDoc.headingTree,
      aeoSignals,
      geoSignals,
      visibilityRadar,
      checks,
      aiInsight,
      recommendations,
      nextSteps,
      technicalDetails: {
        protocol: fetchResult.isHttps ? "HTTPS" : "HTTP",
        httpStatus: fetchResult.status,
        responseTimeMs: fetchResult.responseTimeMs,
        contentType: fetchResult.contentType,
        contentLengthBytes: fetchResult.contentLength,
        redirectCount: fetchResult.redirectCount,
        canonicalUrl: parsedDoc.canonicalUrl,
        robotsTxtStatus: robotsTxt.exists ? `Found (${robotsTxt.status} OK)` : "Not found",
        sitemapStatus: sitemapXml.exists ? `Found (${sitemapXml.status} OK)` : "Not found",
        viewport: parsedDoc.viewport,
        robotsMeta: parsedDoc.robotsMeta || "index, follow",
      },
    };

    // 14. Persist in Store & Record Domain Audit for 7-Day Cooldown
    auditStore.set(report);
    antiAbuse.recordDomainAudit(canonicalHostname, auditId);

    return NextResponse.json(
      {
        success: true,
        auditId: report.id,
        report,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof FetchError) {
      return NextResponse.json(
        {
          error: err.message,
          message: err.userMessage,
        },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred while analyzing the website. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    antiAbuse.releaseConcurrency();
  }
}
