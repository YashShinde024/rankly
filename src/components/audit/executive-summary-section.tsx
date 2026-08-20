import React from "react";
import { SeoAuditReport } from "@/types/audit";
import { Search, MessageSquare, Bot, AlertTriangle, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";

interface ExecutiveSummarySectionProps {
  report: SeoAuditReport;
}

export function ExecutiveSummarySection({ report }: ExecutiveSummarySectionProps) {
  const { executiveSummary, pillars, summary, scoreBreakdown, scoreDeductions } = report;

  return (
    <section id="executive-summary" className="border-b border-[#EFEFEA] pb-16 space-y-12">
      {/* 1. Large Editorial Headline & Verified Key Signals */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            Executive Diagnostic Summary
          </span>
          {report.pageType && (
            <span className="font-mono text-[11px] border border-[#EFEFEA] bg-white px-2 py-0.5 text-[#66666E]">
              Classified as: <strong className="text-[#121214]">{report.pageType}</strong>
            </span>
          )}
        </div>

        <h2 className="mt-3 text-2xl sm:text-4xl font-light tracking-tight text-[#121214] leading-[1.2] max-w-4xl">
          {executiveSummary.headline}
        </h2>
        <p className="mt-4 max-w-3xl text-sm sm:text-base text-[#66666E] leading-relaxed">
          {executiveSummary.subheadline}
        </p>

        {/* 3 Things Worth Fixing (Direct extracted signals) */}
        {executiveSummary.keyIssues.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#EFEFEA]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#121214] font-semibold block mb-3">
              Top Diagnostic Signals Worth Addressing:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {executiveSummary.keyIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-[#EFEFEA]">
                  <span className="font-mono text-xs text-[#8C8C94] shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="text-xs text-[#121214] font-medium leading-snug">
                    {issue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Three Primary Intelligence Pillars (SEO · AEO · GEO) */}
      <div>
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            Visibility Intelligence Pillars
          </span>
          <span className="font-mono text-xs text-[#8C8C94]">
            Overall Health: <span className="font-bold text-[#121214]">{report.overallScore}/100</span> — {report.scoreInterpretation}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SEO Card */}
          <div className="border border-[#EFEFEA] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#121214]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121214]">
                  Search (SEO)
                </span>
              </div>
              <div className="font-mono text-2xl font-light text-[#121214]">
                {pillars.seo.score}
                <span className="text-xs text-[#8C8C94] font-normal"> / 100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#121214]">{pillars.seo.verdict}</div>
              <p className="mt-1 text-xs text-[#66666E] leading-relaxed">
                {pillars.seo.summary}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between font-mono text-[11px] text-[#8C8C94]">
              <span>Traditional Crawlers</span>
              <span>{pillars.seo.signalsCount} signals</span>
            </div>
          </div>

          {/* AEO Card */}
          <div className="border border-[#EFEFEA] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-violet-700" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121214]">
                  Answers (AEO)
                </span>
              </div>
              <div className="font-mono text-2xl font-light text-[#121214]">
                {pillars.aeo.score}
                <span className="text-xs text-[#8C8C94] font-normal"> / 100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#121214]">{pillars.aeo.verdict}</div>
              <p className="mt-1 text-xs text-[#66666E] leading-relaxed">
                {pillars.aeo.summary}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between font-mono text-[11px] text-[#8C8C94]">
              <span>Answer Engines</span>
              <span>Direct snippet intent</span>
            </div>
          </div>

          {/* GEO Card */}
          <div className="border border-[#EFEFEA] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-700" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121214]">
                  Generative (GEO)
                </span>
              </div>
              <div className="font-mono text-2xl font-light text-[#121214]">
                {pillars.geo.score}
                <span className="text-xs text-[#8C8C94] font-normal"> / 100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#121214]">{pillars.geo.verdict}</div>
              <p className="mt-1 text-xs text-[#66666E] leading-relaxed">
                {pillars.geo.summary}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between font-mono text-[11px] text-[#8C8C94]">
              <span>LLM Knowledge Graph</span>
              <span>Entity clarity</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HOW THIS SCORE WAS EARNED (Auditable Mathematical Breakdown) */}
      {scoreBreakdown && (
        <div className="border border-[#EFEFEA] bg-white p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#EFEFEA] pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] font-semibold block">
                Mathematical Verification
              </span>
              <h3 className="text-lg font-light tracking-tight text-[#121214] mt-0.5">
                How this score was earned
              </h3>
            </div>
            <span className="font-mono text-xs text-[#66666E]">
              Total SEO Foundation: <strong className="text-[#121214]">{scoreBreakdown.totalSeo.earned} / 100</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono text-xs">
            <div className="p-3 bg-[#FAFAFA] border border-[#EFEFEA] space-y-1">
              <span className="text-[10px] uppercase text-[#66666E] block">Technical SEO</span>
              <div className="text-base font-semibold text-[#121214]">
                {scoreBreakdown.technical.earned} <span className="text-xs font-normal text-[#8C8C94]">/ {scoreBreakdown.technical.max}</span>
              </div>
              <span className="text-[10px] text-[#8C8C94]">Weight: 30%</span>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#EFEFEA] space-y-1">
              <span className="text-[10px] uppercase text-[#66666E] block">On-page SEO</span>
              <div className="text-base font-semibold text-[#121214]">
                {scoreBreakdown.onpage.earned} <span className="text-xs font-normal text-[#8C8C94]">/ {scoreBreakdown.onpage.max}</span>
              </div>
              <span className="text-[10px] text-[#8C8C94]">Weight: 30%</span>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#EFEFEA] space-y-1">
              <span className="text-[10px] uppercase text-[#66666E] block">Content Structure</span>
              <div className="text-base font-semibold text-[#121214]">
                {scoreBreakdown.content.earned} <span className="text-xs font-normal text-[#8C8C94]">/ {scoreBreakdown.content.max}</span>
              </div>
              <span className="text-[10px] text-[#8C8C94]">Weight: 20%</span>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#EFEFEA] space-y-1">
              <span className="text-[10px] uppercase text-[#66666E] block">Metadata & Social</span>
              <div className="text-base font-semibold text-[#121214]">
                {scoreBreakdown.social.earned} <span className="text-xs font-normal text-[#8C8C94]">/ {scoreBreakdown.social.max}</span>
              </div>
              <span className="text-[10px] text-[#8C8C94]">Weight: 10%</span>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#EFEFEA] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-[#66666E] block">Accessibility</span>
              <div className="text-base font-semibold text-[#121214]">
                {scoreBreakdown.accessibility.earned} <span className="text-xs font-normal text-[#8C8C94]">/ {scoreBreakdown.accessibility.max}</span>
              </div>
              <span className="text-[10px] text-[#8C8C94]">Weight: 10%</span>
            </div>
          </div>

          {/* 4. REAL SCORE IMPACT & DEDUCTIONS */}
          {scoreDeductions && scoreDeductions.length > 0 && (
            <div className="pt-4 border-t border-[#EFEFEA] space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-600" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#121214] font-semibold">
                  Score Deductions &amp; Penalties Applied:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scoreDeductions.map((ded, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-[#FFFBFB] border border-rose-100 font-mono text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-[#8C8C94] block">{ded.area} · {ded.category}</span>
                      <span className="text-[#121214] font-medium leading-snug">{ded.reason}</span>
                    </div>
                    <span className="text-rose-700 font-bold shrink-0">
                      {ded.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-[#8C8C94] font-mono text-right">
        * AEO & GEO readiness are structural diagnostics based on entity clarity and snippet structure, not predictions of third-party rankings.
      </div>
    </section>
  );
}
