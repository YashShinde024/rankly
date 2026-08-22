import { NextRequest, NextResponse } from "next/server";
import { validateAndNormalizeUrl } from "@/lib/security/ssrf";
import { antiAbuse } from "@/lib/security/rate-limiter";
import { fetchAuxiliaryFile, fetchWebsite, FetchError } from "@/lib/seo/fetcher";
import { parseHtml } from "@/lib/seo/parser";
import { analyzeSeo } from "@/lib/seo/analyzer";
import { calculateIntelligenceScores } from "@/lib/seo/scorer";
import { analyzeWithGemini } from "@/lib/ai/gemini";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import {
  getAdminDb,
  verifyAuthToken,
} from "@/lib/firebase/admin";
import {
  saveAuditToFirestore,
  getAuditFromFirestore,
  recordDomainAuditInFirestore,
  getDomainCooldown,
  isGuestAuditUsed,
  markGuestAuditUsed,
} from "@/lib/firebase/firestore-repo";
import { attachGuestCookie, readGuestId, createGuestId } from "@/lib/auth/guest";
import type { AuditVisibility } from "@/lib/firebase/firestore-repo";
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

export const maxDuration = 30; // 30s timeout for Vercel Serverless
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let currentStage = "VALIDATING";

  // 1. IP Rate Limiting (5 audits / IP / hour)
  const clientIp = antiAbuse.extractClientIp(req);
  const ipCheck = antiAbuse.checkIpLimit(clientIp);

  if (!ipCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        stage: "VALIDATING",
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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, stage: "VALIDATING", error: "INVALID_JSON", message: "Malformed JSON request body." },
      { status: 400 }
    );
  }

  const { url, websiteType, goals } = (body ?? {}) as {
    url?: unknown;
    websiteType?: unknown;
    goals?: unknown;
  };
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { success: false, stage: "VALIDATING", error: "MISSING_URL", message: "Enter a valid public website URL." },
      { status: 400 }
    );
  }

  // 3. Canonical URL Validation & SSRF Guard (Single source of truth)
  const validation = validateAndNormalizeUrl(url);
  if (!validation.isValid || !validation.normalizedUrl || !validation.domain) {
    return NextResponse.json(
      { success: false, stage: "VALIDATING", error: "INVALID_URL", message: validation.error || "That doesn't look like a valid website URL." },
      { status: 400 }
    );
  }

  const canonicalHostname = validation.domain;
  const db = getAdminDb();

  // 4. Authentication context (optional — guests are supported)
  const authCtx = await verifyAuthToken(req.headers.get("authorization"));

  // 4b. Resolve guest identity (signed httpOnly cookie) for unauthenticated users
  let guestId: string | null = null;
  if (!authCtx && db) {
    guestId = readGuestId(req) ?? createGuestId();
  }

  // 5. Strict 7-Day Server-Side Domain Cooldown Enforcement
  // Returning an EXISTING public report is never a new audit — allowed for everyone.
  let domainCheck = await antiAbuse.checkDomainCooldown(canonicalHostname);
  if (db) {
    const fsCooldown = await getDomainCooldown(canonicalHostname).catch(() => null);
    const nowMs = Date.now();
    if (fsCooldown && fsCooldown.latestAuditId && fsCooldown.lastAuditAtMs > 0) {
      const elapsed = nowMs - fsCooldown.lastAuditAtMs;
      if (elapsed < 7 * 24 * 60 * 60 * 1000) {
        const remainingSec = Math.ceil((7 * 24 * 60 * 60 * 1000 - elapsed) / 1000);
        domainCheck = {
          allowed: false,
          cooldownActive: true,
          existingAuditId: fsCooldown.latestAuditId,
          cooldownRemainingSeconds: remainingSec,
          nextAllowedDate: new Date(fsCooldown.nextAllowedAtMs).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        };
      } else {
        domainCheck = { allowed: true, cooldownActive: false, cooldownRemainingSeconds: 0 };
      }
    }
  }

  if (!domainCheck.allowed && domainCheck.existingAuditId) {
    // Visibility check for the cached report before returning it
    let existingReport: SeoAuditReport | null | undefined = await auditStore.get(domainCheck.existingAuditId);
    if (db) {
      const fsReport = await getAuditFromFirestore(domainCheck.existingAuditId).catch(() => null);
      if (fsReport) {
        if (fsReport.visibility === "private" && fsReport.userId !== authCtx?.uid) {
          existingReport = null;
        } else {
          existingReport = fsReport.report;
        }
      }
    }
    if (existingReport) {
      const res = NextResponse.json(
        {
          success: true,
          stage: "DOMAIN_COOLDOWN",
          error: "DOMAIN_COOLDOWN",
          message: `This website was recently analyzed. ${canonicalHostname} can be analyzed again on: ${domainCheck.nextAllowedDate || "7 days from scan"}.`,
          domain: canonicalHostname,
          existingAuditId: domainCheck.existingAuditId,
          auditId: domainCheck.existingAuditId,
          nextAllowedDate: domainCheck.nextAllowedDate,
          cooldownRemainingSeconds: domainCheck.cooldownRemainingSeconds,
          report: existingReport,
        },
        { status: 409 }
      );
      if (guestId) attachGuestCookie(res, guestId);
      return res;
    }
  }

  // 6. Guest usage limit — exactly ONE successful audit per guest.
  // Checked only when we're about to run a NEW analysis; failures/cooldown
  // returns above never consume or block the free audit.
  if (!authCtx && guestId && db) {
    const used = await isGuestAuditUsed(guestId).catch(() => false);
    if (used) {
      const res = NextResponse.json(
        {
          success: false,
          stage: "AUTH_REQUIRED",
          error: "GUEST_LIMIT_REACHED",
          message:
            "You've used your free report. Create a free Rankly account to continue analyzing websites and keep your reports in one place.",
        },
        { status: 403 }
      );
      attachGuestCookie(res, guestId);
      return res;
    }
  }

  // 5. Server Concurrency Throttling
  if (!antiAbuse.acquireConcurrency()) {
    return NextResponse.json(
      {
        success: false,
        stage: "SERVER_CAPACITY",
        error: "SERVER_CAPACITY",
        message: "Rankly is processing several audits right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  try {
    // 6. Fetch Website HTML & Server Headers
    currentStage = "FETCHING_WEBSITE";
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
    currentStage = "ANALYZING_SIGNALS";
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
    currentStage = "GENERATING_AI_INSIGHTS";
    let aiInsightResult: { aiInsight: SeoAuditReport["aiInsight"]; recommendations: SeoAuditReport["recommendations"] };
    try {
      aiInsightResult = await analyzeWithGemini(
        canonicalHostname,
        overallScore,
        categories,
        checks
      );
    } catch (aiErr) {
      console.warn("[POST /api/audit] Gemini AI error (falling back to deterministic):", aiErr);
      aiInsightResult = {
        aiInsight: {
          isAvailable: false,
          overview: `Website technical health for ${canonicalHostname} scored ${overallScore}/100. AI synthesis fell back to deterministic rules.`,
          strengths: ["Core web structure analyzed."],
          topPriorities: ["Review technical recommendations."],
        },
        recommendations: [],
      };
    }

    const { aiInsight, recommendations } = aiInsightResult;

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

    // 14. Persist to durable storage & record 7-day cooldown.
    // Persistence failure must fail the request — never return a success + dead link.
    // Firestore is the authoritative store; the legacy engine is a fallback when
    // Firebase is not configured. The guest audit is consumed ONLY after a
    // successful, verified save.
    currentStage = "SAVING_REPORT";
    const visibility: AuditVisibility = "public"; // product default; private is owner-opt-in later
    try {
      if (db) {
        await saveAuditToFirestore(report, {
          userId: authCtx?.uid ?? null,
          guestId: authCtx ? null : guestId,
          visibility,
          websiteType: typeof websiteType === "string" ? websiteType : "saas",
          analysisType: typeof goals === "string" ? goals : "all",
        });
        await recordDomainAuditInFirestore(canonicalHostname, auditId, now);
      } else {
        await auditStore.set(report);
        await antiAbuse.recordDomainAudit(canonicalHostname, auditId);
      }
    } catch (persistErr) {
      console.error(`[POST /api/audit] Durable persistence failed for ${auditId}:`, persistErr);
      const failRes = NextResponse.json(
        {
          success: false,
          stage: "SAVING_REPORT",
          error: "PERSISTENCE_FAILED",
          message:
            "Your website was analyzed successfully, but Rankly couldn't save the report right now. This is temporary — please try again in a moment.",
        },
        { status: 503 }
      );
      if (guestId) attachGuestCookie(failRes, guestId);
      return failRes;
    }

    // 15. Read the exact report back from durable storage before responding.
    let saved: SeoAuditReport | null = null;
    if (db) {
      const fsSaved = await getAuditFromFirestore(auditId).catch(() => null);
      saved = fsSaved?.report ?? null;
    } else {
      saved = await auditStore.get(auditId);
    }
    if (!saved || saved.overallScore !== report.overallScore) {
      console.error(`[POST /api/audit] Persistence verification failed for ${auditId}`);
      const verifyRes = NextResponse.json(
        {
          success: false,
          stage: "SAVING_REPORT",
          error: "PERSISTENCE_VERIFY_FAILED",
          message:
            "The report was generated but couldn't be verified in storage. Please try again in a moment.",
        },
        { status: 503 }
      );
      if (guestId) attachGuestCookie(verifyRes, guestId);
      return verifyRes;
    }

    // 16. Success — only now consume the guest's free audit (server-side record).
    if (guestId && db) {
      await markGuestAuditUsed(guestId, auditId, null).catch((e) =>
        console.warn("[POST /api/audit] Guest usage marking failed:", e)
      );
    }

    currentStage = "COMPLETE";
    const successRes = NextResponse.json(
      {
        success: true,
        stage: "COMPLETE",
        auditId: report.id,
        report,
      },
      { status: 200 }
    );
    if (guestId) attachGuestCookie(successRes, guestId);
    return successRes;
  } catch (err: unknown) {
    console.error(`[POST /api/audit] Failure at stage ${currentStage}:`, err);

    if (err instanceof FetchError) {
      return NextResponse.json(
        {
          success: false,
          stage: currentStage,
          error: err.message,
          message: err.userMessage,
        },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        stage: currentStage,
        error: "INTERNAL_ERROR",
        message:
          err instanceof Error && err.message
            ? err.message
            : "An unexpected error occurred while analyzing the website. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    antiAbuse.releaseConcurrency();
  }
}
