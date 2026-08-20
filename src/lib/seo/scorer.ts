import {
  AuditCategory,
  AuditCheck,
  CategoryScore,
  PillarArea,
  PillarScore,
  AeoSignals,
  GeoSignals,
  VisibilityRadarMetrics,
  ParsedSeoDoc,
  PageType,
  ScoreDeduction,
  ScoreBreakdown,
} from "@/types/audit";

/**
 * Strict Category Weights for SEO:
 * Technical SEO: 30%
 * On-page SEO: 30%
 * Content structure: 20%
 * Metadata & social: 10%
 * Accessibility signals: 10%
 *
 * For the 6 category scores in our system:
 * technical: 30%
 * onpage: 30%
 * content: 20%
 * social: 10%
 * aeo: 5% (evaluated independently for AEO Pillar)
 * geo: 5% (evaluated independently for GEO Pillar)
 */
export const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  technical: 0.30,
  onpage: 0.30,
  content: 0.20,
  social: 0.10,
  aeo: 0.05,
  geo: 0.05,
};

export const SCORING_WEIGHTS = CATEGORY_WEIGHTS;

const CATEGORY_NAMES: Record<AuditCategory, string> = {
  technical: "Technical SEO",
  onpage: "On-page SEO",
  content: "Content Structure",
  social: "Metadata & Social",
  aeo: "Answer Engine Optimization",
  geo: "Generative Engine Optimization",
};

/**
 * Stricter score interpretations:
 * 90–100 Exceptional foundation
 * 80–89 Strong, with room to refine
 * 70–79 Good, but important gaps remain
 * 60–69 Needs focused improvement
 * 40–59 Several important issues need attention
 * 0–39 Major improvements recommended
 */
export function getScoreInterpretation(score: number): string {
  if (score >= 90) return "Exceptional foundation";
  if (score >= 80) return "Strong, with room to refine";
  if (score >= 70) return "Good, but important gaps remain";
  if (score >= 60) return "Needs focused improvement";
  if (score >= 40) return "Several important issues need attention";
  return "Major improvements recommended";
}

