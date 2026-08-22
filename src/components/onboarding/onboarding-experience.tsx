"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Search,
  Bot,
  MessageSquare,
  User,
  Sparkles,
  AppWindow,
  Building2,
  Newspaper,
  ShoppingBag,
  Layers,
  AlertCircle,
} from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";
import { RanklyLogo } from "@/components/ui/rankly-logo";
import { AuthGateModal } from "@/components/auth/auth-gate-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { cacheAuditReport } from "@/lib/client/audit-cache";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const WEBSITE_TYPES = [
  { id: "saas", title: "SaaS / Web App", desc: "Software product, developer tool, or cloud platform.", Icon: AppWindow },
  { id: "business", title: "Business", desc: "Corporate website, B2B service, or organization.", Icon: Building2 },
  { id: "portfolio", title: "Portfolio", desc: "Personal website, resume, or creator showcase.", Icon: User },
  { id: "blog", title: "Blog / Publication", desc: "Editorial content, articles, or knowledge hub.", Icon: Newspaper },
  { id: "ecommerce", title: "E-commerce", desc: "Online store, marketplace, or product catalog.", Icon: ShoppingBag },
  { id: "agency", title: "Agency / Service", desc: "Creative studio, consultancy, or development agency.", Icon: Layers },
] as const;

const FOCUS_MODES = [
  {
    id: "all",
    title: "Comprehensive",
    tagline: "SEO + AEO + GEO",
    desc: "Full evaluation across search, answer, and generative visibility.",
  },
  {
    id: "seo",
    title: "Search Visibility",
    tagline: "SEO",
    desc: "Technical SEO, crawlability, metadata, and search readiness.",
  },
  {
    id: "aeo",
    title: "Answer Visibility",
    tagline: "AEO",
    desc: "Content structure, direct-answer readiness, and answer engine signals.",
  },
  {
    id: "geo",
    title: "Generative Visibility",
    tagline: "GEO",
    desc: "AI discovery, entity clarity, and citation readiness.",
  },
] as const;

const STEPS = [
  { n: "01", label: "Identity" },
  { n: "02", label: "Type" },
  { n: "03", label: "Website" },
  { n: "04", label: "Focus" },
  { n: "R", label: "Ready" },
] as const;

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  WEBSITE_TYPES.map((t) => [t.id, t.title])
);
const FOCUS_LABELS: Record<string, string> = Object.fromEntries(
  FOCUS_MODES.map((f) => [f.id, f.title])
);

/* ------------------------------------------------------------------ */
/*  URL handling                                                       */
/* ------------------------------------------------------------------ */

interface ParsedUrl {
  cleanUrl: string;
  hostname: string;
}

function parseWebsiteInput(raw: string): ParsedUrl | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname.includes(".") || /\s/.test(parsed.hostname)) return null;
    return { cleanUrl: parsed.toString(), hostname: parsed.hostname };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Shared experience                                                  */
/* ------------------------------------------------------------------ */

interface OnboardingExperienceProps {
  /** "page" renders inline; "modal" closes itself on finish/skip. */
  variant: "page" | "modal";
  /** Called when the user skips (modal closes; page navigates home). */
  onSkip?: () => void;
}

/** Favicon with graceful fallback. Keyed by hostname so failure state resets per site. */
function SiteFavicon({ hostname }: { hostname: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <Globe className="h-5 w-5 text-[#8C8C94]" aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-7 w-7"
    />
  );
}

