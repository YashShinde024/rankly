"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, AlertCircle, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { AuditHeroPreview } from "./audit-hero-preview";
import { AuthGateModal } from "@/components/auth/auth-gate-modal";
import { cacheAuditReport } from "@/lib/client/audit-cache";

type ScanStep = "validating" | "connecting" | "checking" | "ai" | "saving" | "done";

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
  const [gateOpen, setGateOpen] = useState(false);
  const [gateHostname, setGateHostname] = useState<string | null>(null);
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

      const t4 = setTimeout(() => {
        setCompletedSteps((prev) => new Set(prev).add("ai"));
        setActiveStep("saving");
      }, 3200);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
        // Guest identity travels via the signed cookie; no auth header needed here.
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      // Minimal shape contract for the audit API response
      let data: {
        success?: boolean;
        auditId?: string;
        report?: Parameters<typeof cacheAuditReport>[1];
        error?: string;
        message?: string;
        stage?: string;
        domain?: string;
        existingAuditId?: string;
        nextAllowedDate?: string;
      } | null = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error("[HeroSection] Failed to parse JSON response:", parseErr, "Status:", response.status);
      }

      if (!response.ok || !data?.success) {
        console.error("[HeroSection] Audit request failed:", {
          status: response.status,
          statusText: response.statusText,
          data,
          stage: data?.stage || "UNKNOWN",
          error: data?.error,
          message: data?.message,
        });

        setActiveStep(null);
        setCompletedSteps(new Set());

        if (response.status === 409 && (data?.error === "DOMAIN_COOLDOWN" || data?.stage === "DOMAIN_COOLDOWN")) {
          // 7-day cooldown UX feedback
          setCooldownInfo({
            domain: data.domain || inputUrl,
            existingAuditId: data.existingAuditId || data.auditId || inputUrl,
            nextAllowedDate: data.nextAllowedDate,
          });
          return;
        }

        // Guest free analysis already consumed → premium conversion gate
        if (response.status === 403 && data?.error === "GUEST_LIMIT_REACHED") {
          setGateOpen(true);
          setGateHostname(inputUrl);
          return;
        }

        if (response.status === 429) {
          setError("You've reached the current audit limit (5 audits per hour). Please try again later.");
        } else if (response.status === 408) {
          setError("The website took too long to respond (timeout). Please try again shortly.");
        } else if (response.status === 422) {
          setError(data?.message || "This website can't be analyzed (unreachable, blocked, or unsupported content).");
        } else if (
          response.status === 503 &&
          (data?.error === "PERSISTENCE_FAILED" || data?.error === "PERSISTENCE_VERIFY_FAILED")
        ) {
          setError(
            "Your audit completed, but Rankly couldn't save the report securely right now. This is a temporary server issue — please try again."
          );
        } else if (data?.error === "INVALID_URL") {
          setError("That doesn't look like a valid public website URL. Check the address and try again.");
        } else {
          setError(data?.message || "Unable to complete this audit. Rankly encountered an issue while analyzing this website.");
        }
        return;
      }

      if (!data.auditId) {
        console.error("[HeroSection] Response ok but missing auditId:", data);
        setActiveStep(null);
        setCompletedSteps(new Set());
        setError("Unable to locate audit report ID. Please try again.");
        return;
      }

      setCompletedSteps((prev) => new Set(prev).add("validating").add("connecting").add("checking").add("ai").add("saving"));
      setActiveStep("done");

      if (data.report) {
        cacheAuditReport(data.auditId, data.report);
      }
      try {
        localStorage.setItem("rankly_guest_audit_used", data.auditId);
      } catch {}

      setTimeout(() => {
        if (data?.auditId) {
          router.push(`/audit/${encodeURIComponent(data.auditId)}`);
        }
      }, 450);
    } catch (netErr) {
      console.error("[HeroSection] Network exception during audit:", netErr);
      setActiveStep(null);
      setCompletedSteps(new Set());
      setError("We couldn't reach the server. Please check your network connection and try again.");
    }
  };

  const isScanning = activeStep !== null;

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Ambient background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(600px 300px at 15% 0%, rgba(139,92,246,0.07), transparent 70%), radial-gradient(700px 340px at 85% 10%, rgba(59,130,246,0.06), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Left-Aligned Editorial Composition */}
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
            <span>Website intelligence for the AI search era</span>
            <span className="text-[#D4D4D0]">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#121214]">
              <Sparkles className="h-3 w-3 text-violet-600" />
              <span>SEO · AEO · GEO</span>
            </span>
          </div>

          <h1 className="mt-4 text-4xl sm:text-6xl font-light tracking-tight text-[#121214] leading-[1.08]">
            Understand how your website performs across{" "}
            <span className="spectral-text">
              Search, Answers, and AI.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm sm:text-base text-[#66666E] leading-relaxed">
            Rankly audits your website&apos;s <strong className="font-medium text-[#121214]">SEO</strong>{" "}
            (search visibility),{" "}
            <strong className="font-medium text-[#121214]">AEO</strong>{" "}
            (answer-engine readiness), and{" "}
            <strong className="font-medium text-[#121214]">GEO</strong>{" "}
            (generative AI discoverability) — then shows exactly what to improve, with the evidence
            behind every score.
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

            {/* Secondary CTA */}
            <div className="mt-4">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#66666E] hover:text-[#121214] underline underline-offset-4 decoration-[#D4D4D0] transition-colors"
              >
                See how it works
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

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

                <div className="flex items-center gap-2">
                  {completedSteps.has("saving") ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  ) : activeStep === "saving" ? (
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse shrink-0 ml-0.5 mr-1" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[#D4D4D0] shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={completedSteps.has("saving") ? "text-[#121214]" : activeStep === "saving" ? "text-[#121214] font-medium" : "text-[#9E9EA4]"}>
                    {activeStep === "saving" ? "Verifying & saving your report…" : "Secure report persistence"}
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
                className="mt-4 border border-rose-200 bg-rose-50/70 p-4 font-mono text-xs text-rose-900 space-y-2"
                role="alert"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
                  <span>Unable to complete this audit</span>
                </div>
                <p className="text-rose-800 text-[11px] leading-relaxed">
                  {error}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleAnalyze(e)}
                    className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-3 py-1.5 text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                  >
                    <span>Try again</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setUrl("");
                    }}
                    className="text-[11px] text-[#66666E] hover:text-[#121214] underline underline-offset-2"
                  >
                    Clear URL
                  </button>
                </div>
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

      <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} contextHostname={gateHostname} />
    </section>
  );
}
