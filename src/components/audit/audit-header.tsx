"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Link2, Check, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { SeoAuditReport } from "@/types/audit";

interface AuditHeaderProps {
  report: SeoAuditReport;
  activeTab?: "overview" | "details";
  isNewlyOnboarded?: boolean;
}

export function AuditHeader({ report, activeTab = "overview", isNewlyOnboarded = false }: AuditHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPdf = () => {
    setDownloading(true);
    const exportUrl = `/api/audit/${encodeURIComponent(report.id)}/pdf`;
    
    const printWindow = window.open(exportUrl, "_blank");
    if (!printWindow) {
      const link = document.createElement("a");
      link.href = exportUrl;
      link.download = `rankly-audit-${report.domain.replace(/[^a-z0-9]/gi, "-")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <header className="border-b border-[#EFEFEA] bg-[#FBFBFA] pt-8 pb-6">
      <div className="mx-auto max-w-6xl px-6 space-y-6">
        {/* Confirmed Persistence Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#EFEFEA] text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Audit saved to the Rankly Index</span>
          </div>

          <Link
            href={`/explore/${report.id}`}
            className="inline-flex items-center gap-1 text-[#121214] font-medium hover:text-[#2563EB] transition-colors"
          >
            <span>View audit in Index</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Top Reference & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#66666E] hover:text-[#121214] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>New audit</span>
            </Link>
            <span className="text-[#D4D4D0]">|</span>
            <span className="font-mono text-xs text-[#66666E]">
              AUDIT <strong className="text-[#121214] font-medium">#{report.id}</strong>
            </span>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            <button
              onClick={handleExportPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-3.5 py-1.5 text-xs font-medium hover:bg-black transition-colors"
              title="Open print-ready PDF document"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading ? "Preparing PDF…" : "Export PDF"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 border border-[#EFEFEA] bg-white px-3 py-1.5 text-[#66666E] hover:text-[#121214] hover:border-[#121214] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="text-emerald-700">Link copied</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Copy report link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Domain Title & Real Measured Diagnostics */}
        <div className="mt-2 flex flex-col md:flex-row md:items-baseline justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#121214]">
                {report.domain || "Website unavailable"}
              </h1>
              {report.url && (
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#66666E] hover:text-[#121214] inline-flex items-center gap-1"
                  aria-label={`Visit ${report.domain} in new window`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Factual Audit Metadata Strip */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[#66666E]">
              <span>Scanned {report.formattedDate}</span>
              <span>·</span>
              <span>{report.technicalDetails.protocol}</span>
              <span>·</span>
              <span className="text-emerald-700">{report.technicalDetails.httpStatus} OK</span>
              <span>·</span>
              <span>{report.technicalDetails.responseTimeMs} ms TTFB</span>
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="flex items-center gap-6 font-mono text-xs shrink-0" aria-label="Audit views">
            <Link
              href={`/audit/${report.id}`}
              className={`transition-colors pb-1 ${
                activeTab === "overview"
                  ? "text-[#121214] font-semibold border-b-2 border-[#121214]"
                  : "text-[#66666E] hover:text-[#121214]"
              }`}
            >
              Overview
            </Link>
            <Link
              href={`/audit/${report.id}/details`}
              className={`transition-colors pb-1 ${
                activeTab === "details"
                  ? "text-[#121214] font-semibold border-b-2 border-[#121214]"
                  : "text-[#66666E] hover:text-[#121214]"
              }`}
            >
              Diagnostics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
