"use client";

import React, { useState } from "react";
import { AuditCheck, CheckStatus, PillarArea } from "@/types/audit";
import { ChevronDown, ChevronUp, Check, AlertTriangle, AlertCircle, Copy } from "lucide-react";

interface DetailedChecksTableProps {
  checks: AuditCheck[];
}

export function DetailedChecksTable({ checks }: DetailedChecksTableProps) {
  const [statusFilter, setStatusFilter] = useState<CheckStatus | "all">("all");
  const [areaFilter, setAreaFilter] = useState<PillarArea | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredChecks = checks.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (areaFilter !== "all" && c.area !== areaFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="findings" className="space-y-6 border-b border-[#EFEFEA] pb-16">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            Comprehensive Signal Findings
          </span>
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
            Measured observations & evidence.
          </h3>
        </div>

        {/* Real Dynamic Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Status Filters */}
          <div className="flex items-center border border-[#EFEFEA] bg-white p-0.5">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 ${statusFilter === "all" ? "bg-[#121214] text-white" : "text-[#66666E] hover:text-[#121214]"}`}
            >
              All ({checks.length})
            </button>
            <button
              onClick={() => setStatusFilter("error")}
              className={`px-2.5 py-1 ${statusFilter === "error" ? "bg-[#121214] text-white" : "text-rose-700 hover:text-rose-900"}`}
            >
              Critical ({checks.filter((c) => c.status === "error").length})
            </button>
            <button
              onClick={() => setStatusFilter("warning")}
              className={`px-2.5 py-1 ${statusFilter === "warning" ? "bg-[#121214] text-white" : "text-amber-700 hover:text-amber-900"}`}
            >
              Warnings ({checks.filter((c) => c.status === "warning").length})
            </button>
            <button
              onClick={() => setStatusFilter("pass")}
              className={`px-2.5 py-1 ${statusFilter === "pass" ? "bg-[#121214] text-white" : "text-emerald-700 hover:text-emerald-900"}`}
            >
              Passed ({checks.filter((c) => c.status === "pass").length})
            </button>
          </div>

          {/* Area Filters */}
          <div className="flex items-center border border-[#EFEFEA] bg-white p-0.5">
            <button
              onClick={() => setAreaFilter("all")}
              className={`px-2 py-1 ${areaFilter === "all" ? "bg-[#121214] text-white" : "text-[#66666E]"}`}
            >
              All Areas
            </button>
            <button
              onClick={() => setAreaFilter("SEO")}
              className={`px-2 py-1 ${areaFilter === "SEO" ? "bg-[#121214] text-white" : "text-[#66666E]"}`}
            >
              SEO
            </button>
            <button
              onClick={() => setAreaFilter("AEO")}
              className={`px-2 py-1 ${areaFilter === "AEO" ? "bg-[#121214] text-white" : "text-[#66666E]"}`}
            >
              AEO
            </button>
            <button
              onClick={() => setAreaFilter("GEO")}
              className={`px-2 py-1 ${areaFilter === "GEO" ? "bg-[#121214] text-white" : "text-[#66666E]"}`}
            >
              GEO
            </button>
          </div>
        </div>
      </div>

      {/* Structured Findings Table */}
      <div className="border border-[#EFEFEA] bg-white divide-y divide-[#EFEFEA]">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-[#66666E] bg-[#FAFAFA]">
          <div className="col-span-5 sm:col-span-4">Signal / Check</div>
          <div className="col-span-2 sm:col-span-2">Area</div>
          <div className="col-span-2 sm:col-span-2">Status</div>
          <div className="col-span-3 sm:col-span-4 text-right sm:text-left">Observed Value</div>
        </div>

        {filteredChecks.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[#8C8C94]">
            No signals match the selected filter criteria.
          </div>
        ) : (
          filteredChecks.map((chk) => {
            const isExpanded = expandedId === chk.id;

            return (
              <div key={chk.id} className="text-xs transition-colors hover:bg-[#FBFBFA]">
                <div
                  onClick={() => toggleExpand(chk.id)}
                  className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 cursor-pointer select-none"
                >
                  {/* Title & Chevron */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-[#8C8C94] shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-[#8C8C94] shrink-0" />
                    )}
                    <span className="font-medium text-[#121214] truncate">{chk.title}</span>
                  </div>

                  {/* Pillar Area */}
                  <div className="col-span-2 sm:col-span-2 font-mono text-[11px] text-[#66666E]">
                    <span className="border border-[#EFEFEA] bg-[#FAFAFA] px-1.5 py-0.5">
                      {chk.area}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 sm:col-span-2 font-mono text-[11px]">
                    {chk.status === "pass" ? (
                      <span className="text-emerald-700 font-medium">Pass</span>
                    ) : chk.status === "warning" ? (
                      <span className="text-amber-700 font-medium">Warning</span>
                    ) : (
                      <span className="text-rose-700 font-bold">Critical</span>
                    )}
                  </div>

                  {/* Observation Snippet */}
                  <div className="col-span-3 sm:col-span-4 font-mono text-xs text-right sm:text-left text-[#66666E] truncate">
                    {chk.value !== undefined && chk.value !== null
                      ? String(chk.value)
                      : chk.status === "pass"
                      ? "Standard compliant"
                      : "Action required"}
                  </div>
                </div>

                {/* Expanded Row Diagnostic Evidence */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-[#FCFCFA] border-t border-[#EFEFEA] space-y-3 font-sans">
                    <p className="text-xs text-[#121214] leading-relaxed">
                      {chk.details || chk.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                      {chk.expected && (
                        <div className="p-2.5 bg-white border border-[#EFEFEA]">
                          <span className="text-[#8C8C94] text-[10px] uppercase block mb-0.5">
                            Expected Standard
                          </span>
                          <span className="text-[#121214]">{chk.expected}</span>
                        </div>
                      )}

                      {chk.value && (
                        <div className="p-2.5 bg-white border border-[#EFEFEA]">
                          <span className="text-[#8C8C94] text-[10px] uppercase block mb-0.5">
                            Measured Observation
                          </span>
                          <span className="text-[#121214] truncate block">{String(chk.value)}</span>
                        </div>
                      )}
                    </div>

                    {chk.recommendation && (
                      <div className="p-3 bg-white border-l-2 border-[#121214] border border-[#EFEFEA] text-xs space-y-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] font-bold block">
                          Recommended Remediation
                        </span>
                        <p className="text-[#66666E] leading-relaxed font-sans">{chk.recommendation}</p>
                      </div>
                    )}

                    {chk.codeSnippet && (
                      <div className="mt-2">
                        <pre className="bg-[#18181B] p-3 text-[11px] font-mono text-white overflow-x-auto">
                          <code>{chk.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
