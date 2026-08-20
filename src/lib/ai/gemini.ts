import { GoogleGenAI } from "@google/genai";
import { AiRecommendation, AuditCategory, AuditCheck, CategoryScore, SeoAuditReport } from "@/types/audit";
import { GEMINI_SYSTEM_PROMPT, buildGeminiUserPrompt } from "./prompt";

/**
 * Fallback deterministic synthesis when GEMINI_API_KEY is not set or API is unreachable.
 */
export function generateDeterministicAiFallback(
  domain: string,
  overallScore: number,
  categories: Record<AuditCategory, CategoryScore>,
  checks: AuditCheck[]
): {
  aiInsight: SeoAuditReport["aiInsight"];
  recommendations: AiRecommendation[];
} {
  const issues = checks.filter((c) => c.status !== "pass");
  const passed = checks.filter((c) => c.status === "pass");

  const strengths: string[] = [];
  if (passed.some((c) => c.id === "tech-https")) {
    strengths.push("Secure SSL/TLS encryption enforced across website traffic.");
  }
  if (passed.some((c) => c.id === "tech-status")) {
    strengths.push("Fast server response with standard HTTP 200 OK status.");
  }
  if (passed.some((c) => c.id === "onpage-title")) {
    strengths.push("Primary title tag is concise and search-engine compliant.");
  }
  if (passed.some((c) => c.id === "geo-structured-data")) {
    strengths.push("Schema.org JSON-LD structured data anchors brand entities for AI models.");
  }
  if (strengths.length === 0) {
    strengths.push("Core web structure is reachable by search crawlers.");
  }

  const topPriorities: string[] = [];
  const recommendations: AiRecommendation[] = [];

  for (const issue of issues) {
    const priority =
      issue.severity === "critical"
        ? "critical"
        : issue.severity === "high"
        ? "important"
        : "recommended";

    const effort =
      issue.category === "onpage" || issue.id === "tech-canonical"
        ? "quick"
        : issue.category === "content" || issue.category === "aeo"
        ? "moderate"
        : "involved";

    topPriorities.push(issue.recommendation || `Resolve ${issue.title} to improve ${issue.category} visibility.`);

    recommendations.push({
      id: `rec-${issue.id}`,
      title: `Optimize ${issue.title}`,
      findingSummary: issue.details || issue.description,
      whyItMatters:
        issue.impact === "high"
          ? "This is a primary signal directly evaluated by traditional search crawlers and AI answer engines."
          : "Optimizing this helps search and generative engines accurately cluster page topics and snippet metadata.",
      actionableFix:
        issue.recommendation ||
        `Update your page markup to resolve the ${issue.title.toLowerCase()} diagnostic warning.`,
      codeExample: issue.codeSnippet || undefined,
      suggestedCopy: issue.id === "onpage-meta-desc" ? `Analyze and optimize ${domain}'s search and AI visibility with Rankly.` : undefined,
      priority,
      estimatedEffort: effort,
      affectedCategory: issue.category,
      area: issue.area,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-maintain",
      title: "Maintain ongoing technical health",
      findingSummary: "All evaluated on-page, AEO, and GEO checks are passing cleanly.",
      whyItMatters: "Consistent technical SEO health protects organic search visibility and maintains AI knowledge graph accuracy.",
      actionableFix: "Keep robots.txt, sitemaps, and entity schema up to date as new pages are published.",
      priority: "recommended",
      estimatedEffort: "quick",
      affectedCategory: "technical",
      area: "SEO",
    });
  }

  const overview =
    overallScore >= 85
      ? `Website technical health for ${domain} is solid (${overallScore}/100). Addressing minor content and AEO adjustments will maximize snippet CTR.`
      : overallScore >= 70
      ? `Website health for ${domain} is moderate (${overallScore}/100). Resolving ${issues.length} flagged issue(s) will noticeably improve traditional search and generative readiness.`
      : `Website health for ${domain} has critical technical bottlenecks (${overallScore}/100). Prioritize core fixes to ensure reliable crawling and indexation.`;

  return {
    aiInsight: {
      isAvailable: false,
      overview,
      strengths: strengths.slice(0, 3),
      topPriorities: topPriorities.slice(0, 3),
    },
    recommendations: recommendations.slice(0, 4),
  };
}

/**
 * Server-side Gemini AI caller. Strictly returns structured recommendations with suggested copy.
 */
export async function analyzeWithGemini(
  domain: string,
  overallScore: number,
  categories: Record<AuditCategory, CategoryScore>,
  checks: AuditCheck[]
): Promise<{
  aiInsight: SeoAuditReport["aiInsight"];
  recommendations: AiRecommendation[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return generateDeterministicAiFallback(domain, overallScore, categories, checks);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const userPayload = buildGeminiUserPrompt({
      domain,
      overallScore,
      categories: Object.fromEntries(
        Object.entries(categories).map(([k, v]) => [k, { score: v.score, name: v.name }])
      ),
      checks,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${GEMINI_SYSTEM_PROMPT}\n\nInput Audit Findings Data:\n${userPayload}\n\nRespond ONLY with valid JSON having the exact keys: "overview" (string), "strengths" (string[]), "topPriorities" (string[]), "recommendations" (array of objects with id, title, findingSummary, whyItMatters, actionableFix, codeExample, suggestedCopy, priority, estimatedEffort, affectedCategory, area).`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return generateDeterministicAiFallback(domain, overallScore, categories, checks);
    }

    const parsed = JSON.parse(text);

    if (
      typeof parsed.overview !== "string" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.topPriorities) ||
      !Array.isArray(parsed.recommendations)
    ) {
      return generateDeterministicAiFallback(domain, overallScore, categories, checks);
    }

    return {
      aiInsight: {
        isAvailable: true,
        overview: parsed.overview,
        strengths: parsed.strengths.slice(0, 3),
        topPriorities: parsed.topPriorities.slice(0, 3),
      },
      recommendations: parsed.recommendations.slice(0, 4).map((r: any, idx: number) => ({
        id: r.id || `rec-${idx + 1}`,
        title: r.title,
        findingSummary: r.findingSummary,
        whyItMatters: r.whyItMatters,
        actionableFix: r.actionableFix,
        codeExample: r.codeExample || undefined,
        suggestedCopy: r.suggestedCopy || undefined,
        priority: ["critical", "important", "recommended"].includes(r.priority) ? r.priority : "important",
        estimatedEffort: ["quick", "moderate", "involved"].includes(r.estimatedEffort) ? r.estimatedEffort : "quick",
        affectedCategory: ["technical", "onpage", "content", "social", "aeo", "geo"].includes(r.affectedCategory)
          ? r.affectedCategory
          : "technical",
        area: ["SEO", "AEO", "GEO"].includes(r.area) ? r.area : "SEO",
      })),
    };
  } catch {
    return generateDeterministicAiFallback(domain, overallScore, categories, checks);
  }
}
