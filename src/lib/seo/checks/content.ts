import { AuditCheck, ParsedSeoDoc } from "@/types/audit";

export function runContentChecks(parsedDoc: ParsedSeoDoc): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // 1. Visible Word Count & Content Depth
  const wordCount = parsedDoc.wordCount;
  if (wordCount < 150) {
    checks.push({
      id: "content-word-count",
      category: "content",
      title: "Content Depth & Word Count",
      description: "Analyzes textual content depth to ensure substantial value for search queries.",
      status: "warning",
      severity: "medium",
      value: `${wordCount} words`,
      expected: "Minimum 250+ words of topical copy",
      details: `The page contains only ${wordCount} words of visible body text. Thin content can struggle to rank for relevant search terms.`,
      recommendation: "Expand on-page content with clear explanations, feature benefits, and FAQs.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "content-word-count",
      category: "content",
      title: "Content Depth & Word Count",
      description: "Analyzes textual content depth.",
      status: "pass",
      severity: "info",
      value: `${wordCount} words`,
      details: `Adequate body text volume (${wordCount} words) detected for search intent indexing.`,
      impact: "medium",
    });
  }

  // 2. Structured Data (JSON-LD)
  const jsonLdCount = parsedDoc.jsonLdBlocks.length;
  if (jsonLdCount > 0) {
    const types = parsedDoc.jsonLdBlocks.map((b) => b["@type"]).filter(Boolean).join(", ");
    checks.push({
      id: "content-schema",
      category: "content",
      title: "Structured Data (Schema.org JSON-LD)",
      description: "Verifies JSON-LD structured data for rich snippet eligibility in search engines.",
      status: "pass",
      severity: "info",
      value: `${jsonLdCount} JSON-LD block(s) detected ${types ? `(${types})` : ""}`,
      details: "Valid Schema.org JSON-LD scripts found in page markup.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "content-schema",
      category: "content",
      title: "Structured Data (Schema.org JSON-LD)",
      description: "Checks for rich snippet schema definitions such as Organization, WebSite, or Product.",
      status: "warning",
      severity: "low",
      value: "No JSON-LD detected",
      details: "No JSON-LD structured data blocks were found. Adding structured markup helps search engines parse product entities and unlock rich snippets.",
      recommendation: "Add a JSON-LD schema block (e.g. Organization, WebSite, or SoftwareApplication) to the HTML head.",
      impact: "medium",
    });
  }

  // 3. HTML Lang Attribute
  if (parsedDoc.lang) {
    checks.push({
      id: "content-lang",
      category: "content",
      title: "HTML Lang Declaration",
      description: "Verifies the html element specifies an explicit language code.",
      status: "pass",
      severity: "info",
      value: `lang="${parsedDoc.lang}"`,
      codeSnippet: `<html lang="${parsedDoc.lang}">`,
      details: "HTML lang attribute is properly set.",
      impact: "low",
    });
  } else {
    checks.push({
      id: "content-lang",
      category: "content",
      title: "HTML Lang Declaration",
      description: "Verifies the html element specifies an explicit language code.",
      status: "warning",
      severity: "low",
      value: "Missing",
      expected: '<html lang="en">',
      details: "The <html> tag is missing a lang attribute. Language declarations assist search engines with geographic targeting and screen reader pronunciation.",
      recommendation: 'Add a lang attribute to your root <html> tag (e.g., <html lang="en">).',
      impact: "low",
    });
  }

  return checks;
}
