import {
  AuditCheck,
  AuxiliaryFetchResult,
  ParsedSeoDoc,
  RawFetchResult,
  PageType,
} from "@/types/audit";
import { runTechnicalChecks } from "./checks/technical";
import { runOnPageChecks } from "./checks/on-page";
import { runSocialChecks } from "./checks/social";
import { runContentChecks } from "./checks/content";

export function analyzeSeo(
  fetchResult: RawFetchResult,
  doc: ParsedSeoDoc,
  robotsTxt: AuxiliaryFetchResult,
  sitemapXml: AuxiliaryFetchResult,
  pageType: PageType = "Unknown"
): AuditCheck[] {
  // 1. Traditional SEO checks
  const technicalChecks = runTechnicalChecks(fetchResult, doc, robotsTxt, sitemapXml).map((c) => ({
    ...c,
    area: "SEO" as const,
  }));

  const onPageChecks = runOnPageChecks(doc).map((c) => ({
    ...c,
    area: "SEO" as const,
  }));

  const socialChecks = runSocialChecks(doc).map((c) => ({
    ...c,
    area: "SEO" as const,
  }));

  const contentChecks = runContentChecks(doc).map((c) => ({
    ...c,
    area: "SEO" as const,
  }));

  // 2. Strict AEO (Answer Engine Optimization) Checks
  // AEO must not get high score just because headings exist.
  const aeoChecks: AuditCheck[] = [];

  // AEO-1: Question-oriented headings
  const hasQuestionHeadings = doc.questionHeadingsCount >= 2;
  const isModerateQuestions = doc.questionHeadingsCount === 1;
  aeoChecks.push({
    id: "aeo-qa-structure",
    category: "aeo",
    area: "AEO",
    title: "Question-Oriented Heading Structure",
    description: "Evaluates whether headings ask direct user questions (How, What, Why, Is) that answer engines index into direct response blocks.",
    status: hasQuestionHeadings ? "pass" : isModerateQuestions ? "warning" : "error",
    severity: hasQuestionHeadings ? "info" : isModerateQuestions ? "medium" : "high",
    value: `${doc.questionHeadingsCount} question-formatted heading(s)`,
    expected: ">= 2 question-oriented headings (e.g. 'How it works', 'What is X?')",
    details: hasQuestionHeadings
      ? "Clear interrogative heading structure allows answer engines to pair user query intent directly to page sections."
      : isModerateQuestions
      ? "Only 1 question-formatted heading was detected. Answer engines struggle to extract multiple standalone answers."
      : "No question-formatted headings were detected. The page lacks direct query-to-answer signposts.",
    recommendation: "Structure key subheadings as explicit questions that searchers type into search & answer engines.",
    impact: "high",
  });

  // AEO-2: FAQ & Answer Block Structure
  aeoChecks.push({
    id: "aeo-faq-pattern",
    category: "aeo",
    area: "AEO",
    title: "FAQ & Direct Answer Blocks",
    description: "Checks for dedicated FAQ sections, accordion markup, or FAQPage schema for answer engine snippet extraction.",
    status: doc.faqDetected ? "pass" : "warning",
    severity: doc.faqDetected ? "info" : pageType === "Blog / Article" || pageType === "Documentation" ? "medium" : "low",
    value: doc.faqDetected ? "FAQ / Q&A structure detected" : "No dedicated FAQ pattern found",
    expected: "Structured FAQ section or FAQPage schema",
    details: doc.faqDetected
      ? "Direct FAQ structures provide bite-sized, factual answers that voice & AI answer engines directly quote."
      : "No dedicated FAQ section or accordion pattern detected. Adding a concise FAQ improves snippet eligibility.",
    recommendation: "Include a 3-5 item FAQ section with direct 1-2 sentence answers to core questions.",
    impact: "medium",
  });

  // AEO-3: Answer Proximity & Conciseness
  const hasSufficientDepth = doc.wordCount >= 300;
  const isTooThinForAnswers = doc.wordCount < 150;
  aeoChecks.push({
    id: "aeo-concise-answers",
    category: "aeo",
    area: "AEO",
    title: "Answer Depth & Paragraph Proximity",
    description: "Evaluates if explanatory text contains sufficient depth and standalone concise blocks for snippet quotation.",
    status: hasSufficientDepth ? "pass" : isTooThinForAnswers ? "error" : "warning",
    severity: hasSufficientDepth ? "info" : isTooThinForAnswers ? "high" : "medium",
    value: `${doc.wordCount} words analyzed`,
    expected: ">= 300 words with concise explanatory paragraphs (< 80 words each)",
    details: hasSufficientDepth
      ? "Substantial textual depth to support extractable, standalone answers to search queries."
      : isTooThinForAnswers
      ? "Content is too thin (< 150 words) to provide definitive standalone answers to user queries."
      : "Moderate content volume. Expanding topical depth and placing direct summary sentences below headings will improve answer extraction.",
    recommendation: "Place direct, definitive answer summaries immediately beneath major headings.",
    impact: "high",
  });

  // 3. Strict GEO (Generative Engine Optimization) Checks
  // Evaluates entity clarity, structured schema, topical hierarchy, and citation readiness.
  const geoChecks: AuditCheck[] = [];

  // GEO-1: Entity Clarity & Schema.org JSON-LD
  const hasJsonLd = doc.jsonLdBlocks.length > 0;
  const hasSpecificEntity = doc.schemaTypes.some((t) =>
    ["organization", "product", "softwareapplication", "article", "person", "website", "corporation"].includes(t.toLowerCase())
  );
  geoChecks.push({
    id: "geo-structured-data",
    category: "geo",
    area: "GEO",
    title: "Entity Clarity & Schema.org Graph",
    description: "Verifies explicit JSON-LD entity definitions (Organization, Product, Person, Article) for LLM knowledge graph grounding.",
    status: hasJsonLd && hasSpecificEntity ? "pass" : hasJsonLd ? "warning" : "error",
    severity: hasJsonLd && hasSpecificEntity ? "info" : hasJsonLd ? "medium" : "high",
    value: hasJsonLd ? `${doc.jsonLdBlocks.length} JSON-LD block(s) [${doc.schemaTypes.join(", ") || "Generic"}]` : "No Schema JSON-LD detected",
    expected: "Explicit Organization, Product, Person, or WebSite Schema.org JSON-LD",
    details: hasJsonLd && hasSpecificEntity
      ? "Explicit structured entities allow LLMs (ChatGPT, Gemini, Perplexity) to anchor brand identity without hallucination."
      : hasJsonLd
      ? "JSON-LD is present but lacks explicit named entity types (Organization, Product, Person)."
      : "Without Schema.org JSON-LD, generative AI models must infer company, product, and author entities solely from unverified body text.",
    recommendation: "Implement Organization or Product Schema.org JSON-LD to anchor entity definitions in AI knowledge bases.",
    impact: "high",
  });

  // GEO-2: Semantic Topical Hierarchy
  const hasValidH1 = doc.h1s.length === 1;
  const hasH2Hierarchy = doc.h2s.length >= 2;
  const isHierarchyStrong = hasValidH1 && hasH2Hierarchy && doc.headingTree.length >= 3;
  geoChecks.push({
    id: "geo-semantic-structure",
    category: "geo",
    area: "GEO",
    title: "Topical Hierarchy & Knowledge Structure",
    description: "Checks if headings and sections create a well-defined conceptual tree for generative model parsing.",
    status: isHierarchyStrong ? "pass" : hasValidH1 ? "warning" : "error",
    severity: isHierarchyStrong ? "info" : hasValidH1 ? "medium" : "high",
    value: `${doc.h1s.length} H1, ${doc.h2s.length} H2s, ${doc.h3s.length} H3s`,
    expected: "1 descriptive H1 and 2+ ordered H2 subsections",
    details: isHierarchyStrong
      ? "Clean semantic hierarchy enables generative models to build accurate conceptual summaries and sub-topic clusters."
      : "Weak or non-standard heading structure creates ambiguities when AI summarizers parse page hierarchy.",
    recommendation: "Structure page topics with a single descriptive H1 and at least 2 distinct H2 sub-topics.",
    impact: "high",
  });

  // GEO-3: Citation & Source Provenance (Page-type aware)
  const isEditorial = pageType === "Blog / Article" || pageType === "Documentation";
  if (isEditorial) {
    geoChecks.push({
      id: "geo-author-provenance",
      category: "geo",
      area: "GEO",
      title: "Author Attribution & Citation Readiness",
      description: "Checks for verifiable author metadata and external reference patterns for editorial source credibility.",
      status: doc.hasAuthor ? "pass" : "error",
      severity: doc.hasAuthor ? "info" : "high",
      value: doc.hasAuthor ? "Author/publisher attribution detected" : "No explicit author metadata found",
      expected: "Author meta tag, rel='author', or Schema Person/Organization author",
      details: doc.hasAuthor
        ? "Explicit attribution signals editorial authority (E-E-A-T), increasing generative citation likelihood."
        : "Editorial articles without author attribution are heavily discounted in generative citation selection.",
      recommendation: "Declare explicit author/publisher meta tags or Schema.org author properties.",
      impact: "high",
    });
  } else {
    // For Homepages, SaaS, Portfolios
    const hasOutboundOrBrand = doc.externalLinks.length > 0 || doc.hasAuthor || hasJsonLd;
    geoChecks.push({
      id: "geo-author-provenance",
      category: "geo",
      area: "GEO",
      title: "Brand Authority & Entity References",
      description: "Checks for verified entity metadata and brand attribution signals.",
      status: hasOutboundOrBrand ? "pass" : "warning",
      severity: hasOutboundOrBrand ? "info" : "medium",
      value: hasJsonLd ? "Entity defined in Schema" : `${doc.externalLinks.length} outbound reference(s)`,
      details: hasOutboundOrBrand
        ? "Page provides verifiable brand reference signals for AI knowledge discovery."
        : "Limited brand identity signals detected. Add Schema.org Organization data to strengthen AI entity recognition.",
      recommendation: "Include Organization Schema.org with official social and company profiles (sameAs).",
      impact: "medium",
    });
  }

  return [
    ...technicalChecks,
    ...onPageChecks,
    ...socialChecks,
    ...contentChecks,
    ...aeoChecks,
    ...geoChecks,
  ];
}