export function OnboardingExperience({ variant, onSkip }: OnboardingExperienceProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { getIdToken } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);

  const [step, setStep] = useState(1); // 1..5 (5 = ready)
  const [userName, setUserName] = useState("");
  const [websiteType, setWebsiteType] = useState("saas");
  const [url, setUrl] = useState("");
  const [urlTouched, setUrlTouched] = useState(false);
  const [goals, setGoals] = useState("all");
  const [nameFocused, setNameFocused] = useState(false);
  const [urlFocused, setUrlFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsed = useMemo(() => parseWebsiteInput(url), [url]);
  const urlState: "empty" | "invalid" | "valid" =
    url.trim() === "" ? "empty" : parsed ? "valid" : "invalid";
  const hostname = parsed?.hostname ?? "";

  const configRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    if (userName.trim()) rows.push({ label: "Identity", value: userName.trim() });
    if (hostname) rows.push({ label: "Website", value: hostname });
    if (websiteType) rows.push({ label: "Type", value: TYPE_LABELS[websiteType] });
    if (goals) rows.push({ label: "Focus", value: FOCUS_LABELS[goals] });
    return rows;
  }, [userName, hostname, websiteType, goals]);

  useEffect(() => {
    try {
      localStorage.setItem("rankly_onboarding_started", "true");
    } catch {}
  }, []);

  const dur = (ms: number) => (reduceMotion ? 0 : ms / 1000);

  const handleSkip = () => {
    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
    } catch {}
    if (onSkip) {
      onSkip();
    } else {
      router.push("/");
    }
  };

  const goTo = (next: number) => {
    setErrorMsg(null);
    setStep(next);
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 3) {
      setUrlTouched(true);
      if (!parsed) {
        setErrorMsg(
          url.trim() ? "That doesn't look like a valid website address." : "Please enter a website URL to continue."
        );
        return;
      }
      goTo(4);
      return;
    }
    if (step < 4) {
      goTo(step + 1);
    } else {
      goTo(5); // Ready confirmation
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) goTo(step - 1);
  };

  const handleCompleteAndAudit = async () => {
    if (isSubmitting) return;
    if (!parsed) {
      setErrorMsg("Please go back and enter a valid website URL.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      localStorage.setItem("rankly_onboarding_completed", "true");
      localStorage.setItem(
        "rankly_user_preferences",
        JSON.stringify({ userName: userName.trim(), websiteType, goals, url: url.trim() })
      );
    } catch {}

    try {
      const token = await getIdToken();
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url: parsed.cleanUrl,
          websiteType,
          goals,
          userName: userName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.auditId) {
        if (data.report) {
          cacheAuditReport(data.auditId, data.report);
        }
        try {
          localStorage.setItem("rankly_guest_audit_used", data.auditId);
        } catch {}
        router.push(`/audit/${data.auditId}?onboarded=true`);
        return;
      }
      if (res.status === 409 && data.existingAuditId) {
        router.push(`/audit/${data.existingAuditId}?cached=true`);
        return;
      }
      // Guest free analysis already consumed → premium conversion gate
      if (res.status === 403 && data?.error === "GUEST_LIMIT_REACHED") {
        setIsSubmitting(false);
        setGateOpen(true);
        return;
      }
      setErrorMsg(data.message || "Unable to complete the audit. Please check the website address.");
      setIsSubmitting(false);
      if (variant === "page") {
        setTimeout(() => router.push(`/?url=${encodeURIComponent(url.trim())}`), 1500);
      }
    } catch {
      setErrorMsg("Network issue while starting the analysis. Please try again.");
      setIsSubmitting(false);
      if (variant === "page") {
        setTimeout(() => router.push(`/?url=${encodeURIComponent(url.trim())}`), 1500);
      }
    }
  };

  const isReadyStep = step === 5;

  /* ---------------------------------------------------------------- */
  /*  Sub-components                                                   */
  /* ---------------------------------------------------------------- */

  const stepMotion = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -10 },
    transition: { duration: dur(0.2), ease: "easeOut" as const },
  };

  const radioCard = (selected: boolean) =>
    `group relative text-left border transition-[border-color,box-shadow] duration-200 cursor-pointer outline-none
     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]
     ${
       selected
         ? "border-[#121214] bg-[#FCFCFB] shadow-[0_2px_12px_rgba(18,18,20,0.07)]"
         : "border-[#EFEFEA] bg-white hover:border-[#C9C9C4] hover:shadow-[0_2px_10px_rgba(18,18,20,0.05)]"
     }`;

  /* Desktop stepper ---------------------------------------------------- */

  const DesktopStepper = (
    <nav aria-label="Onboarding progress" className="hidden lg:flex items-center">
      {STEPS.map((s, i) => {
        const isDone = step > i + 1;
        const isActive = step === i + 1;
        const isReadyNode = s.n === "R";
        return (
          <React.Fragment key={s.n}>
            {i > 0 && (
              <div className="mx-3 h-px w-10 xl:w-14 bg-[#E7E7E2] relative overflow-hidden" aria-hidden="true">
                <motion.div
                  className="absolute inset-y-0 left-0 right-0 spectrum-line"
                  style={{ transformOrigin: "left" }}
                  initial={false}
                  animate={{ scaleX: step > i ? 1 : 0 }}
                  transition={{ duration: dur(0.3), ease: "easeOut" }}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center justify-center h-6 w-6 border text-[10px] font-mono transition-colors ${
                  isReadyNode ? "rounded-full px-1 tracking-tight" : ""
                } ${
                  isActive
                    ? "border-transparent spectrum-border p-[1.5px]"
                    : isDone
                      ? "border-[#121214] bg-[#121214] text-white"
                      : "border-[#E7E7E2] text-[#9E9EA4] bg-white"
                }`}
              >
                {isActive && isReadyNode ? (
                  <span className="flex h-full w-full items-center justify-center bg-[#121214] text-white rounded-full">
                    <Sparkles className="h-3 w-3" />
                  </span>
                ) : isActive ? (
                  <span className="flex h-full w-full items-center justify-center bg-[#121214] text-white">
                    {s.n}
                  </span>
                ) : isDone ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : isReadyNode ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  s.n
                )}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  isActive ? "text-[#121214]" : isDone ? "text-[#66666E]" : "text-[#B9B9B4]"
                }`}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );

  /* Mobile stepper — step counter + current label + compact bar */
  const MobileStepper = (
    <div className="lg:hidden flex flex-col gap-1.5 flex-1 min-w-0" aria-hidden="true">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] text-[#66666E] shrink-0">
          {isReadyStep ? "Step 5 of 5" : `Step ${step} of 5`}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] truncate">
          {STEPS[Math.min(step, 5) - 1].label}
        </span>
      </div>
      <div className="h-[3px] w-full bg-[#EFEFEA] overflow-hidden">
        <motion.div
          className="h-full spectrum-line"
          style={{ transformOrigin: "left" }}
          initial={false}
          animate={{ scaleX: Math.min(step, 5) / 5 }}
          transition={{ duration: dur(0.3), ease: "easeOut" }}
        />
      </div>
    </div>
  );

  /* Compact "Your configuration" summary — single collapsible, all viewports */

  const ConfigSummary =
    configRows.length > 0 ? (
      <details className="border border-[#EFEFEA] bg-[#FCFCFB] open:pb-3 w-full">
        <summary className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#66666E] cursor-pointer select-none list-none flex items-center justify-between gap-3">
          <span>Your configuration</span>
          <span className="text-[#B9B9B4] normal-case tracking-normal truncate">
            {configRows.map((r) => r.value).join(" · ")}
          </span>
        </summary>
        <dl className="px-4 space-y-2 pt-1 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 sm:gap-y-2">
          {configRows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#9E9EA4] shrink-0">
                {row.label}
              </dt>
              <dd className="text-xs text-[#121214] text-right break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    ) : null;

  /* ---------------------------------------------------------------- */
  /*  Steps                                                            */
  /* ---------------------------------------------------------------- */

  const stepIdentity = (
    <motion.div key="s1" {...stepMotion} className="space-y-7 max-w-2xl mx-auto w-full">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E]">
          Step 01 — Identity
        </span>
        <h2 className="text-2xl sm:text-[2rem] font-light tracking-tight text-[#121214] mt-2 leading-tight">
          Let&apos;s personalize your{" "}
          <span className="spectral-text">
            intelligence report.
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
          Tell us a little about who this report is for.
        </p>
      </div>

      {/* Nickname input with spectral focus */}
      <div className="space-y-2">
        <label
          htmlFor="onb-name"
          className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]"
        >
          Nickname <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <div
          className={`relative p-[1.5px] transition-shadow duration-300 ${
            nameFocused ? "spectrum-line shadow-[0_0_0_4px_rgba(139,92,246,0.06)]" : "bg-[#EFEFEA]"
          }`}
        >
          <div className="bg-white flex items-center px-4 py-3 gap-3">
            <User className="h-4 w-4 text-[#8C8C94] shrink-0" aria-hidden="true" />
            <input
              id="onb-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="Your nickname, name, or organization"
              maxLength={80}
              autoComplete="nickname"
              aria-describedby="onb-name-hint"
              className="w-full text-sm font-mono text-[#121214] placeholder:text-[#B9B9B4] bg-transparent focus:outline-none"
              autoFocus
            />
          </div>
        </div>
        <p id="onb-name-hint" className="text-[11px] text-[#8C8C94]">
          Used to personalize your Rankly experience.
        </p>
      </div>

      {/* Capability cards — informative, not interactive choices */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] block">
          What your report measures
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              abbr: "SEO",
              title: "Search visibility",
              desc: "Technical health, content structure, and search readiness.",
              Icon: Search,
            },
            {
              abbr: "AEO",
              title: "Answer visibility",
              desc: "How well your content supports direct answers and answer engines.",
              Icon: MessageSquare,
            },
            {
              abbr: "GEO",
              title: "Generative visibility",
              desc: "How discoverable and understandable your site is for generative AI.",
              Icon: Bot,
            },
          ].map((c) => (
            <div
              key={c.abbr}
              className="border border-[#EFEFEA] bg-white p-4 space-y-1.5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#D4D4D0] hover:shadow-[0_4px_14px_rgba(18,18,20,0.06)]"
            >
              <div className="flex items-center gap-1.5">
                <c.Icon className="h-3.5 w-3.5 text-[#121214]" aria-hidden="true" />
                <span className="font-mono text-xs font-semibold text-[#121214]">{c.abbr}</span>
              </div>
              <span className="text-[11px] font-medium text-[#121214] block">{c.title}</span>
              <p className="text-[11px] text-[#66666E] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const stepClassification = (
    <motion.div key="s2" {...stepMotion} className="space-y-6 w-full">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E]">
          Step 02 — Classification
        </span>
        <h2 className="text-2xl sm:text-[2rem] font-light tracking-tight text-[#121214] mt-2 leading-tight">
          What are you building?
        </h2>
        <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
          Rankly uses this to calibrate the analysis and recommendations.
        </p>
      </div>

      <div role="radiogroup" aria-label="Website type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WEBSITE_TYPES.map((t) => {
          const isSelected = websiteType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setWebsiteType(t.id)}
              className={`${radioCard(isSelected)} p-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex items-center justify-center h-8 w-8 border shrink-0 transition-colors ${
                      isSelected ? "border-[#121214]/20 bg-[#FBFBFA]" : "border-[#EFEFEA] bg-[#FCFCFA]"
                    }`}
                  >
                    <t.Icon className="h-4 w-4 text-[#121214]" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="font-medium text-xs text-[#121214]">{t.title}</span>
                </div>
                {isSelected && (
                  <motion.span
                    initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: dur(0.18) }}
                    className="shrink-0 mt-0.5"
                  >
                    <Check className="h-4 w-4 text-[#121214]" strokeWidth={2.5} aria-hidden="true" />
                  </motion.span>
                )}
              </div>
              <p className="text-[11px] text-[#66666E] mt-2 leading-relaxed">{t.desc}</p>
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-[2px] spectrum-line opacity-80"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const stepWebsite = (
    <motion.div key="s3" {...stepMotion} className="space-y-6 max-w-2xl mx-auto w-full">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E]">
          Step 03 — Website
        </span>
        <h2 className="text-2xl sm:text-[2rem] font-light tracking-tight text-[#121214] mt-2 leading-tight">
          What&apos;s your website?
        </h2>
        <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
          Rankly will inspect the publicly available structure and signals of your website.
        </p>
      </div>

      {/* Large URL input */}
      <div className="space-y-2">
        <label
          htmlFor="onb-url"
          className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]"
        >
          Website address
        </label>
        <div
          className={`relative p-[1.5px] transition-shadow duration-300 ${
            urlState === "invalid" && urlTouched
              ? "bg-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.06)]"
              : urlFocused
                ? "spectrum-line shadow-[0_0_0_4px_rgba(139,92,246,0.06)]"
                : "bg-[#EFEFEA]"
          }`}
        >
          <div className="bg-white flex items-center px-4 py-4 gap-3">
            <Globe className="h-[18px] w-[18px] text-[#8C8C94] shrink-0" aria-hidden="true" />
            <input
              id="onb-url"
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setUrlFocused(true)}
              onBlur={() => setUrlFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="nyxen.in"
              spellCheck={false}
              autoComplete="url"
              aria-invalid={urlState === "invalid" && urlTouched}
              aria-describedby="onb-url-hint"
              className="w-full text-base sm:text-lg font-mono text-[#121214] placeholder:text-[#C9C9C4] bg-transparent focus:outline-none"
              autoFocus
            />
            {urlState === "valid" && (
              <motion.span
                initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: dur(0.18) }}
                className="shrink-0 text-emerald-700"
                aria-hidden="true"
              >
                <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </motion.span>
            )}
          </div>
        </div>
        <p
          id="onb-url-hint"
          aria-live="polite"
          className={`text-[11px] font-mono ${
            urlState === "invalid" && urlTouched
              ? "text-rose-700"
              : urlState === "valid"
                ? "text-emerald-700"
                : "text-[#8C8C94]"
          }`}
        >
          {urlState === "invalid" && urlTouched
            ? "Enter a valid domain like nyxen.in or a full https:// URL."
            : urlState === "valid"
              ? `${hostname} — ready to analyze`
              : "Accepts domain names or full URLs."}
        </p>
      </div>

      {/* Live identity preview */}
      <AnimatePresence>
        {urlState === "valid" && (
          <motion.div
            key="preview"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur(0.25), ease: "easeOut" }}
            className="border border-[#EFEFEA] bg-[#FCFCFB] p-5 flex items-center gap-4"
            aria-label={`Website preview: ${hostname}`}
          >
            <span className="flex items-center justify-center h-12 w-12 border border-[#EFEFEA] bg-white shrink-0 overflow-hidden">
              <SiteFavicon key={hostname} hostname={hostname} />
            </span>
            <div className="min-w-0">
              <span className="block font-mono text-sm text-[#121214] truncate">{hostname}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#66666E] mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                Ready to analyze
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What Rankly inspects */}
      <div className="border-t border-[#EFEFEA] pt-5 space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] block">
          Rankly will inspect
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {["Search visibility", "Technical structure", "Answer readiness", "Generative AI visibility"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-[#66666E]">
                <Check className="h-3.5 w-3.5 text-[#121214] shrink-0" aria-hidden="true" />
                {item}
              </li>
            )
          )}
        </ul>
        <p className="text-[11px] text-[#B9B9B4] leading-relaxed">
          Your report is generated from publicly accessible website signals.
        </p>
      </div>
    </motion.div>
  );

  const activeNodes =
    goals === "all"
      ? ["search", "answer", "generative"]
      : goals === "seo"
        ? ["search"]
        : goals === "aeo"
          ? ["answer"]
          : ["generative"];

  const stepFocus = (
    <motion.div key="s4" {...stepMotion} className="space-y-6 w-full">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E]">
          Step 04 — Analysis focus
        </span>
        <h2 className="text-2xl sm:text-[2rem] font-light tracking-tight text-[#121214] mt-2 leading-tight">
          What matters most?
        </h2>
        <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed mt-2">
          Choose how deeply Rankly should focus the analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(220px,260px)] gap-5 items-start">
        <div role="radiogroup" aria-label="Analysis focus" className="space-y-2.5">
          {FOCUS_MODES.map((f) => {
            const isSelected = goals === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setGoals(f.id)}
                className={`${radioCard(isSelected)} w-full p-4`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#121214]">
                    {f.title.toUpperCase()}
                    <span className="ml-2 font-normal tracking-normal text-[#9E9EA4]">{f.tagline}</span>
                  </span>
                  {isSelected && (
                    <motion.span
                      initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: dur(0.18) }}
                      className="shrink-0"
                    >
                      <Check className="h-4 w-4 text-[#121214]" strokeWidth={2.5} aria-hidden="true" />
                    </motion.span>
                  )}
                </div>
                <p className="text-[11px] text-[#66666E] mt-1.5 leading-relaxed">{f.desc}</p>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] spectrum-line opacity-80"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Scope visualization */}
        <div className="flex flex-col items-center border border-[#EFEFEA] bg-[#FCFCFB] p-4 h-fit">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#9E9EA4] self-start">
            Analysis scope
          </span>
          <svg
            viewBox="0 0 260 210"
            className="w-full max-w-[240px] mt-2"
            role="img"
            aria-label={`Scope: ${activeNodes.join(", ")}`}
          >
            <defs>
              <linearGradient id="onb-spectrum" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            {/* connectors */}
            <path
              d="M130 62 L130 96 M130 96 L58 138 M130 96 L202 138"
              fill="none"
              stroke={activeNodes.length > 1 ? "url(#onb-spectrum)" : "#E7E7E2"}
              strokeWidth="1.25"
              opacity={activeNodes.length > 1 ? 0.7 : 1}
            />
            {[
              { id: "search", x: 130, y: 44, label: "SEARCH" },
              { id: "answer", x: 58, y: 156, label: "ANSWER" },
              { id: "generative", x: 202, y: 156, label: "GENERATIVE" },
            ].map((node) => {
              const on = activeNodes.includes(node.id);
              return (
                <g key={node.id}>
                  {on && (
                    <circle cx={node.x} cy={node.y} r="27" fill="none" stroke="url(#onb-spectrum)" strokeWidth="0.75" opacity="0.35" />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={on ? "#FFFFFF" : "#FCFCFB"}
                    stroke={on ? "url(#onb-spectrum)" : "#D4D4D0"}
                    strokeWidth={on ? 1.5 : 1}
                  />
                  {on && (
                    <circle cx={node.x} cy={node.y} r="3" fill="url(#onb-spectrum)">
                      {!reduceMotion && (
                        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
                      )}
                    </circle>
                  )}
                  <text
                    x={node.x}
                    y={node.y + (on ? 38 : 36)}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="8.5"
                    letterSpacing="1.5"
                    fill={on ? "#121214" : "#B9B9B4"}
                    fontWeight={on ? 600 : 400}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-[10px] font-mono text-[#8C8C94] text-center mt-1 leading-relaxed">
            {goals === "all"
              ? "All three engines evaluated together."
              : `Focused evaluation: ${FOCUS_LABELS[goals]}.`}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const stepReady = (
    <motion.div key="s5" {...stepMotion} className="max-w-xl mx-auto w-full space-y-7 text-center">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#121214]">
          <span className="spectral-dot !h-1.5 !w-1.5" aria-hidden="true" />
          Ready to analyze
        </span>
        <h2 className="text-2xl sm:text-[2rem] font-light tracking-tight text-[#121214] leading-tight">
          Your intelligence report is configured.
        </h2>
        {hostname && (
          <p className="font-mono text-lg text-[#121214] pt-1">{hostname}</p>
        )}
      </div>

      <div className="border border-[#EFEFEA] bg-[#FCFCFB] p-5 space-y-4 text-left">
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
          <span className="px-2.5 py-1 border border-[#EFEFEA] bg-white font-mono text-[10px] uppercase tracking-wider text-[#121214]">
            {TYPE_LABELS[websiteType]}
          </span>
          <span className="px-2.5 py-1 border border-violet-200/80 bg-violet-50/40 font-mono text-[10px] uppercase tracking-wider text-violet-900">
            {FOCUS_LABELS[goals]} analysis
          </span>
        </div>
        <div className="border-t border-[#EFEFEA] pt-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] block mb-2.5">
            Rankly will inspect
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              "Technical SEO",
              "Content structure",
              "Metadata & social signals",
              "Answer engine readiness",
              "Generative AI visibility",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-[#66666E]">
                <Check className="h-3.5 w-3.5 text-[#121214] shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {hostname && (
        <div className="flex flex-col items-center gap-3">
          <button type="button" onClick={handleCompleteAndAudit} disabled={isSubmitting} className="group cursor-pointer disabled:opacity-70 outline-none">
            <AiAccent variant="border" intensity="active">
              <span className="px-7 py-3 text-xs font-medium flex items-center gap-2.5 text-white">
                {isSubmitting ? (
                  <>
                    <span>Preparing analysis…</span>
                  </>
                ) : (
                  <>
                    <span>Analyze website</span>
                    <ArrowRight className="h-3.5 w-3.5 text-violet-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </>
                )}
              </span>
            </AiAccent>
          </button>
          {!isSubmitting && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#66666E] hover:text-[#121214] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Back and edit
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  /* ---------------------------------------------------------------- */
  /*  Analysis transition (honest single state)                        */
  /* ---------------------------------------------------------------- */

  const analysisState = (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur(0.3), ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4"
      aria-live="polite"
    >
      <AiAccent variant="badge">
        <span>Rankly AI Engine</span>
      </AiAccent>
      <h3 className="mt-5 text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
        Preparing your <span className="spectral-text">analysis</span>
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-[#66666E] max-w-sm leading-relaxed">
        Evaluating public signals for <span className="font-mono text-[#121214]">{hostname}</span>.
        This usually takes under a minute.
      </p>
      <div className="mt-8 w-52 h-[3px] bg-[#EFEFEA] overflow-hidden" aria-hidden="true">
        {!reduceMotion ? (
          <motion.div
            className="h-full w-1/3 spectrum-border"
            animate={{ x: ["-100%", "320%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <div className="h-full w-full spectrum-border" />
        )}
      </div>
    </motion.div>
  );

  /* ---------------------------------------------------------------- */
  /*  Footer controls                                                  */
  /* ---------------------------------------------------------------- */

  const footerControls = (
    <div
      className="sticky bottom-0 lg:static flex items-center justify-between gap-4 border-t border-[#EFEFEA] pt-4 pb-1 lg:pb-0 lg:pt-6 mt-auto bg-white lg:bg-transparent -mx-5 sm:-mx-8 lg:mx-0 px-5 sm:px-8 lg:px-0"
    >
      <div className="flex items-center gap-4">
        {step > 1 && !isSubmitting ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#66666E] hover:text-[#121214] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>
        ) : (
          !isSubmitting && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-mono text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer"
            >
              Skip
            </button>
          )
        )}
      </div>

      {!isReadyStep && !isSubmitting && (
        <button
          type="button"
          onClick={handleNext}
          disabled={step === 3 && !parsed}
          className="group inline-flex items-center gap-2 bg-[#121214] text-white px-6 py-2.5 text-xs font-medium hover:bg-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
        >
          <span>Continue</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      )}
      {isReadyStep && !hostname && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 bg-[#121214] text-white px-6 py-2.5 text-xs font-medium cursor-pointer"
        >
          <span>Back</span>
        </button>
      )}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Shell                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative">
      {/* Panel */}
      <div
        className={`mx-auto w-full ${
          step === 1 ? "max-w-3xl" : "max-w-[1080px]"
        }`}
      >
        <div className="relative bg-white border border-[#EFEFEA] shadow-[0_1px_2px_rgba(18,18,20,0.04),0_16px_48px_-16px_rgba(18,18,20,0.10)] flex flex-col min-h-[560px] sm:min-h-[600px]">
          {/* Spectral top hairline */}
          <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
            <div className="h-full w-full spectrum-line opacity-70" />
          </div>

          {/* Header */}
          <header className="flex items-center justify-between gap-4 border-b border-[#EFEFEA] pl-6 pr-4 sm:px-8 py-4 shrink-0">
            <div className="flex items-center gap-5 lg:gap-8 flex-1 min-w-0">
              <RanklyLogo height={14} priority />
              {DesktopStepper}
              {MobileStepper}
            </div>
            {!isSubmitting && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-mono text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer shrink-0"
              >
                Skip →
              </button>
            )}
          </header>

          {/* Body — single primary content column */}
          <div className="flex-1 flex flex-col px-5 sm:px-8 py-6 sm:py-9">
            {isSubmitting ? (
              analysisState
            ) : (
              <div className="flex-1 flex flex-col gap-5 w-full max-w-2xl mx-auto min-w-0">
                {ConfigSummary && <div className="shrink-0">{ConfigSummary}</div>}

                <div className="flex-1 flex flex-col min-w-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 1 && stepIdentity}
                    {step === 2 && stepClassification}
                    {step === 3 && stepWebsite}
                    {step === 4 && stepFocus}
                    {step === 5 && stepReady}
                  </AnimatePresence>

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-start gap-2"
                      role="alert"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden="true" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          {!isSubmitting && footerControls}
        </div>
      </div>

      <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} contextHostname={hostname} />
    </div>
  );
}
