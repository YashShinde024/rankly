"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe, FileSearch, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthGateModal } from "@/components/auth/auth-gate-modal";

interface ReportRow {
  auditId: string;
  hostname: string;
  pageTitle: string;
  scores: { overall: number; seo: number; aeo: number; geo: number };
  createdAtMs: number;
}

function formatDate(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 80 ? "text-emerald-700" : value >= 60 ? "text-amber-700" : "text-rose-700";
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className={`font-mono text-sm font-semibold ${tone}`}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-[#9E9EA4]">{label}</span>
    </div>
  );
}

export function MyReportsView() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [reports, setReports] = useState<ReportRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch("/api/me/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setReports(data.reports);
      } else {
        setReports([]);
        setLoadError(data?.message || "Couldn't load your reports. Please refresh to retry.");
      }
    } catch {
      setReports([]);
      setLoadError("Network issue while loading your reports. Please refresh to retry.");
    }
  }, [getIdToken]);

  useEffect(() => {
    // Mount-time data fetch: all state updates happen after the awaited token
    // resolution, never synchronously during the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user && reports === null) void load();
  }, [user, reports, load]);

  // Unauthenticated → sign-in prompt
  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5">
        <FileSearch className="h-8 w-8 text-[#C9C9C4] mx-auto" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-light tracking-tight">Sign in to view your reports</h1>
          <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed">
            Your Rankly workspace keeps every analysis in one place.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            href="/login?next=/my-reports"
            className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-5 py-2.5 text-xs font-medium hover:bg-black transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup?next=/my-reports"
            className="inline-flex items-center gap-1.5 border border-[#D4D4D0] bg-white px-5 py-2.5 text-xs font-medium text-[#121214] hover:border-[#B9B9B4] transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (authLoading || (user && reports === null && !loadError)) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading your reports">
        <div className="h-7 w-48 bg-[#EFEFEA] animate-pulse rounded-sm" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#EFEFEA] bg-white p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 border border-[#EFEFEA] bg-[#FCFCFA] animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-3.5 w-36 bg-[#EFEFEA] animate-pulse rounded-sm" />
                  <div className="h-2.5 w-24 bg-[#F3F3EF] animate-pulse rounded-sm" />
                </div>
              </div>
              <div className="hidden sm:flex gap-4">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="h-8 w-10 bg-[#F3F3EF] animate-pulse rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E] inline-flex items-center gap-2">
            <span className="spectral-dot" aria-hidden="true" />
            Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight mt-1.5">My Reports</h1>
        </div>
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 bg-[#121214] text-white px-4 py-2 text-xs font-medium hover:bg-black transition-colors self-start"
        >
          <span>Analyze a website</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </header>

      {loadError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2" role="alert">
          <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {reports !== null && reports.length === 0 && !loadError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border border-dashed border-[#D4D4D0] bg-white p-12 text-center space-y-4 max-w-md mx-auto"
        >
          <Globe className="h-7 w-7 text-[#C9C9C4] mx-auto" aria-hidden="true" />
          <div className="space-y-1.5">
            <h2 className="text-base font-medium">
              <span className="spectral-text-static">No reports yet.</span>
            </h2>
            <p className="text-xs text-[#66666E] leading-relaxed">
              Analyze your first website to start building your visibility history.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-5 py-2.5 text-xs font-medium hover:bg-black transition-colors"
          >
            <span>Analyze a website</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </motion.div>
      )}

      {reports !== null && reports.length > 0 && (
        <ul className="space-y-3">
          {reports.map((r, i) => (
            <motion.li
              key={r.auditId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(i * 0.04, 0.2) }}
            >
              <Link
                href={`/audit/${encodeURIComponent(r.auditId)}`}
                className="group block border border-[#EFEFEA] bg-white p-4 sm:p-5 transition-all hover:border-[#C9C9C4] hover:shadow-[0_2px_12px_rgba(18,18,20,0.06)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Favicon + identity */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="flex items-center justify-center h-11 w-11 border border-[#EFEFEA] bg-[#FCFCFA] shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.hostname)}&sz=64`}
                        alt=""
                        width={22}
                        height={22}
                        loading="lazy"
                        onError={(e) => {
                          const t = e.currentTarget;
                          t.style.display = "none";
                          t.nextElementSibling?.classList.remove("hidden");
                        }}
                        className="h-[22px] w-[22px]"
                      />
                      <Globe className="h-4.5 w-4.5 h-[18px] w-[18px] text-[#8C8C94] hidden" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <span className="block font-mono text-sm text-[#121214] truncate">{r.hostname}</span>
                      <span className="block text-[11px] text-[#8C8C94] mt-0.5">
                        {formatDate(r.createdAtMs)} ·{" "}
                        <span className="underline underline-offset-2 decoration-transparent group-hover:decoration-[#121214] transition-colors">
                          View report →
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-5 sm:gap-6 pl-[60px] sm:pl-0 border-t border-[#F3F3EF] sm:border-0 pt-3 sm:pt-0">
                    <ScoreBadge label="Overall" value={r.scores.overall} />
                    <ScoreBadge label="SEO" value={r.scores.seo} />
                    <ScoreBadge label="AEO" value={r.scores.aeo} />
                    <ScoreBadge label="GEO" value={r.scores.geo} />
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Safety net gate — should rarely be needed since API enforces limits */}
      <AuthGateModal open={false} onClose={() => {}} />
    </div>
  );
}
