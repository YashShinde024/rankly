"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExploreAuditRecord } from "@/types/audit";
import { Search, ArrowUpRight, ArrowRight, ShieldCheck, Filter } from "lucide-react";

interface RanklyIndexViewProps {
  initialAudits: ExploreAuditRecord[];
}

export function RanklyIndexView({ initialAudits }: RanklyIndexViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "needs-attention">("all");
  const [areaFilter, setAreaFilter] = useState<"all" | "SEO" | "AEO" | "GEO">("all");

  const filteredAudits = initialAudits.filter((audit) => {
    // 1. Search Query Filter (public hostname search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!audit.domain.toLowerCase().includes(q)) {
        return false;
      }
    }

    // 2. Score Filter
    if (scoreFilter === "high" && audit.overallScore < 80) return false;
    if (scoreFilter === "needs-attention" && audit.overallScore >= 80) return false;

    // 3. Area Pillar Filter
    if (areaFilter === "SEO" && audit.pillars.seo < 70) return false;
    if (areaFilter === "AEO" && audit.pillars.aeo < 70) return false;
    if (areaFilter === "GEO" && audit.pillars.geo < 70) return false;

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[#EFEFEA] bg-white">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8C94]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analyzed websites (e.g. example.com)..."
            className="w-full bg-[#FAFAFA] border border-[#EFEFEA] py-2 pl-9 pr-4 text-xs font-mono placeholder:text-[#8C8C94] focus:border-[#121214] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Status Filter */}
          <div className="flex items-center border border-[#EFEFEA] bg-[#FAFAFA] p-0.5">
            <button
              onClick={() => setScoreFilter("all")}
              className={`px-3 py-1 transition-colors ${
                scoreFilter === "all" ? "bg-[#121214] text-white" : "text-[#66666E] hover:text-[#121214]"
              }`}
            >
              All Scores
            </button>
            <button
              onClick={() => setScoreFilter("high")}
              className={`px-3 py-1 transition-colors ${
                scoreFilter === "high" ? "bg-[#121214] text-white" : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              High (80+)
            </button>
            <button
              onClick={() => setScoreFilter("needs-attention")}
              className={`px-3 py-1 transition-colors ${
                scoreFilter === "needs-attention" ? "bg-[#121214] text-white" : "text-amber-700 hover:text-amber-900"
              }`}
            >
              Needs Attention (&lt;80)
            </button>
          </div>

          {/* Area Filter */}
          <div className="flex items-center border border-[#EFEFEA] bg-[#FAFAFA] p-0.5">
            <button
              onClick={() => setAreaFilter("all")}
              className={`px-2.5 py-1 transition-colors ${
                areaFilter === "all" ? "bg-[#121214] text-white" : "text-[#66666E]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAreaFilter("SEO")}
              className={`px-2.5 py-1 transition-colors ${
                areaFilter === "SEO" ? "bg-[#121214] text-white" : "text-[#66666E]"
              }`}
            >
              SEO 70+
            </button>
            <button
              onClick={() => setAreaFilter("AEO")}
              className={`px-2.5 py-1 transition-colors ${
                areaFilter === "AEO" ? "bg-[#121214] text-white" : "text-[#66666E]"
              }`}
            >
              AEO 70+
            </button>
            <button
              onClick={() => setAreaFilter("GEO")}
              className={`px-2.5 py-1 transition-colors ${
                areaFilter === "GEO" ? "bg-[#121214] text-white" : "text-[#66666E]"
              }`}
            >
              GEO 70+
            </button>
          </div>
        </div>
      </div>

      {/* Real Index Table / Responsive Stack */}
      {filteredAudits.length === 0 ? (
        <div className="py-20 text-center border border-[#EFEFEA] bg-white p-8 space-y-4">
          <p className="text-sm text-[#121214] font-medium">
            {initialAudits.length === 0
              ? "No audits yet."
              : "No websites match your search and filter criteria."}
          </p>
          {initialAudits.length === 0 && (
            <p className="text-xs text-[#66666E]">
              Be among the first to analyze a website.
            </p>
          )}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#121214] px-5 py-2.5 text-xs font-medium text-white hover:bg-black transition-colors"
            >
              <span>Analyze website</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-[#EFEFEA] bg-white">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#EFEFEA] px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-[#66666E] bg-[#FAFAFA]">
            <div className="col-span-4">Domain</div>
            <div className="col-span-2">Overall Score</div>
            <div className="col-span-3">SEO / AEO / GEO</div>
            <div className="col-span-3 text-right">Analyzed</div>
          </div>

          {/* Records List */}
          <div className="divide-y divide-[#EFEFEA]">
            {filteredAudits.map((item) => (
              <Link
                key={item.id}
                href={`/explore/${item.id}`}
                className="block p-5 md:px-6 md:py-4 transition-colors hover:bg-[#FBFBFA] text-xs font-mono group"
              >
                {/* Desktop Grid Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-2 truncate">
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C94] group-hover:text-[#2563EB] shrink-0 transition-colors" />
                    <span className="font-medium text-[#121214] group-hover:text-[#2563EB] transition-colors truncate">
                      {item.domain}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`font-semibold text-sm ${
                        item.overallScore >= 80
                          ? "text-emerald-700"
                          : item.overallScore >= 65
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {item.overallScore}
                    </span>
                    <span className="text-[#8C8C94] text-[10px]"> / 100</span>
                  </div>

                  <div className="col-span-3 flex items-center gap-3 text-[11px] text-[#66666E]">
                    <span>SEO <strong className="text-[#121214]">{item.pillars.seo}</strong></span>
                    <span>·</span>
                    <span>AEO <strong className="text-[#121214]">{item.pillars.aeo}</strong></span>
                    <span>·</span>
                    <span>GEO <strong className="text-[#121214]">{item.pillars.geo}</strong></span>
                  </div>

                  <div className="col-span-3 text-right text-[#8C8C94] text-[11px]">
                    {item.timeAgo}
                  </div>
                </div>

                {/* Mobile Stacked Layout */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-[#121214] group-hover:text-[#2563EB]">
                      {item.domain}
                    </span>
                    <span
                      className={`font-bold ${
                        item.overallScore >= 80
                          ? "text-emerald-700"
                          : item.overallScore >= 65
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {item.overallScore} / 100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#66666E] pt-1">
                    <div className="flex items-center gap-2">
                      <span>SEO: {item.pillars.seo}</span>
                      <span>AEO: {item.pillars.aeo}</span>
                      <span>GEO: {item.pillars.geo}</span>
                    </div>
                    <span className="text-[#8C8C94]">{item.timeAgo}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