export function calculateIntelligenceScores(
  checks: AuditCheck[],
  doc: ParsedSeoDoc,
  pageType: PageType = "Unknown"
): {
  overallScore: number;
  scoreInterpretation: string;
  scoreDeductions: ScoreDeduction[];
  scoreBreakdown: ScoreBreakdown;
  executiveSummary: {
    headline: string;
    subheadline: string;
    keyIssues: string[];
  };
  pillars: {
    seo: PillarScore;
    aeo: PillarScore;
    geo: PillarScore;
  };
  categories: Record<AuditCategory, CategoryScore>;
  aeoSignals: AeoSignals;
  geoSignals: GeoSignals;
  visibilityRadar: VisibilityRadarMetrics;
  summary: {
    criticalCount: number;
    warningCount: number;
    passedCount: number;
    totalChecks: number;
  };
  nextSteps: Array<{
    stepNumber: number;
    title: string;
    rationale: string;
    area: PillarArea;
  }>;
} {
  const categoryGroups: Record<AuditCategory, AuditCheck[]> = {
    technical: [],
    onpage: [],
    content: [],
    social: [],
    aeo: [],
    geo: [],
  };

  let criticalCount = 0;
  let warningCount = 0;
  let passedCount = 0;
  const scoreDeductions: ScoreDeduction[] = [];

  for (const check of checks) {
    if (!categoryGroups[check.category]) {
      categoryGroups[check.category] = [];
    }
    categoryGroups[check.category].push(check);

    if (check.status === "error") {
      criticalCount++;
    } else if (check.status === "warning") {
      warningCount++;
    } else if (check.status === "pass") {
      passedCount++;
    }
  }

  // --- Strict Category Point Calculation ---
  // Baseline existence (200, HTTPS, Title, H1) is required and does NOT automatically award high scores.
  // Instead, each category starts with 0 earned points and must earn points through complete compliance,
  // while critical errors incur severe point caps and penalties.

  // 1. Technical SEO (Max 30 points in weighted breakdown, scored 0-100 internally)
  let techPoints = 0;
  const techChecks = categoryGroups.technical || [];
  const httpsCheck = techChecks.find((c) => c.id === "tech-https");
  const statusCheck = techChecks.find((c) => c.id === "tech-status");
  const canonicalCheck = techChecks.find((c) => c.id === "tech-canonical");
  const viewportCheck = techChecks.find((c) => c.id === "tech-viewport");
  const indexCheck = techChecks.find((c) => c.id === "tech-indexability");
  const robotsCheck = techChecks.find((c) => c.id === "tech-robots");
  const sitemapCheck = techChecks.find((c) => c.id === "tech-sitemap");

  if (httpsCheck?.status === "pass") techPoints += 15;
  else scoreDeductions.push({ checkId: "tech-https", category: "technical", area: "SEO", impact: -20, reason: "Insecure HTTP (No SSL)" });

  if (statusCheck?.status === "pass") techPoints += 15;
  else if (statusCheck?.status === "warning") {
    techPoints += 8;
    scoreDeductions.push({ checkId: "tech-status", category: "technical", area: "SEO", impact: -7, reason: "Redirect status code detected" });
  } else {
    scoreDeductions.push({ checkId: "tech-status", category: "technical", area: "SEO", impact: -25, reason: "Non-200 HTTP response code" });
  }

  if (canonicalCheck?.status === "pass") techPoints += 20;
  else scoreDeductions.push({ checkId: "tech-canonical", category: "technical", area: "SEO", impact: -10, reason: "Missing canonical link tag" });

  if (viewportCheck?.status === "pass") techPoints += 20;
  else if (viewportCheck?.status === "warning") {
    techPoints += 10;
    scoreDeductions.push({ checkId: "tech-viewport", category: "technical", area: "SEO", impact: -10, reason: "Non-standard mobile viewport configuration" });
  } else {
    scoreDeductions.push({ checkId: "tech-viewport", category: "technical", area: "SEO", impact: -15, reason: "Missing mobile viewport tag" });
  }

  if (indexCheck?.status === "pass") techPoints += 15;
  else scoreDeductions.push({ checkId: "tech-indexability", category: "technical", area: "SEO", impact: -30, reason: "noindex directive active" });

  if (robotsCheck?.status === "pass") techPoints += 7;
  else scoreDeductions.push({ checkId: "tech-robots", category: "technical", area: "SEO", impact: -4, reason: "Missing or unreachable robots.txt" });

  if (sitemapCheck?.status === "pass") techPoints += 8;
  else scoreDeductions.push({ checkId: "tech-sitemap", category: "technical", area: "SEO", impact: -5, reason: "Missing XML sitemap" });

  let rawTechScore = Math.min(100, Math.max(0, techPoints));
  // Critical Caps: If noindex or non-200, cap Technical score at 35
  if (indexCheck?.status === "error" || statusCheck?.status === "error" || httpsCheck?.status === "error") {
    rawTechScore = Math.min(rawTechScore, 40);
  }

  // 2. On-Page SEO (Max 30 points in weighted breakdown, scored 0-100 internally)
  let onpagePoints = 0;
  const onpageChecks = categoryGroups.onpage || [];
  const titleCheck = onpageChecks.find((c) => c.id === "onpage-title");
  const metaDescCheck = onpageChecks.find((c) => c.id === "onpage-meta-desc");
  const h1Check = onpageChecks.find((c) => c.id === "onpage-h1");
  const hierarchyCheck = onpageChecks.find((c) => c.id === "onpage-hierarchy");
  const altCheck = onpageChecks.find((c) => c.id === "onpage-images-alt");
  const linksCheck = onpageChecks.find((c) => c.id === "onpage-links-empty");

  if (titleCheck?.status === "pass") onpagePoints += 25;
  else if (titleCheck?.status === "warning") {
    onpagePoints += 14;
    scoreDeductions.push({ checkId: "onpage-title", category: "onpage", area: "SEO", impact: -11, reason: "Title tag length suboptimal" });
  } else {
    scoreDeductions.push({ checkId: "onpage-title", category: "onpage", area: "SEO", impact: -25, reason: "Missing <title> tag" });
  }

  if (metaDescCheck?.status === "pass") onpagePoints += 20;
  else if (metaDescCheck?.status === "warning") {
    onpagePoints += 10;
    scoreDeductions.push({ checkId: "onpage-meta-desc", category: "onpage", area: "SEO", impact: -8, reason: "Meta description length suboptimal" });
  } else {
    scoreDeductions.push({ checkId: "onpage-meta-desc", category: "onpage", area: "SEO", impact: -15, reason: "Missing meta description" });
  }

  if (h1Check?.status === "pass") onpagePoints += 25;
  else if (h1Check?.status === "warning") {
    onpagePoints += 12;
    scoreDeductions.push({ checkId: "onpage-h1", category: "onpage", area: "SEO", impact: -8, reason: "Multiple H1 headings detected" });
  } else {
    scoreDeductions.push({ checkId: "onpage-h1", category: "onpage", area: "SEO", impact: -20, reason: "Missing H1 heading" });
  }

  if (hierarchyCheck?.status === "pass") onpagePoints += 12;
  else if (hierarchyCheck?.status === "warning") {
    onpagePoints += 5;
    scoreDeductions.push({ checkId: "onpage-hierarchy", category: "onpage", area: "SEO", impact: -5, reason: "Skipped heading hierarchy levels" });
  }

  if (altCheck?.status === "pass") onpagePoints += 10;
  else {
    onpagePoints += 4;
    scoreDeductions.push({ checkId: "onpage-images-alt", category: "onpage", area: "SEO", impact: -6, reason: "Images missing alt text" });
  }

  if (linksCheck?.status === "pass") onpagePoints += 8;
  else {
    onpagePoints += 3;
    scoreDeductions.push({ checkId: "onpage-links-empty", category: "onpage", area: "SEO", impact: -4, reason: "Empty anchor links without text" });
  }

  let rawOnpageScore = Math.min(100, Math.max(0, onpagePoints));
  // Critical Caps: If no title or no H1, cap On-Page at 45
  if (titleCheck?.status === "error" || h1Check?.status === "error") {
    rawOnpageScore = Math.min(rawOnpageScore, 45);
  }

  // 3. Content Structure (Max 20 points, scored 0-100 internally)
  let contentPoints = 0;
  const contentChecks = categoryGroups.content || [];
  const wordCheck = contentChecks.find((c) => c.id === "content-word-count");
  const schemaCheck = contentChecks.find((c) => c.id === "content-schema");
  const langCheck = contentChecks.find((c) => c.id === "content-lang");

  if (wordCheck?.status === "pass") contentPoints += 40;
  else {
    contentPoints += 15;
    scoreDeductions.push({ checkId: "content-word-count", category: "content", area: "SEO", impact: -10, reason: "Thin content volume (< 150 words)" });
  }

  if (schemaCheck?.status === "pass") contentPoints += 40;
  else {
    contentPoints += 10;
    scoreDeductions.push({ checkId: "content-schema", category: "content", area: "SEO", impact: -8, reason: "Missing Schema.org structured data" });
  }

  if (langCheck?.status === "pass") contentPoints += 20;
  else {
    scoreDeductions.push({ checkId: "content-lang", category: "content", area: "SEO", impact: -5, reason: "Missing HTML lang declaration" });
  }

  const rawContentScore = Math.min(100, Math.max(0, contentPoints));

  // 4. Metadata & Social (Max 10 points, scored 0-100 internally)
  let socialPoints = 0;
  const socialChecks = categoryGroups.social || [];
  const ogTitle = socialChecks.find((c) => c.id === "social-og-title");
  const ogDesc = socialChecks.find((c) => c.id === "social-og-desc");
  const ogImg = socialChecks.find((c) => c.id === "social-og-image");
  const twCard = socialChecks.find((c) => c.id === "social-twitter-card");

  if (ogTitle?.status === "pass") socialPoints += 30;
  else scoreDeductions.push({ checkId: "social-og-title", category: "social", area: "SEO", impact: -4, reason: "Missing og:title tag" });

  if (ogDesc?.status === "pass") socialPoints += 25;
  else scoreDeductions.push({ checkId: "social-og-desc", category: "social", area: "SEO", impact: -3, reason: "Missing og:description tag" });

  if (ogImg?.status === "pass") socialPoints += 30;
  else scoreDeductions.push({ checkId: "social-og-image", category: "social", area: "SEO", impact: -5, reason: "Missing og:image social card preview" });

  if (twCard?.status === "pass") socialPoints += 15;

  const rawSocialScore = Math.min(100, Math.max(0, socialPoints));

  // 5. Strict AEO Pillar Scoring (0-100)
  // Must NOT receive 90+ simply for having headings.
  let aeoPoints = 0;
  const aeoChecksList = categoryGroups.aeo || [];
  const aeoQa = aeoChecksList.find((c) => c.id === "aeo-qa-structure");
  const aeoFaq = aeoChecksList.find((c) => c.id === "aeo-faq-pattern");
  const aeoDepth = aeoChecksList.find((c) => c.id === "aeo-concise-answers");

  if (aeoQa?.status === "pass") aeoPoints += 45;
  else if (aeoQa?.status === "warning") {
    aeoPoints += 25;
    scoreDeductions.push({ checkId: "aeo-qa-structure", category: "aeo", area: "AEO", impact: -10, reason: "Few question-oriented headings" });
  } else {
    scoreDeductions.push({ checkId: "aeo-qa-structure", category: "aeo", area: "AEO", impact: -20, reason: "No question-oriented headings for answer mapping" });
  }

  if (aeoFaq?.status === "pass") aeoPoints += 25;
  else if (aeoFaq?.status === "warning") {
    aeoPoints += 12;
    scoreDeductions.push({ checkId: "aeo-faq-pattern", category: "aeo", area: "AEO", impact: -8, reason: "No dedicated FAQ section or Q&A markup" });
  }

  if (aeoDepth?.status === "pass") aeoPoints += 30;
  else if (aeoDepth?.status === "warning") {
    aeoPoints += 15;
    scoreDeductions.push({ checkId: "aeo-concise-answers", category: "aeo", area: "AEO", impact: -6, reason: "Moderate textual depth for snippet quotation" });
  } else {
    scoreDeductions.push({ checkId: "aeo-concise-answers", category: "aeo", area: "AEO", impact: -15, reason: "Thin content (< 150 words) unsuitable for direct answer extraction" });
  }

  let rawAeoScore = Math.min(100, Math.max(0, aeoPoints));
  // AEO Cap: If page has 0 question headings and no FAQ/Q&A structure, cap AEO at 48
  if (doc.questionHeadingsCount === 0 && !doc.faqDetected) {
    rawAeoScore = Math.min(rawAeoScore, 48);
  }

  // 6. Strict GEO Pillar Scoring (0-100)
  // Evaluates entity grounding, Schema.org, knowledge structure, and provenance.
  let geoPoints = 0;
  const geoChecksList = categoryGroups.geo || [];
  const geoSchema = geoChecksList.find((c) => c.id === "geo-structured-data");
  const geoHierarchy = geoChecksList.find((c) => c.id === "geo-semantic-structure");
  const geoProvenance = geoChecksList.find((c) => c.id === "geo-author-provenance");

  if (geoSchema?.status === "pass") geoPoints += 45;
  else if (geoSchema?.status === "warning") {
    geoPoints += 20;
    scoreDeductions.push({ checkId: "geo-structured-data", category: "geo", area: "GEO", impact: -12, reason: "Schema JSON-LD lacks explicit named entity types" });
  } else {
    scoreDeductions.push({ checkId: "geo-structured-data", category: "geo", area: "GEO", impact: -25, reason: "No Schema.org entity definitions for AI grounding" });
  }

  if (geoHierarchy?.status === "pass") geoPoints += 30;
  else if (geoHierarchy?.status === "warning") {
    geoPoints += 15;
    scoreDeductions.push({ checkId: "geo-semantic-structure", category: "geo", area: "GEO", impact: -8, reason: "Non-standard heading hierarchy for LLM concept tree" });
  } else {
    scoreDeductions.push({ checkId: "geo-semantic-structure", category: "geo", area: "GEO", impact: -15, reason: "Weak semantic structure" });
  }

  if (geoProvenance?.status === "pass") geoPoints += 25;
  else if (geoProvenance?.status === "warning") {
    geoPoints += 12;
  } else {
    scoreDeductions.push({ checkId: "geo-author-provenance", category: "geo", area: "GEO", impact: -10, reason: "Missing author/brand provenance for AI citation" });
  }

  let rawGeoScore = Math.min(100, Math.max(0, geoPoints));
  // GEO Cap: If no Schema.org and weak hierarchy, cap GEO at 45
  if (doc.jsonLdBlocks.length === 0 && doc.headingTree.length < 3) {
    rawGeoScore = Math.min(rawGeoScore, 42);
  }

  // Construct CategoryScore map
  const categories: Record<AuditCategory, CategoryScore> = {
    technical: {
      category: "technical",
      name: "Technical SEO",
      score: Math.round(rawTechScore),
      weight: 0.30,
      passedCount: techChecks.filter((c) => c.status === "pass").length,
      warningCount: techChecks.filter((c) => c.status === "warning").length,
      errorCount: techChecks.filter((c) => c.status === "error").length,
      summary: rawTechScore >= 85 ? "Robust technical foundation with valid security, status, and crawl directives." : "Technical bottlenecks detected affecting crawlability or indexability.",
    },
    onpage: {
      category: "onpage",
      name: "On-page SEO",
      score: Math.round(rawOnpageScore),
      weight: 0.30,
      passedCount: onpageChecks.filter((c) => c.status === "pass").length,
      warningCount: onpageChecks.filter((c) => c.status === "warning").length,
      errorCount: onpageChecks.filter((c) => c.status === "error").length,
      summary: rawOnpageScore >= 85 ? "Optimal title, heading hierarchy, and meta signal coverage." : "On-page structure needs refinement to maximize SERP click-through rates.",
    },
    content: {
      category: "content",
      name: "Content Structure",
      score: Math.round(rawContentScore),
      weight: 0.20,
      passedCount: contentChecks.filter((c) => c.status === "pass").length,
      warningCount: contentChecks.filter((c) => c.status === "warning").length,
      errorCount: contentChecks.filter((c) => c.status === "error").length,
      summary: rawContentScore >= 80 ? "Substantial content depth and schema metadata coverage." : "Content volume or schema markup is missing.",
    },
    social: {
      category: "social",
      name: "Metadata & Social",
      score: Math.round(rawSocialScore),
      weight: 0.10,
      passedCount: socialChecks.filter((c) => c.status === "pass").length,
      warningCount: socialChecks.filter((c) => c.status === "warning").length,
      errorCount: socialChecks.filter((c) => c.status === "error").length,
      summary: rawSocialScore >= 80 ? "Complete Open Graph and social discovery cards." : "Social sharing tags are incomplete.",
    },
    aeo: {
      category: "aeo",
      name: "Answer Engine Optimization",
      score: Math.round(rawAeoScore),
      weight: 0.05,
      passedCount: aeoChecksList.filter((c) => c.status === "pass").length,
      warningCount: aeoChecksList.filter((c) => c.status === "warning").length,
      errorCount: aeoChecksList.filter((c) => c.status === "error").length,
      summary: rawAeoScore >= 75 ? "Direct interrogative structure and concise answer blocks present." : "Limited answer-oriented formatting detected.",
    },
    geo: {
      category: "geo",
      name: "Generative Engine Optimization",
      score: Math.round(rawGeoScore),
      weight: 0.05,
      passedCount: geoChecksList.filter((c) => c.status === "pass").length,
      warningCount: geoChecksList.filter((c) => c.status === "warning").length,
      errorCount: geoChecksList.filter((c) => c.status === "error").length,
      summary: rawGeoScore >= 75 ? "Explicit Schema.org knowledge graph and clear entity hierarchy." : "Unstructured entity representation makes LLM knowledge indexing ambiguous.",
    },
  };

  // SEO Pillar Score (Strict weighted calculation of traditional SEO components)
  // Technical: 30%, On-Page: 30%, Content: 20%, Social: 10%, Accessibility signals: 10%
  const accessibilityScore = altCheck?.status === "pass" && linksCheck?.status === "pass" ? 100 : altCheck?.status === "pass" || linksCheck?.status === "pass" ? 60 : 30;

  const seoPillarScore = Math.round(
    categories.technical.score * 0.30 +
    categories.onpage.score * 0.30 +
    categories.content.score * 0.20 +
    categories.social.score * 0.10 +
    accessibilityScore * 0.10
  );

  const pillars = {
    seo: {
      area: "SEO" as PillarArea,
      name: "Search Optimization",
      score: seoPillarScore,
      verdict: seoPillarScore >= 80 ? "Strong Search Baseline" : seoPillarScore >= 60 ? "Moderate Search Visibility" : "Critical Search Bottlenecks",
      summary: "Evaluates traditional search crawlability, HTTP performance, canonicalization, and heading semantics.",
      signalsCount: techChecks.length + onpageChecks.length + contentChecks.length + socialChecks.length,
    },
    aeo: {
      area: "AEO" as PillarArea,
      name: "Answer Engine Readiness",
      score: Math.round(rawAeoScore),
      verdict: rawAeoScore >= 80 ? "High Answer Readiness" : rawAeoScore >= 60 ? "Moderate Answer Readiness" : "Limited Answer Structure",
      summary: "Evaluates question/answer headings, FAQ blocks, and direct intent answer extraction.",
      signalsCount: aeoChecksList.length,
    },
    geo: {
      area: "GEO" as PillarArea,
      name: "Generative Readiness",
      score: Math.round(rawGeoScore),
      verdict: rawGeoScore >= 80 ? "Strong Generative Clarity" : rawGeoScore >= 60 ? "Moderate Generative Clarity" : "Weak Generative Structure",
      summary: "Evaluates entity clarity, Schema.org knowledge graph integration, and brand provenance.",
      signalsCount: geoChecksList.length,
    },
  };

  // Overall Score (Weighted combination of SEO 50%, AEO 25%, GEO 25%)
  let overallScore = Math.round(
    pillars.seo.score * 0.50 +
    pillars.aeo.score * 0.25 +
    pillars.geo.score * 0.25
  );

  // Global Critical Caps: If page has critical SEO issues (no title, no H1, noindex, or non-200), overall score cannot exceed 50
  if (titleCheck?.status === "error" || h1Check?.status === "error" || indexCheck?.status === "error" || statusCheck?.status === "error") {
    overallScore = Math.min(overallScore, 48);
  }

  overallScore = Math.max(0, Math.min(100, overallScore));
  const scoreInterpretation = getScoreInterpretation(overallScore);

  // Exact Mathematical Score Breakdown for Auditability
  const scoreBreakdown: ScoreBreakdown = {
    technical: { earned: Math.round(categories.technical.score * 0.30), max: 30 },
    onpage: { earned: Math.round(categories.onpage.score * 0.30), max: 30 },
    content: { earned: Math.round(categories.content.score * 0.20), max: 20 },
    social: { earned: Math.round(categories.social.score * 0.10), max: 10 },
    accessibility: { earned: Math.round(accessibilityScore * 0.10), max: 10 },
    totalSeo: { earned: seoPillarScore, max: 100 },
  };

  // Concrete AEO & GEO Signal Models
  const aeoSignals: AeoSignals = {
    questionOrientedHeadings: doc.questionHeadingsCount,
    clearAnswerSections: doc.h2s.length,
    faqStructureDetected: doc.faqDetected,
    structuredDataDetected: doc.jsonLdBlocks.length > 0,
    conciseAnswerBlocks: Math.max(0, Math.min(12, Math.floor(doc.wordCount / 120))),
    score: pillars.aeo.score,
    verdict: pillars.aeo.verdict,
    summary:
      doc.questionHeadingsCount >= 2
        ? "The page uses interrogative headings that answer engines can map directly to user queries."
        : doc.questionHeadingsCount === 1
        ? "The page has 1 question heading. Adding more question-formatted subheadings will improve answer engine quotation."
        : "The page lacks question-formatted headings, limiting direct snippet ingestion by answer engines.",
  };

  const geoSignals: GeoSignals = {
    semanticStructure: doc.h1s.length === 1 && doc.h2s.length >= 2 ? "Strong" : doc.h1s.length === 1 ? "Moderate" : "Weak",
    entityClarity: doc.jsonLdBlocks.length > 0 && doc.schemaTypes.length > 0 ? "Strong" : doc.jsonLdBlocks.length > 0 ? "Moderate" : "Weak",
    structuredData: doc.jsonLdBlocks.length > 0 ? "Strong" : "Weak",
    authorInfoDetected: doc.hasAuthor,
    topicalHierarchy: doc.headingTree.length >= 4 ? "Strong" : doc.headingTree.length >= 2 ? "Moderate" : "Weak",
    citationFriendlySections: doc.wordCount >= 400 ? "Strong" : doc.wordCount >= 200 ? "Moderate" : "Weak",
    score: pillars.geo.score,
    verdict: pillars.geo.verdict,
    summary:
      doc.jsonLdBlocks.length > 0
        ? "Structured JSON-LD blocks provide explicit entity definitions that generative models can anchor to."
        : "Without structured JSON-LD schemas, AI engines must infer brand entities solely from unstructured body text.",
  };

  const visibilityRadar: VisibilityRadarMetrics = {
    technical: categories.technical.score,
    onpage: categories.onpage.score,
    content: categories.content.score,
    social: categories.social.score,
    aeo: pillars.aeo.score,
    geo: pillars.geo.score,
  };

  // Executive summary generated from actual top issues
  const nonPassedIssues = checks.filter((c) => c.status !== "pass");
  const topKeyIssues = nonPassedIssues.slice(0, 3).map((i) => i.title);

  let headline = "";
  if (overallScore >= 90) {
    headline = "Your website has an exceptional technical and semantic foundation.";
  } else if (overallScore >= 80) {
    headline = "Your website demonstrates a strong baseline, with focused opportunities for refinement.";
  } else if (overallScore >= 70) {
    headline = "Your website has a good baseline, but important visibility gaps remain.";
  } else if (overallScore >= 60) {
    headline = "Your website needs focused improvements across technical and semantic signals.";
  } else if (overallScore >= 40) {
    headline = "Several important technical and on-page issues require attention.";
  } else {
    headline = "Your website has major technical and structural bottlenecks affecting search and AI discovery.";
  }

  const subheadline =
    nonPassedIssues.length === 0
      ? "All evaluated signals across traditional search, answer engines, and generative AI meet rigorous visibility standards."
      : `Addressing ${nonPassedIssues.length} identified signal${nonPassedIssues.length > 1 ? "s" : ""} will directly improve organic search indexability, snippet eligibility, and AI knowledge clarity.`;

  // Next actionable moves generated strictly from actual findings
  const nextSteps = nonPassedIssues.slice(0, 3).map((issue, idx) => ({
    stepNumber: idx + 1,
    title: issue.recommendation || `Optimize ${issue.title}`,
    rationale: issue.details || issue.description,
    area: (issue.area || "SEO") as PillarArea,
  }));

  if (nextSteps.length === 0) {
    nextSteps.push({
      stepNumber: 1,
      title: "Maintain continuous technical hygiene & sitemap freshness",
      rationale: "Ongoing health monitoring protects organic search visibility and keeps AI knowledge graphs synchronized.",
      area: "SEO" as PillarArea,
    });
  }

  return {
    overallScore,
    scoreInterpretation,
    scoreDeductions,
    scoreBreakdown,
    executiveSummary: {
      headline,
      subheadline,
      keyIssues: topKeyIssues.length > 0 ? topKeyIssues : ["All evaluated signals meeting standards"],
    },
    pillars,
    categories,
    aeoSignals,
    geoSignals,
    visibilityRadar,
    summary: {
      criticalCount,
      warningCount,
      passedCount,
      totalChecks: checks.length,
    },
    nextSteps,
  };
}
