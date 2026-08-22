"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExploreAuditRecord } from "@/types/audit";
import { Search, ArrowUpRight, ArrowRight, Compass, Filter } from "lucide-react";

interface RanklyIndexViewProps {
  initialAudits: ExploreAuditRecord[];
}

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 65) return "text-amber-700";
  return "text-rose-700";
}

function barTone(score: number): string {
  if (score >= 80) return "bg-emerald-600";
  if (score >= 65) return "bg-amber-500";
  return "bg-rose-600";
}

function PillarBar({ label, score }: { label: string; score: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C94] w-7 shrink-0">
        {label}
      </span>
      <div className="h-1 flex-1 max-w-[72px] bg-[#EFEFEA] overflow-hidden" aria-hidden="true">
        <motion.div
          className={`h-full ${barTone(score)}`}
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.15 }}
          style={reduce ? { width: `${score}%` } : undefined}
        />
      </div>
      <strong className={`font-mono text-[11px] w-6 text-right ${scoreTone(score)}`}>{score}</strong>
    </div>
  );
}

export function RanklyIndexView({ initialAudits }: RanklyIndexViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "needs-attention">("all");
  const [areaFilter, setAreaFilter] = useState<"all" | "SEO" | "AEO" | "GEO">("all");
  const reduce = useReducedMotion();

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
          <label htmlFor="index-search" className="sr-only">
            Search analyzed websites
          </label>
          <input
            id="index-search"
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
              aria-pressed={scoreFilter === "all"}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                scoreFilter === "all" ? "bg-[#121214] text-white" : "text-[#66666E] hover:text-[#121214]"
              }`}
            >
              All Scores
            </button>
            <button
              onClick={() => setScoreFilter("high")}
              aria-pressed={scoreFilter === "high"}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                scoreFilter === "high" ? "bg-[#121214] text-white" : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              High (80+)
            </button>
            <button
              onClick={() => setScoreFilter("needs-attention")}
              aria-pressed={scoreFilter === "needs-attention"}
              className={`px-3 py-1 transition-colors cursor-pointer ${
                scoreFilter === "needs-attention" ? "bg-[#121214] text-white" : "text-amber-700 hover:text-amber-900"
              }`}
            >
              Needs Attention (&lt;80)
            </button>
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-[#8C8C94]" aria-hidden="true" />
            <div className="flex items-center border border-[#EFEFEA] bg-[#FAFAFA] p-0.5">
              {(["all", "SEO", "AEO", "GEO"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAreaFilter(f)}
                  aria-pressed={areaFilter === f}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${
                    areaFilter === f ? "bg-[#121214] text-white" : "text-[#66666E] hover:text-[#121214]"
                  }`}
                >
                  {f === "all" ? "All pillars" : `${f} 70+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result count */}
      {initialAudits.length > 0 && (
        <p className="text-[11px] font-mono text-[#8C8C94]" role="status">
          Showing {filteredAudits.length} of {initialAudits.length} indexed audits · Reports expire after 30 days
        </p>
      )}

      {/* Real Index Table / Responsive Stack */}
      {filteredAudits.length === 0 ? (
        initialAudits.length === 0 ? (
          /* Empty installation state */
          <div className="relative overflow-hidden border border-[#EFEFEA] bg-white py-24 px-8 text-center space-y-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(480px 220px at 50% 0%, rgba(139,92,246,0.06), transparent 70%)",
              }}
            />
            <div className="relative inline-flex items-center justify-center h-12 w-12 border border-[#EFEFEA] bg-[#FBFBFA]">
              <Compass className="h-5 w-5 text-[#66666E]" />
            </div>
            <div className="relative space-y-2">
              <h2 className="text-xl font-light tracking-tight text-[#121214]">
                The Index is waiting for its first record.
              </h2>
              <p className="max-w-md mx-auto text-xs sm:text-sm text-[#66666E] leading-relaxed">
                Every website analyzed by Rankly gets a public intelligence record here — overall
                health, SEO/AEO/GEO pillar scores, and when it was audited. Be the first entry.
              </p>
            </div>
            <div className="relative pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 bg-[#121214] px-5 py-2.5 text-xs font-medium text-white hover:bg-black transition-colors"
              >
                <span>Run the first audit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="relative text-[11px] font-mono text-[#9E9EA4]">
              Try a well-known domain like linear.app or github.com to see a full report.
            </p>
          </div>
        ) : (
          /* No filter matches */
          <div className="py-16 text-center border border-[#EFEFEA] bg-white p-8 space-y-4">
            <p className="text-sm text-[#121214] font-medium">
              No websites match your search and filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setScoreFilter("all");
                setAreaFilter("all");
              }}
              className="text-xs font-mono text-[#66666E] underline underline-offset-4 hover:text-[#121214] cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )
      ) : (
        <div className="border border-[#EFEFEA] bg-white">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#EFEFEA] px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-[#66666E] bg-[#FAFAFA]">
            <div className="col-span-4">Domain</div>
            <div className="col-span-2">Overall</div>
            <div className="col-span-4">Pillar Breakdown</div>
            <div className="col-span-2 text-right">Analyzed</div>
          </div>

          {/* Records List */}
          <div className="divide-y divide-[#EFEFEA]">
            {filteredAudits.map((item, i) => (
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
              >
                <Link
                  href={`/explore/${item.id}`}
                  className="block p-5 md:px-6 md:py-4 transition-colors hover:bg-[#FBFBFA] text-xs font-mono group"
                  aria-label={`${item.domain} audit report — overall score ${item.overallScore} of 100`}
                >
                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#8C8C94] group-hover:text-violet-600 shrink-0 transition-colors" />
                        <span className="font-medium text-[#121214] group-hover:text-violet-800 transition-colors truncate">
                          {item.domain}
                        </span>
                      </div>
                      {item.scoreInterpretation && (
                        <span className="block mt-1 ml-5.5 text-[10px] text-[#9E9EA4] font-sans truncate">
                          {item.scoreInterpretation}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <span className={`font-semibold text-base ${scoreTone(item.overallScore)}`}>
                        {item.overallScore}
                      </span>
                      <span className="text-[#8C8C94] text-[10px]"> /100</span>
                    </div>

                    <div className="col-span-4 space-y-1">
                      <PillarBar label="SEO" score={item.pillars.seo} />
                      <PillarBar label="AEO" score={item.pillars.aeo} />
                      <PillarBar label="GEO" score={item.pillars.geo} />
                    </div>

                    <div className="col-span-2 text-right text-[#8C8C94] text-[11px]">
                      {item.timeAgo}
                    </div>
                  </div>

                  {/* Mobile Stacked Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-medium text-sm text-[#121214] group-hover:text-violet-800 truncate block">
                          {item.domain}
                        </span>
                        {item.scoreInterpretation && (
                          <span className="block mt-0.5 text-[10px] text-[#9E9EA4] font-sans">
                            {item.scoreInterpretation}
                          </span>
                        )}
                      </div>
                      <span className={`font-bold shrink-0 ${scoreTone(item.overallScore)}`}>
                        {item.overallScore} /100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <PillarBar label="SEO" score={item.pillars.seo} />
                      <PillarBar label="AEO" score={item.pillars.aeo} />
                      <PillarBar label="GEO" score={item.pillars.geo} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8C8C94]">
                      <span>{item.timeAgo}</span>
                      <span className="inline-flex items-center gap-1 text-violet-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        View report <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
