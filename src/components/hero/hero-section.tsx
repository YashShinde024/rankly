"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, AlertCircle, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { AuditHeroPreview } from "./audit-hero-preview";

type ScanStep = "validating" | "connecting" | "checking" | "ai" | "done";

interface CooldownInfo {
  domain: string;
  existingAuditId: string;
  nextAllowedDate?: string;
}

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [activeStep, setActiveStep] = useState<ScanStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<ScanStep>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [cooldownInfo, setCooldownInfo] = useState<CooldownInfo | null>(null);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCooldownInfo(null);

    const inputUrl = url.trim();
    if (!inputUrl) {
      setError("Enter a valid public website URL.");
      return;
    }

    if (!inputUrl.includes(".") || inputUrl.length < 4) {
      setError("That doesn't look like a valid website URL.");
      return;
    }

    try {
      setActiveStep("validating");
      setCompletedSteps(new Set());

      // Authentic pacing reflecting multi-stage processing
      const t1 = setTimeout(() => {
        setCompletedSteps((prev) => new Set(prev).add("validating"));
        setActiveStep("connecting");
      }, 400);

      const t2 = setTimeout(() => {
        setCompletedSteps((prev) => new Set(prev).add("connecting"));
        setActiveStep("checking");
      }, 1000);

      const t3 = setTimeout(() => {
        setCompletedSteps((prev) => new Set(prev).add("checking"));
        setActiveStep("ai");
      }, 1800);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await response.json();

      if (!response.ok) {
        setActiveStep(null);
        setCompletedSteps(new Set());

        if (response.status === 409 && data.error === "DOMAIN_COOLDOWN") {
          // 7-day cooldown UX feedback
          setCooldownInfo({
            domain: data.domain || inputUrl,
            existingAuditId: data.existingAuditId,
            nextAllowedDate: data.nextAllowedDate,
          });
          return;
        }

        if (response.status === 429) {
          setError("You've reached the current audit limit (5 audits per hour). Please try again later.");
        } else if (response.status === 408) {
          setError("The website took too long to respond.");
        } else if (response.status === 422) {
          setError(data.message || "This website can't be analyzed (unreachable or unsupported content).");
        } else {
          setError(data.message || "Enter a valid public website URL.");
        }
        return;
      }

      setCompletedSteps((prev) => new Set(prev).add("validating").add("connecting").add("checking").add("ai"));
      setActiveStep("done");

      setTimeout(() => {
        router.push(`/audit/${data.auditId}`);
      }, 450);
    } catch {
      setActiveStep(null);
      setCompletedSteps(new Set());
      setError("We couldn't reach this website. Please check your network connection.");
    }
  };

  const isScanning = activeStep !== null;

  return (
    <section className="pt-20 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Left-Aligned Editorial Composition */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
            <span>Search & AI Visibility Intelligence</span>
            <span className="text-[#D4D4D0]">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#121214]">
              <Sparkles className="h-3 w-3 text-violet-600" />
              <span>SEO · AEO · GEO</span>
            </span>
          </div>

          <h1 className="mt-4 text-4xl sm:text-6xl font-light tracking-tight text-[#121214] leading-[1.08]">
            Understand how your <br />
            website is seen by <br />
            <span className="font-normal text-[#121214]">search & AI systems.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm sm:text-base text-[#66666E] leading-relaxed">
            Analyze your website&apos;s technical SEO, content structure, answer-engine readiness, and AI discoverability signals — then see exactly what to improve.
          </p>

          {/* Instrument URL Input with Gemini Spectrum Border on CTA */}
          <div className="mt-8 max-w-xl">
            <form
              onSubmit={handleAnalyze}
              className="relative flex items-center border border-[#121214] bg-white transition-all focus-within:ring-2 focus-within:ring-[#121214]/10"
            >
              <label htmlFor="url-input" className="sr-only">
                Website URL to audit
              </label>
              <span className="pl-4 font-mono text-xs text-[#66666E] select-none" aria-hidden="true">
                ↗
              </span>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                  if (cooldownInfo) setCooldownInfo(null);
                }}
                placeholder="https://yourwebsite.com"
                className="w-full bg-transparent px-3 py-3 font-mono text-xs sm:text-sm text-[#121214] placeholder:text-[#9E9EA4] focus:outline-hidden"
                disabled={isScanning}
                autoComplete="url"
                spellCheck={false}
              />
              {/* Primary Analyze Button with subtle animated spectrum border */}
              <div className="relative p-[1px] rounded-none group shrink-0">
                <div className="absolute inset-0 spectrum-border opacity-75 group-hover:opacity-100 transition-opacity" />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="relative inline-flex items-center gap-1.5 bg-[#121214] px-5 py-3 text-xs font-medium text-white transition-all hover:bg-black disabled:opacity-80 shrink-0"
                >
                  {activeStep === "done" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Audit ready</span>
                    </>
                  ) : isScanning ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                      <span>Analyzing…</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze website</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sequential Scanning State UI with subtle spectrum accent during AI stage */}
            {isScanning && (
              <div
                className="mt-4 border border-[#EFEFEA] bg-white p-4 space-y-2 text-xs font-mono"
                aria-live="polite"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#66666E] font-semibold">
                    Auditing Signals
                  </span>
                  <span className="text-[10px] text-[#8C8C94]">SEO · AEO · GEO Diagnostics</span>
                </div>

                <div className="flex items-center gap-2">
                  {completedSteps.has("validating") ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={completedSteps.has("validating") ? "text-[#121214]" : "text-[#66666E]"}>
                    URL & protocol security validated
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {completedSteps.has("connecting") ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  ) : activeStep === "connecting" ? (
                    <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse shrink-0 ml-0.5 mr-1" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#D4D4D0] shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={completedSteps.has("connecting") ? "text-[#121214]" : activeStep === "connecting" ? "text-[#121214]" : "text-[#9E9EA4]"}>
                    Fetching website HTML, headers, robots.txt & sitemaps
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {completedSteps.has("checking") ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  ) : activeStep === "checking" ? (
                    <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse shrink-0 ml-0.5 mr-1" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#D4D4D0] shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={completedSteps.has("checking") ? "text-[#121214]" : activeStep === "checking" ? "text-[#121214]" : "text-[#9E9EA4]"}>
                    Evaluating deterministic SEO, AEO & GEO signals
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {completedSteps.has("ai") ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  ) : activeStep === "ai" ? (
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse shrink-0 ml-0.5 mr-1" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#D4D4D0] shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={completedSteps.has("ai") ? "text-[#121214]" : activeStep === "ai" ? "text-[#121214] font-medium" : "text-[#9E9EA4]"}>
                    {activeStep === "ai" ? "Synthesizing Rankly AI recommendations…" : "Rankly AI synthesis layer"}
                  </span>
                </div>
              </div>
            )}

            {/* 7-Day Cooldown Notice UX */}
            {cooldownInfo && (
              <div
                className="mt-4 border border-[#EFEFEA] bg-white p-4 space-y-3 font-mono text-xs"
                role="status"
              >
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">This website was recently analyzed.</span>
                </div>
                <p className="text-[#66666E] text-[11px] leading-relaxed">
                  <strong className="text-[#121214]">{cooldownInfo.domain}</strong> can be analyzed again on:{" "}
                  <strong className="text-[#121214]">{cooldownInfo.nextAllowedDate || "7 days from scan"}</strong>.
                </p>
                <div className="pt-2 border-t border-[#EFEFEA] flex items-center justify-between">
                  <span className="text-[11px] text-[#8C8C94]">7-day public audit cooldown</span>
                  <Link
                    href={`/audit/${encodeURIComponent(cooldownInfo.existingAuditId)}`}
                    className="inline-flex items-center gap-1 bg-[#121214] text-white px-3 py-1.5 text-xs font-medium hover:bg-black transition-colors"
                  >
                    <span>View existing report</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div
                className="mt-3 flex items-start gap-2 text-xs font-mono text-rose-700"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Sub-copy & Sample URL Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#66666E]">
              <div className="flex items-center gap-3">
                <span>Traditional SEO</span>
                <span>·</span>
                <span>Answer Engine (AEO)</span>
                <span>·</span>
                <span>Generative AI (GEO)</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-[#8C8C94]">Try:</span>
                <button
                  type="button"
                  onClick={() => {
                    setUrl("linear.app");
                    setError(null);
                    setCooldownInfo(null);
                  }}
                  className="text-[#121214] hover:underline"
                >
                  linear.app
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrl("github.com");
                    setError(null);
                    setCooldownInfo(null);
                  }}
                  className="text-[#121214] hover:underline"
                >
                  github.com
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Product Visualization */}
        <div className="mt-16">
          <AuditHeroPreview />
        </div>
      </div>
    </section>
  );
}
