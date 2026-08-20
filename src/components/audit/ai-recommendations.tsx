"use client";

import React, { useState } from "react";
import { AiRecommendation } from "@/types/audit";
import { Copy, Check } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";

interface AiRecommendationsProps {
  recommendations: AiRecommendation[];
  isAvailable?: boolean;
}

export function AiRecommendations({ recommendations, isAvailable = true }: AiRecommendationsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="ai-recommendations" className="space-y-8 border-b border-[#EFEFEA] pb-16">
      {/* Header with Rankly AI Accent Badge */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AiAccent variant="badge">
              <span>Rankly AI Interpretation</span>
            </AiAccent>
            {!isAvailable && (
              <span className="font-mono text-[10px] text-[#8C8C94] bg-[#EFEFEA] px-2 py-0.5">
                Deterministic mode
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-3xl font-light tracking-tight text-[#121214] mt-2">
            What matters most.
          </h3>
        </div>

        <span className="font-mono text-xs text-[#8C8C94]">
          {recommendations.length} prioritized recommendations
        </span>
      </div>

      {!isAvailable && (
        <p className="text-xs text-[#66666E] italic bg-[#FAFAFA] p-3 border border-[#EFEFEA]">
          AI recommendations are currently operating in deterministic rule mode. Your measured technical and on-page audit data is complete.
        </p>
      )}

      {/* Recommendations Cards with thin AI Spectrum Edge Marker */}
      <div className="space-y-6">
        {recommendations.slice(0, 5).map((rec, idx) => (
          <article
            key={rec.id}
            className="border border-[#EFEFEA] bg-white p-6 relative overflow-hidden transition-all hover:border-[#D4D4D0]"
          >
            {/* Left edge 2px spectrum indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-[2.5px] spectrum-border opacity-80" />

            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#121214]">
                  0{idx + 1}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase px-2 py-0.5 font-bold ${
                    rec.priority === "critical"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : rec.priority === "important"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {rec.priority} priority
                </span>
                <span className="font-mono text-[10px] uppercase bg-[#FAFAFA] border border-[#EFEFEA] px-2 py-0.5 text-[#66666E]">
                  {rec.area || "SEO"}
                </span>
              </div>

              <span className="font-mono text-xs text-[#8C8C94]">
                Effort: {rec.estimatedEffort} · Category: {rec.affectedCategory}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-normal text-[#121214] mb-3">
              {rec.title}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] font-semibold block mb-1">
                  Why it matters
                </span>
                <p className="text-[#66666E] leading-relaxed">
                  {rec.whyItMatters}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] font-semibold block mb-1">
                  Recommended action
                </span>
                <p className="text-[#121214] leading-relaxed">
                  {rec.actionableFix}
                </p>
              </div>
            </div>

            {/* Optional Suggested Copy Box */}
            {rec.suggestedCopy && (
              <div className="mt-4 p-3 bg-[#FBFBFA] border border-[#EFEFEA] flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C94] block mb-1">
                    Suggested copy to deploy
                  </span>
                  <p className="text-xs text-[#121214] font-medium leading-relaxed font-mono">
                    &quot;{rec.suggestedCopy}&quot;
                  </p>
                </div>
                <button
                  onClick={() => copyText(rec.id, rec.suggestedCopy!)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#66666E] hover:text-[#121214] shrink-0 pt-1 cursor-pointer"
                  aria-label="Copy suggested copy"
                >
                  {copiedId === rec.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Optional Code snippet */}
            {rec.codeExample && (
              <div className="mt-4">
                <div className="flex items-center justify-between bg-[#121214] px-4 py-2 text-[11px] font-mono text-[#9E9EA4]">
                  <span>Code snippet adjustment</span>
                  <button
                    onClick={() => copyText(rec.id, rec.codeExample!)}
                    className="inline-flex items-center gap-1 text-white hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#18181B] p-4 text-xs font-mono text-white overflow-x-auto leading-relaxed">
                  <code>{rec.codeExample}</code>
                </pre>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
