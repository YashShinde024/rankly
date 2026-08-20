export type CheckStatus = "pass" | "warning" | "error";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type PillarArea = "SEO" | "AEO" | "GEO";

export type AuditCategory = "technical" | "onpage" | "content" | "social" | "aeo" | "geo";

export interface HeadingItem {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  level: number;
}

export interface AuditCheck {
  id: string;
  category: AuditCategory;
  area?: PillarArea;
  title: string;
  description: string;
  status: CheckStatus;
  severity: FindingSeverity;
  value?: string | number | boolean | null;
  expected?: string;
  details?: string;
  codeSnippet?: string;
  recommendation?: string;
  impact: "high" | "medium" | "low";
}

export interface CategoryScore {
  category: AuditCategory;
  name: string;
  score: number;
  weight: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  summary: string;
}

export interface PillarScore {
  area: PillarArea;
  name: string;
  score: number;
  verdict: string;
  summary: string;
  signalsCount: number;
}

export interface AiRecommendation {
  id: string;
  title: string;
  findingSummary: string;
  whyItMatters: string;
  actionableFix: string;
  codeExample?: string;
  suggestedCopy?: string;
  priority: "critical" | "important" | "recommended";
  estimatedEffort: "quick" | "moderate" | "involved";
  affectedCategory: AuditCategory;
  area?: PillarArea;
}

export interface AuditSnapshot {
  domain: string;
  title: string;
  titleLength: number;
  metaDescriptionPresent: boolean;
  metaDescriptionLength: number;
  h1Count: number;
  h1Text?: string;
  totalImages: number;
  imagesMissingAlt: number;
  internalLinksCount: number;
  externalLinksCount: number;
  hasSchemaJsonLd: boolean;
  schemaTypesCount: number;
  schemaTypes: string[];
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  wordCount: number;
  isHttps: boolean;
  httpStatus: number;
  responseTimeMs: number;
  contentType: string;
  headingCounts: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
  };
}

export interface AeoSignals {
  questionOrientedHeadings: number;
  clearAnswerSections: number;
  faqStructureDetected: boolean;
  structuredDataDetected: boolean;
  conciseAnswerBlocks: number;
  score: number;
  verdict: string;
  summary: string;
}

export interface GeoSignals {
  semanticStructure: "Strong" | "Moderate" | "Weak";
  entityClarity: "Strong" | "Moderate" | "Weak";
  structuredData: "Strong" | "Moderate" | "Weak";
  authorInfoDetected: boolean;
  topicalHierarchy: "Strong" | "Moderate" | "Weak";
  citationFriendlySections: "Strong" | "Moderate" | "Weak";
  score: number;
  verdict: string;
  summary: string;
}

export interface VisibilityRadarMetrics {
  technical: number;
  onpage: number;
  content: number;
  social: number;
  aeo: number;
  geo: number;
}

export type PageType =
  | "Homepage"
  | "Product / SaaS"
  | "Blog / Article"
  | "Portfolio"
  | "E-commerce"
  | "Documentation"
  | "Unknown";

export interface ScoreDeduction {
  checkId: string;
  category: AuditCategory;
  area: PillarArea;
  impact: number;
  reason: string;
}

export interface ScoreBreakdown {
  technical: { earned: number; max: number };
  onpage: { earned: number; max: number };
  content: { earned: number; max: number };
  social: { earned: number; max: number };
  accessibility: { earned: number; max: number };
  totalSeo: { earned: number; max: number };
}

export interface SeoAuditReport {
  id: string; // e.g. "RKL-8F31A2"
  url: string;
  domain: string;
  title: string;
  pageType?: PageType;
  timestamp: string;
  formattedDate: string;
  overallScore: number;
  scoreInterpretation: string;
  scoreDeductions?: ScoreDeduction[];
  scoreBreakdown?: ScoreBreakdown;
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
  summary: {
    criticalCount: number;
    warningCount: number;
    passedCount: number;
    totalChecks: number;
  };
  snapshot: AuditSnapshot;
  headingTree: HeadingItem[];
  aeoSignals: AeoSignals;
  geoSignals: GeoSignals;
  visibilityRadar: VisibilityRadarMetrics;
  checks: AuditCheck[];
  aiInsight: {
    isAvailable: boolean;
    overview: string;
    strengths: string[];
    topPriorities: string[];
  };
  recommendations: AiRecommendation[];
  nextSteps: Array<{
    stepNumber: number;
    title: string;
    rationale: string;
    area: PillarArea;
  }>;
  technicalDetails: {
    protocol: string;
    httpStatus: number;
    responseTimeMs: number;
    contentType: string;
    contentLengthBytes: number;
    redirectCount: number;
    canonicalUrl?: string;
    robotsTxtStatus: string;
    sitemapStatus: string;
    viewport?: string;
    robotsMeta?: string;
  };
}

export interface ExploreAuditRecord {
  id: string;
  domain: string;
  overallScore: number;
  scoreInterpretation: string;
  pillars: {
    seo: number;
    aeo: number;
    geo: number;
  };
  categories: {
    technical: number;
    onpage: number;
    content: number;
    social: number;
  };
  timestamp: number;
  timeAgo: string;
}

export interface RawFetchResult {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  html: string;
  responseTimeMs: number;
  redirectCount: number;
  isHttps: boolean;
  contentType: string;
  contentLength: number;
}

export interface AuxiliaryFetchResult {
  url: string;
  status: number;
  content: string;
  exists: boolean;
}

export interface ParsedSeoDoc {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  viewport?: string;
  robotsMeta?: string;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  h4s: string[];
  h5s: string[];
  h6s: string[];
  allHeadingsInOrder: { tag: string; text: string }[];
  headingTree: HeadingItem[];
  images: {
    src?: string;
    alt?: string;
    hasAlt: boolean;
  }[];
  internalLinks: { href: string; text: string; isEmpty: boolean }[];
  externalLinks: { href: string; text: string; rel?: string; target?: string }[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLdBlocks: any[];
  schemaTypes: string[];
  faviconUrl?: string;
  lang?: string;
  wordCount: number;
  rawTextLength: number;
  questionHeadingsCount: number;
  faqDetected: boolean;
  hasAuthor: boolean;
}
