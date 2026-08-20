"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DEMO_AUDIT } from "@/lib/demo-data";

export function SampleReportPreview() {
  const [filter, setFilter] = useState<"all" | "warning" | "pass">("all");

  const filteredChecks = DEMO_AUDIT.checks.filter((chk) => {
    if (filter === "all") return true;
    return chk.status === filter;
  });

  return (
    <section className="py-24 border-t border-[#EFEFEA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
              Report Output
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
              Real findings. No filler.
            </h2>
            <p className="mt-3 text-sm text-[#66666E]">
              Every audit report produces a structured diagnostic breakdown.
            </p>
          </div>

          <Link
            href="/audit/demo"
            className="group inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#121214] hover:text-[#2563EB] transition-colors self-start md:self-auto"
          >
            <span>Explore live demo report</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Wide Asymmetric Report Composition */}
        <div className="mt-16 border-t border-[#EFEFEA] pt-12">
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#EFEFEA] pb-8 items-baseline">
            <div className="md:col-span-4">
              <span className="font-mono text-[11px] text-[#66666E] uppercase tracking-wider">Target Domain</span>
              <div className="text-xl font-normal text-[#121214] mt-1 font-mono">
                example.com
              </div>
            </div>

            <div className="md:col-span-8 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] text-[#66666E] uppercase tracking-wider">Overall Score</span>
                <div className="font-mono text-xl font-medium text-[#121214] mt-1">
                  87 / 100
                </div>
              </div>

              <div className="flex items-center gap-8 font-mono text-xs">
                <div>
                  <span className="text-[#66666E]">Technical</span> <span className="text-[#121214] font-medium ml-1">92</span>
                </div>
                <div>
                  <span className="text-[#66666E]">On-Page</span> <span className="text-[#121214] font-medium ml-1">84</span>
                </div>
                <div>
                  <span className="text-[#66666E]">Content</span> <span className="text-[#121214] font-medium ml-1">81</span>
                </div>
                <div>
                  <span className="text-[#66666E]">Social</span> <span className="text-[#121214] font-medium ml-1">90</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center justify-between py-4 border-b border-[#EFEFEA] text-xs font-mono">
            <div className="text-[#66666E]">
              Showing {filteredChecks.length} signals
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`transition-colors ${filter === "all" ? "text-[#121214] font-semibold underline underline-offset-4" : "text-[#66666E] hover:text-[#121214]"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("warning")}
                className={`transition-colors ${filter === "warning" ? "text-[#121214] font-semibold underline underline-offset-4" : "text-[#66666E] hover:text-[#121214]"}`}
              >
                Warnings (3)
              </button>
              <button
                onClick={() => setFilter("pass")}
                className={`transition-colors ${filter === "pass" ? "text-[#121214] font-semibold underline underline-offset-4" : "text-[#66666E] hover:text-[#121214]"}`}
              >
                Passed (18)
              </button>
            </div>
          </div>

          {/* Findings lines */}
          <div className="divide-y divide-[#EFEFEA]">
            {filteredChecks.slice(0, 6).map((check) => (
              <div
                key={check.id}
                className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 text-xs"
              >
                <div className="flex items-baseline gap-4">
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      check.status === "pass"
                        ? "text-emerald-700 font-medium"
                        : "text-amber-700 font-medium"
                    }`}
                  >
                    {check.status === "pass" ? "PASS" : "WARN"}
                  </span>
                  <div>
                    <span className="text-[#121214] font-medium">{check.title}</span>
                    <p className="text-[#66666E] mt-0.5">{check.description}</p>
                  </div>
                </div>

                <div className="font-mono text-[11px] text-[#66666E] pl-12 sm:pl-0">
                  {String(check.value || "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
