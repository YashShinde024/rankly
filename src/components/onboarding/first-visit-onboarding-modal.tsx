"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Globe, Search, Bot, MessageSquare, User, Sparkles } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";
import { cacheAuditReport } from "@/lib/client/audit-cache";

const WEBSITE_TYPES = [
  { id: "saas", title: "SaaS / Web App", desc: "Software product, developer tool, or cloud app" },
  { id: "business", title: "Business / Company", desc: "Corporate site, B2B services, or enterprise" },
  { id: "portfolio", title: "Portfolio / Personal", desc: "Personal site, resume, or creator showcase" },
  { id: "blog", title: "Blog / Publication", desc: "Editorial, newsletter, or content hub" },
  { id: "ecommerce", title: "E-Commerce", desc: "Online store, marketplace, or catalog" },
  { id: "agency", title: "Agency / Studio", desc: "Design studio, consultancy, or dev shop" },
];

const GOAL_OPTIONS = [
  {
    id: "all",
    title: "All three (Comprehensive)",
    desc: "Analyze traditional Google search, Answer Engines (AEO), and Generative AI (GEO).",
  },
  {
    id: "seo",
    title: "Search Visibility (SEO)",
    desc: "Focus on Google SERP rankings, core crawlability, and technical health.",
  },
  {
    id: "aeo",
    title: "Answer Visibility (AEO)",
    desc: "Focus on Google AI Overviews, voice queries, and featured snippets.",
  },
  {
    id: "geo",
    title: "Generative Visibility (GEO)",
    desc: "Focus on ChatGPT, Gemini, and Perplexity brand citation readiness.",
  },
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface FirstVisitOnboardingModalProps {
  forceOpen?: boolean;
}

export function FirstVisitOnboardingModal({ forceOpen = false }: FirstVisitOnboardingModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState<string>("");
  const [websiteType, setWebsiteType] = useState<string>("saas");
  const [url, setUrl] = useState<string>("");
  const [goals, setGoals] = useState<string>("all");
  const [scanningPhase, setScanningPhase] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("Welcome");

  useEffect(() => {
    setGreeting(getTimeGreeting());
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const completed = localStorage.getItem("rankly_onboarding_completed");
      if (!completed) {
        setIsOpen(true);
      }
    } catch {}
  }, [forceOpen]);

  const handleSkip = () => {
    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
    } catch {}
    setIsOpen(false);
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 3 && !url.trim()) {
      setErrorMsg("Please enter a website URL to continue.");
      return;
    }
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      handleCompleteAndAudit();
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleCompleteAndAudit = async () => {
    setErrorMsg(null);

    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
      localStorage.setItem(
        "rankly_user_preferences",
        JSON.stringify({ userName: userName.trim(), websiteType, goals, url })
      );
    } catch {}

    if (!url.trim()) {
      setIsOpen(false);
      return;
    }

    // Continuous smooth scanning transition
    setScanningPhase("Preparing audit...");
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const phases = [
      "Fetching webpage HTML & server directives...",
      "Analyzing 22+ SEO, AEO & GEO signals...",
      "Synthesizing Rankly AI recommendations...",
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setScanningPhase(phases[phaseIndex]);
        phaseIndex++;
      }
    }, 1200);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl, websiteType, goals, userName: userName.trim() }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (res.ok && data.auditId) {
        setScanningPhase("Audit complete. Loading report...");
        if (data.report) {
          cacheAuditReport(data.auditId, data.report);
        }
        setTimeout(() => {
          setIsOpen(false);
          router.push(`/audit/${data.auditId}`);
        }, 500);
        return;
      } else if (res.status === 409 && data.existingAuditId) {
        setScanningPhase("Existing audit found. Opening report...");
        setTimeout(() => {
          setIsOpen(false);
          router.push(`/audit/${data.existingAuditId}`);
        }, 500);
        return;
      } else {
        setScanningPhase(null);
        setErrorMsg(data.message || "Unable to complete audit. Please check the URL.");
      }
    } catch {
      clearInterval(interval);
      setScanningPhase(null);
      setErrorMsg("Network error. Redirecting to home.");
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FBFBFA]/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white border border-[#EFEFEA] shadow-2xl p-8 sm:p-12 relative flex flex-col justify-between min-h-[540px]"
      >
        {/* Top Header & Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-[#121214]">
              rankly
            </span>
            <span className="text-[#D4D4D0]">|</span>
            <span className="font-mono text-xs text-[#66666E]">
              0{step} — 04
            </span>
          </div>

          {!scanningPhase && (
            <button
              onClick={handleSkip}
              className="text-xs font-mono text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer"
            >
              Skip onboarding →
            </button>
          )}
        </div>

        {/* Live Scanning Screen */}
        {scanningPhase ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center space-y-6 flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2">
              <AiAccent variant="badge">
                <span>Rankly AI Engine</span>
              </AiAccent>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
                {scanningPhase}
              </h3>
              <p className="text-xs text-[#66666E]">
                {userName ? `${userName}, we're evaluating` : "Evaluating"} technical crawlability and structuring AI search readiness for {url}.
              </p>
            </div>

            <div className="w-56 h-1 spectrum-border rounded-full" />
          </motion.div>
        ) : (
          /* Animated Step Flow */
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                      {greeting}, Welcome to Rankly
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-[#121214] mt-2">
                      Let&apos;s personalize your intelligence report.
                    </h2>
                    <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
                      Understand how your platform is seen across search and modern generative AI discovery systems.
                    </p>
                  </div>

                  {/* Name Input field */}
                  <div className="space-y-2 pt-1">
                    <label htmlFor="user-name-input" className="block text-xs font-mono uppercase tracking-wider text-[#66666E]">
                      What should we call you? (Optional)
                    </label>
                    <div className="relative border border-[#121214]/20 focus-within:border-[#121214] bg-[#FAFAFA] transition-colors">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C94]" />
                      <input
                        id="user-name-input"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                        placeholder="Your name or organization"
                        className="w-full text-xs sm:text-sm font-mono text-[#121214] placeholder:text-[#8C8C94] py-3 pl-10 pr-4 bg-transparent focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 3 Pillars Overview Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                        <Search className="h-3.5 w-3.5" />
                        <span>SEO</span>
                      </div>
                      <p className="text-[11px] text-[#66666E]">Search crawlability &amp; TTFB.</p>
                    </div>

                    <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                        <MessageSquare className="h-3.5 w-3.5 text-violet-700" />
                        <span>AEO</span>
                      </div>
                      <p className="text-[11px] text-[#66666E]">AI Overviews &amp; intent match.</p>
                    </div>

                    <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                        <Bot className="h-3.5 w-3.5 text-blue-700" />
                        <span>GEO</span>
                      </div>
                      <p className="text-[11px] text-[#66666E]">ChatGPT &amp; Perplexity citations.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                      {userName ? `Nice to meet you, ${userName}` : "Classification"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#121214] mt-1">
                      What are you building?
                    </h2>
                    <p className="text-xs text-[#66666E] mt-1">
                      Helps Rankly calibrate content structure and schema suggestions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {WEBSITE_TYPES.map((t) => {
                      const isSelected = websiteType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setWebsiteType(t.id)}
                          className={`text-left p-4 border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#121214] bg-[#FBFBFA]"
                              : "border-[#EFEFEA] hover:border-[#D4D4D0] bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-[#121214]">{t.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#121214]" />}
                          </div>
                          <p className="text-[11px] text-[#66666E] mt-1 leading-snug">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                      Target URL
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#121214] mt-1">
                      What&apos;s your website?
                    </h2>
                    <p className="text-xs text-[#66666E] mt-1">
                      We&apos;ll inspect the live public webpage and robots directives.
                    </p>
                  </div>

                  {/* Refined Form Input with Gemini Spectrum Accent Border */}
                  <div className="spectrum-border p-[1.5px] relative">
                    <div className="bg-white flex items-center px-4 py-3 gap-3">
                      <Globe className="h-4 w-4 text-[#8C8C94] shrink-0" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                        placeholder="yourwebsite.com"
                        className="w-full text-sm font-mono text-[#121214] placeholder:text-[#8C8C94] focus:outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#8C8C94]">
                    Accepts domain names (e.g. example.com) or full URLs.
                  </p>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                      Objectives {userName ? `· ${userName}` : ""}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#121214] mt-1">
                      What matters most to you?
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    {GOAL_OPTIONS.map((g) => {
                      const isSelected = goals === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGoals(g.id)}
                          className={`w-full text-left p-3.5 border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#121214] bg-[#FBFBFA]"
                              : "border-[#EFEFEA] hover:border-[#D4D4D0] bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-[#121214]">{g.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#121214]" />}
                          </div>
                          <p className="text-[11px] text-[#66666E] mt-0.5">{g.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Bottom Control Actions */}
        {!scanningPhase && (
          <div className="flex items-center justify-between border-t border-[#EFEFEA] pt-6 mt-6">
            <div>
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#66666E] hover:text-[#121214] cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="text-xs font-mono text-[#8C8C94] hover:text-[#121214] cursor-pointer"
                >
                  Skip
                </button>
              )}
            </div>

            <div>
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-[#121214] text-white px-6 py-2.5 text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteAndAudit}
                  className="cursor-pointer"
                >
                  <AiAccent variant="border">
                    <span className="px-6 py-2.5 text-xs font-medium flex items-center gap-2 text-white">
                      <span>Analyze my website →</span>
                    </span>
                  </AiAccent>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
