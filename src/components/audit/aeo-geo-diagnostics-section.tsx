import React from "react";
import { AeoSignals, GeoSignals, HeadingItem } from "@/types/audit";
import { MessageSquare, Bot, HelpCircle, FileText, Check, AlertTriangle } from "lucide-react";

interface AeoGeoDiagnosticsProps {
  aeo: AeoSignals;
  geo: GeoSignals;
  headingTree: HeadingItem[];
}

export function AeoGeoDiagnosticsSection({ aeo, geo, headingTree }: AeoGeoDiagnosticsProps) {
  return (
    <section id="aeo-geo" className="border-b border-[#EFEFEA] pb-16 space-y-12">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          AEO & GEO Readiness Diagnostics
        </span>
        <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
          Answer & generative AI discoverability.
        </h3>
        <p className="mt-2 text-xs text-[#8C8C94] font-mono">
          * Measured content structure and entity clarity signals. Not a prediction of proprietary LLM recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AEO Section */}
        <div className="border border-[#EFEFEA] bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-violet-700" />
              <h4 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#121214]">
                Answer Engine Optimization (AEO)
              </h4>
            </div>
            <div className="font-mono text-lg font-light text-[#121214]">
              {aeo.score} <span className="text-xs text-[#8C8C94]">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-[#66666E] leading-relaxed">
            {aeo.summary}
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">Question-Oriented Headings:</span>
              <span className="font-semibold text-[#121214]">{aeo.questionOrientedHeadings} detected</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">FAQ Section / Pattern:</span>
              <span className={aeo.faqStructureDetected ? "text-emerald-700 font-semibold" : "text-amber-700"}>
                {aeo.faqStructureDetected ? "Detected" : "Not detected"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">Structured Schema Support:</span>
              <span className={aeo.structuredDataDetected ? "text-emerald-700 font-semibold" : "text-amber-700"}>
                {aeo.structuredDataDetected ? "Detected" : "Absent"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66666E]">Direct Intent Answer Sections:</span>
              <span className="font-semibold text-[#121214]">{aeo.clearAnswerSections} sections</span>
            </div>
          </div>
        </div>

        {/* GEO Section */}
        <div className="border border-[#EFEFEA] bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-700" />
              <h4 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#121214]">
                Generative Engine Optimization (GEO)
              </h4>
            </div>
            <div className="font-mono text-lg font-light text-[#121214]">
              {geo.score} <span className="text-xs text-[#8C8C94]">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-[#66666E] leading-relaxed">
            {geo.summary}
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">Semantic Structure:</span>
              <span className="font-semibold text-[#121214]">{geo.semanticStructure}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">Entity Identification (JSON-LD):</span>
              <span className={geo.entityClarity === "Strong" ? "text-emerald-700 font-semibold" : "text-amber-700"}>
                {geo.entityClarity}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA]/70 pb-2">
              <span className="text-[#66666E]">Author / Source Attribution:</span>
              <span className={geo.authorInfoDetected ? "text-emerald-700 font-semibold" : "text-[#8C8C94]"}>
                {geo.authorInfoDetected ? "Detected" : "Not detected"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66666E]">Topical Cluster Hierarchy:</span>
              <span className="font-semibold text-[#121214]">{geo.topicalHierarchy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Structure Heading Visualizer */}
      <div id="content-structure" className="border border-[#EFEFEA] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#121214]" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#121214]">
              Extracted Content Structure & Heading Hierarchy
            </h4>
          </div>
          <span className="font-mono text-[11px] text-[#8C8C94]">{headingTree.length} Headings Analyzed</span>
        </div>

        <p className="text-xs text-[#66666E]">
          Generative models and web indexers navigate topics using your heading hierarchy:
        </p>

        <div className="divide-y divide-[#EFEFEA]/60 font-mono text-xs max-h-72 overflow-y-auto">
          {headingTree.length === 0 ? (
            <div className="py-4 text-[#8C8C94]">No semantic headings (H1-H4) detected in body content.</div>
          ) : (
            headingTree.map((item, idx) => (
              <div
                key={idx}
                className="py-2 flex items-baseline gap-3"
                style={{ paddingLeft: `${Math.max(0, item.level - 1) * 16}px` }}
              >
                <span className="text-[10px] uppercase font-bold text-[#8C8C94] bg-[#F4F4F2] px-1.5 py-0.5 shrink-0">
                  {item.tag}
                </span>
                <span className={`truncate ${item.level === 1 ? "font-semibold text-[#121214]" : "text-[#66666E]"}`}>
                  {item.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
