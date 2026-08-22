import React from "react";
import { SeoAuditReport } from "@/types/audit";
import { SCORING_WEIGHTS } from "@/lib/seo/scorer";

interface ScoreOverviewProps {
  report: SeoAuditReport;
}

export function ScoreOverview({ report }: ScoreOverviewProps) {
  const issuesCount = report.summary.criticalCount + report.summary.warningCount;

  return (
    <section className="space-y-12">
      {/* Top Editorial Score Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-b border-[#EFEFEA] pb-12">
        {/* Overall Score */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#EFEFEA] pb-8 lg:pb-0 lg:pr-8">
          <span className="font-mono text-xs uppercase tracking-wider text-[#66666E]">
            Rankly Score
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-7xl font-light spectral-text">
              {report.overallScore}
            </span>
            <span className="font-mono text-sm text-[#66666E]">/ 100</span>
          </div>

          <div className="mt-2">
            <span className="font-medium text-sm text-[#121214]">{report.scoreInterpretation}</span>
            <p className="mt-1 text-xs text-[#66666E] leading-relaxed">
              {issuesCount === 0
                ? "All evaluated technical and on-page signals meet established search standards."
                : `Your page has ${issuesCount} verified signal${issuesCount > 1 ? "s" : ""} affecting visibility.`}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-[#66666E]">Critical:</span>{" "}
              <span className={report.summary.criticalCount > 0 ? "text-rose-600 font-bold" : "text-[#121214]"}>
                {report.summary.criticalCount}
              </span>
            </div>
            <div>
              <span className="text-[#66666E]">Warnings:</span>{" "}
              <span className={report.summary.warningCount > 0 ? "text-amber-600 font-bold" : "text-[#121214]"}>
                {report.summary.warningCount}
              </span>
            </div>
            <div>
              <span className="text-[#66666E]">Passed:</span>{" "}
              <span className="text-emerald-700 font-bold">
                {report.summary.passedCount}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Category Scores with Clean Lines */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
              Technical SEO ({Math.round(SCORING_WEIGHTS.technical * 100)}%)
            </span>
            <div className="font-mono text-3xl font-light text-[#121214] mt-1">
              {report.categories.technical.score}
            </div>
            <p className="mt-2 text-xs text-[#66666E] line-clamp-2">
              {report.categories.technical.summary}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
              On-Page SEO ({Math.round(SCORING_WEIGHTS.onpage * 100)}%)
            </span>
            <div className="font-mono text-3xl font-light text-[#121214] mt-1">
              {report.categories.onpage.score}
            </div>
            <p className="mt-2 text-xs text-[#66666E] line-clamp-2">
              {report.categories.onpage.summary}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
              Content ({Math.round(SCORING_WEIGHTS.content * 100)}%)
            </span>
            <div className="font-mono text-3xl font-light text-[#121214] mt-1">
              {report.categories.content.score}
            </div>
            <p className="mt-2 text-xs text-[#66666E] line-clamp-2">
              {report.categories.content.summary}
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
              Metadata & Social ({Math.round(SCORING_WEIGHTS.social * 100)}%)
            </span>
            <div className="font-mono text-3xl font-light text-[#121214] mt-1">
              {report.categories.social.score}
            </div>
            <p className="mt-2 text-xs text-[#66666E] line-clamp-2">
              {report.categories.social.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Audit Snapshot Section (Real extracted values) */}
      <div className="border-b border-[#EFEFEA] pb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          Audit Snapshot
        </span>
        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1 mb-6">
          Extracted page properties.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Title Tag</span>
            <span className="text-[#121214] font-medium block truncate mt-1">
              {report.snapshot.title}
            </span>
            <span className="text-[#8C8C94] text-[11px]">{report.snapshot.titleLength} characters</span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Meta Description</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.metaDescriptionPresent ? "Present" : "Missing"}
            </span>
            <span className="text-[#8C8C94] text-[11px]">{report.snapshot.metaDescriptionLength} characters</span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">H1 Heading</span>
            <span className="text-[#121214] font-medium block truncate mt-1">
              {report.snapshot.h1Text || "None detected"}
            </span>
            <span className="text-[#8C8C94] text-[11px]">{report.snapshot.h1Count} H1 tag{report.snapshot.h1Count === 1 ? "" : "s"}</span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Images & Alt</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.totalImages} images
            </span>
            <span className={report.snapshot.imagesMissingAlt > 0 ? "text-amber-700 text-[11px]" : "text-emerald-700 text-[11px]"}>
              {report.snapshot.imagesMissingAlt} missing alt text
            </span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Internal Links</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.internalLinksCount} crawlable links
            </span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">External Outbound</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.externalLinksCount} outbound links
            </span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Structured Data</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.hasSchemaJsonLd ? "JSON-LD Detected" : "None detected"}
            </span>
          </div>

          <div className="border-b border-[#EFEFEA] pb-2">
            <span className="text-[#66666E] block text-[10px] uppercase">Content Volume</span>
            <span className="text-[#121214] font-medium block mt-1">
              {report.snapshot.wordCount} words
            </span>
          </div>
        </div>
      </div>

      {/* Scoring Methodology Expandable explanation */}
      <div className="border-b border-[#EFEFEA] pb-8 text-xs">
        <details className="group cursor-pointer">
          <summary className="font-mono text-xs text-[#66666E] hover:text-[#121214] transition-colors flex items-center justify-between">
            <span>How Rankly calculated this score (Deterministic formula)</span>
            <span className="text-[10px] text-[#8C8C94] group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-4 pt-4 border-t border-[#EFEFEA]/60 space-y-2 text-[#66666E] leading-relaxed">
            <p>
              Rankly calculates the overall score by executing 22 deterministic rules without AI estimation. Scores are earned through comprehensive signal compliance, while critical defects trigger score caps and explicit deductions.
            </p>
            <div className="font-mono text-[11px] text-[#121214] grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <div>Technical SEO: 30%</div>
              <div>On-page SEO: 30%</div>
              <div>Content: 20%</div>
              <div>Metadata: 10%</div>
              <div>Accessibility: 10%</div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
