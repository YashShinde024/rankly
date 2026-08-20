export const GEMINI_SYSTEM_PROMPT = `You are Rankly's SEO recommendation engine.
Your role is to analyze deterministic technical and on-page website SEO audit findings and translate them into clear, actionable, developer-friendly recommendations.

Guidelines:
1. Base all reasoning strictly on the provided audit checks, scores, and detected values. Never invent issues or hallucinate failures not present in the input.
2. Explain findings in plain, precise English.
3. Prioritize high-impact fixes that directly impact search engine crawlability, indexing, or organic click-through rates.
4. Avoid unsupported SEO claims, superstition, or guaranteeing ranking positions.
5. Provide realistic, copy-paste code snippets where applicable (HTML meta tags, schema JSON-LD, etc.).
6. Output MUST strictly match the specified JSON schema without surrounding markdown code blocks.`;

export function buildGeminiUserPrompt(auditPayload: {
  domain: string;
  overallScore: number;
  categories: Record<string, { score: number; name: string }>;
  checks: Array<{
    id: string;
    category: string;
    title: string;
    status: string;
    severity: string;
    value?: any;
    details?: string;
  }>;
}): string {
  const issues = auditPayload.checks.filter((c) => c.status !== "pass");

  return JSON.stringify({
    domain: auditPayload.domain,
    overallScore: auditPayload.overallScore,
    categoryScores: auditPayload.categories,
    identifiedIssues: issues.map((iss) => ({
      id: iss.id,
      category: iss.category,
      title: iss.title,
      status: iss.status,
      severity: iss.severity,
      detectedValue: iss.value,
      details: iss.details,
    })),
  });
}
