import React from "react";
import Link from "next/link";
import { ArrowUpRight, Search, MessageSquare, Bot, CheckCircle2 } from "lucide-react";
import { DEMO_AUDIT } from "@/lib/demo-data";

export function AuditHeroPreview() {
  const { pillars, executiveSummary, snapshot } = DEMO_AUDIT;

  return (
    <div className="border border-[#121214] bg-white transition-all">
      {/* Top Window Meta Bar */}
      <div className="flex items-center justify-between border-b border-[#EFEFEA] bg-[#FBFBFA] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#121214] font-semibold">
            AUDIT #RKL-8F31A2
          </span>
          <span className="text-[#D4D4D0]">|</span>
          <span className="font-mono text-xs text-[#66666E]">example.com</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-emerald-700 font-medium">● Live Diagnostic</span>
          <Link
            href="/audit/demo"
            className="group inline-flex items-center gap-1 text-[#121214] font-medium hover:text-[#2563EB]"
          >
            <span>Open report</span>
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* Preview Content Spread */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Executive Headline & 3 Pillars */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E] block mb-1">
            Executive Summary Preview
          </span>
          <h3 className="text-lg sm:text-2xl font-light tracking-tight text-[#121214]">
            {executiveSummary.headline}
          </h3>
        </div>

        {/* 3 Pillars Spread (SEO, AEO, GEO) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#EFEFEA] p-4 bg-[#FCFCFA]">
            <div className="flex items-center justify-between text-xs font-mono text-[#66666E]">
              <span className="flex items-center gap-1.5 font-semibold text-[#121214]">
                <Search className="h-3.5 w-3.5" />
                <span>Search (SEO)</span>
              </span>
              <strong className="text-base text-[#121214]">{pillars.seo.score}</strong>
            </div>
            <div className="text-[11px] text-[#66666E] mt-2 truncate">{pillars.seo.verdict}</div>
          </div>

          <div className="border border-[#EFEFEA] p-4 bg-[#FCFCFA]">
            <div className="flex items-center justify-between text-xs font-mono text-[#66666E]">
              <span className="flex items-center gap-1.5 font-semibold text-[#121214]">
                <MessageSquare className="h-3.5 w-3.5 text-violet-700" />
                <span>Answers (AEO)</span>
              </span>
              <strong className="text-base text-[#121214]">{pillars.aeo.score}</strong>
            </div>
            <div className="text-[11px] text-[#66666E] mt-2 truncate">{pillars.aeo.verdict}</div>
          </div>

          <div className="border border-[#EFEFEA] p-4 bg-[#FCFCFA]">
            <div className="flex items-center justify-between text-xs font-mono text-[#66666E]">
              <span className="flex items-center gap-1.5 font-semibold text-[#121214]">
                <Bot className="h-3.5 w-3.5 text-blue-700" />
                <span>Generative (GEO)</span>
              </span>
              <strong className="text-base text-[#121214]">{pillars.geo.score}</strong>
            </div>
            <div className="text-[11px] text-[#66666E] mt-2 truncate">{pillars.geo.verdict}</div>
          </div>
        </div>

        {/* Snapshot Summary Strip */}
        <div className="pt-4 border-t border-[#EFEFEA] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <span className="text-[#8C8C94] text-[10px] uppercase block">Server TTFB</span>
            <span className="text-[#121214] font-medium">{snapshot.responseTimeMs} ms (200 OK)</span>
          </div>
          <div>
            <span className="text-[#8C8C94] text-[10px] uppercase block">Images</span>
            <span className="text-amber-700 font-medium">{snapshot.imagesMissingAlt} missing alt</span>
          </div>
          <div>
            <span className="text-[#8C8C94] text-[10px] uppercase block">Structured Data</span>
            <span className="text-emerald-700 font-medium">Schema JSON-LD</span>
          </div>
          <div>
            <span className="text-[#8C8C94] text-[10px] uppercase block">Heading Hierarchy</span>
            <span className="text-[#121214] font-medium">{snapshot.headingCounts.h1} H1, {snapshot.headingCounts.h2} H2s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
