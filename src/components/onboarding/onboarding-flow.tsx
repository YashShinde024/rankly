"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Globe, Search, Bot, MessageSquare, User } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";

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

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState<string>("");
  const [websiteType, setWebsiteType] = useState<string>("saas");
  const [url, setUrl] = useState<string>("");
  const [goals, setGoals] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>("Welcome");

  useEffect(() => {
    setGreeting(getTimeGreeting());
    try {
      localStorage.setItem("rankly_onboarding_started", "true");
    } catch {}
  }, []);

  const handleSkip = () => {
    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
    } catch {}
    router.push("/");
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
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
      localStorage.setItem(
        "rankly_user_preferences",
        JSON.stringify({ userName: userName.trim(), websiteType, goals, url })
      );
    } catch {}

    if (url.trim()) {
      try {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`;
        }

        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: cleanUrl, websiteType, goals, userName: userName.trim() }),
        });

        const data = await res.json();
        if (res.ok && data.auditId) {
          router.push(`/audit/${data.auditId}?onboarded=true`);
          return;
        } else if (res.status === 409 && data.existingAuditId) {
          router.push(`/audit/${data.existingAuditId}?cached=true`);
          return;
        } else {
          setErrorMsg(data.message || "Failed to analyze website. Taking you to main page.");
          setTimeout(() => router.push(`/?url=${encodeURIComponent(url)}`), 1500);
        }
      } catch {
        router.push(`/?url=${encodeURIComponent(url)}`);
      }
    } else {
      router.push("/");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto border border-[#EFEFEA] bg-white p-8 sm:p-12 space-y-8"
    >
      {/* Top Step Progress Bar */}
      <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#121214]">
            0{step} / 04
          </span>
          <span className="text-[#D4D4D0]">|</span>
          <span className="font-mono text-xs text-[#66666E]">
            {step === 1 && "Welcome"}
            {step === 2 && "Website Type"}
            {step === 3 && "Your Website"}
            {step === 4 && "Priority Goals"}
          </span>
        </div>

        {step < 4 && (
          <button
            onClick={handleSkip}
            className="text-xs font-mono text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer"
          >
            Skip onboarding →
          </button>
        )}
      </div>

      {/* Main Animated Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                {greeting}, Get Started
              </span>
              <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-[#121214] mt-2">
                Welcome to Rankly.
              </h2>
              <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
                A clearer view of how your website performs across search and emerging AI discovery engines.
              </p>
            </div>

            {/* Name input */}
            <div className="space-y-2 pt-1">
              <label htmlFor="flow-user-name" className="block text-xs font-mono uppercase tracking-wider text-[#66666E]">
                Your Name / Team (Optional)
              </label>
              <div className="relative border border-[#121214]/20 focus-within:border-[#121214] bg-[#FAFAFA] transition-colors">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C94]" />
                <input
                  id="flow-user-name"
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

            {/* 3 Pillars Overview Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                  <Search className="h-3.5 w-3.5" />
                  <span>SEO</span>
                </div>
                <p className="text-[11px] text-[#66666E]">
                  Crawlability &amp; TTFB metrics.
                </p>
              </div>

              <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-700" />
                  <span>AEO</span>
                </div>
                <p className="text-[11px] text-[#66666E]">
                  Answer readiness for AI Overviews.
                </p>
              </div>

              <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#121214]">
                  <Bot className="h-3.5 w-3.5 text-blue-700" />
                  <span>GEO</span>
                </div>
                <p className="text-[11px] text-[#66666E]">
                  Entity clarity for LLM citations.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                {userName ? `For ${userName}` : "Classification"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#121214] mt-1">
                What are you building?
              </h2>
              <p className="text-xs text-[#66666E] mt-1">
                Helps us tailor heading and content recommendations to your model.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WEBSITE_TYPES.map((type) => {
                const isSelected = websiteType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setWebsiteType(type.id)}
                    className={`text-left p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#121214] bg-[#FBFBFA]"
                        : "border-[#EFEFEA] hover:border-[#D4D4D0] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#121214]">
                        {type.title}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#121214]" />}
                    </div>
                    <p className="text-[11px] text-[#66666E] mt-1 leading-snug">
                      {type.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                Target Website
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#121214] mt-1">
                What&apos;s your website?
              </h2>
              <p className="text-xs text-[#66666E] mt-1">
                We&apos;ll analyze the public webpage you provide.
              </p>
            </div>

            <div className="space-y-2">
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
                Accepts full URLs or bare domains like example.com
              </p>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
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

            <div className="space-y-3">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = goals === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoals(g.id)}
                    className={`w-full text-left p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#121214] bg-[#FBFBFA]"
                        : "border-[#EFEFEA] hover:border-[#D4D4D0] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[#121214]">
                        {g.title}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#121214]" />}
                    </div>
                    <p className="text-[11px] text-[#66666E] mt-1">
                      {g.desc}
                    </p>
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

      {/* Footer Controls */}
      <div className="flex items-center justify-between border-t border-[#EFEFEA] pt-6">
        <div>
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              <AiAccent variant="border">
                <span className="px-6 py-2.5 text-xs font-medium flex items-center gap-2 text-white">
                  <span>{isSubmitting ? "Starting audit..." : "Analyze my website →"}</span>
                </span>
              </AiAccent>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
