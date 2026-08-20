"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { ArrowRight, Search, ShieldAlert, Sparkles, Compass, Home, RefreshCw } from "lucide-react";

interface AuditNotFoundProps {
  auditId: string;
}

export function AuditNotFound({ auditId }: AuditNotFoundProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
      }

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();
      if (res.ok && data.auditId) {
        router.push(`/audit/${data.auditId}`);
      } else if (res.status === 409 && data.existingAuditId) {
        router.push(`/audit/${data.existingAuditId}`);
      } else {
        setError(data.message || "Failed to analyze website. Please try another URL.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Network error. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-4xl px-6 py-20">
          <div className="border border-[#EFEFEA] bg-white p-8 sm:p-12 space-y-8">
            {/* Header Tag */}
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Audit Resolution Diagnostic</span>
            </div>

            {/* Main Title & ID */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
                Audit Report Not Found
              </h1>
              <p className="text-sm text-[#66666E] leading-relaxed">
                We couldn&apos;t locate an audit report matching reference{" "}
                <code className="font-mono px-2 py-0.5 bg-[#F4F4F0] border border-[#EFEFEA] text-[#121214] font-medium text-xs">
                  {auditId}
                </code>
                .
              </p>
            </div>

            {/* Why This Happens Box */}
            <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-5 space-y-3 text-xs">
              <span className="font-mono uppercase tracking-wider text-[#66666E] font-semibold block text-[11px]">
                Possible Causes
              </span>
              <ul className="space-y-1.5 text-[#66666E] list-disc list-inside">
                <li>The audit report may have expired or was generated in a previous test cycle.</li>
                <li>The audit reference was typed or copied incorrectly.</li>
                <li>The URL has not yet been analyzed by Rankly.</li>
              </ul>
            </div>

            {/* Immediate Re-Analyze Form */}
            <div className="space-y-3 pt-2">
              <label htmlFor="not-found-url-input" className="block font-mono text-xs uppercase tracking-wider text-[#66666E]">
                Run a Fresh Website Audit
              </label>
              <form onSubmit={handleAnalyze} className="relative flex items-center border border-[#121214] bg-white">
                <span className="pl-4 font-mono text-xs text-[#66666E] select-none" aria-hidden="true">
                  ↗
                </span>
                <input
                  id="not-found-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-transparent px-3 py-3 font-mono text-xs sm:text-sm text-[#121214] placeholder:text-[#9E9EA4] focus:outline-none"
                  disabled={isSubmitting}
                  autoComplete="url"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !url.trim()}
                  className="inline-flex items-center gap-1.5 bg-[#121214] px-5 py-3 text-xs font-medium text-white transition-all hover:bg-black disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Analyzing…</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
              {error && <p className="font-mono text-xs text-rose-700">{error}</p>}
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#EFEFEA] pt-6">
              <Link
                href="/explore"
                className="flex items-center justify-between p-4 border border-[#EFEFEA] hover:border-[#121214] bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Compass className="h-4 w-4 text-[#66666E] group-hover:text-[#121214]" />
                  <div>
                    <span className="block font-medium text-xs text-[#121214]">Browse Rankly Index</span>
                    <span className="block text-[11px] text-[#66666E]">View recently analyzed public websites</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C8C94] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-between p-4 border border-[#EFEFEA] hover:border-[#121214] bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-[#66666E] group-hover:text-[#121214]" />
                  <div>
                    <span className="block font-medium text-xs text-[#121214]">Return to Home</span>
                    <span className="block text-[11px] text-[#66666E]">Back to main audit intelligence tool</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#8C8C94] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
