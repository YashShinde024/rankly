"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, Lock, ScrollText, ServerCog, Sparkles, ShieldCheck } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";

type Tab = "privacy" | "terms";

interface LegalSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  body: React.ReactNode;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#66666E] leading-relaxed">{children}</p>;
}

function L({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2">
      {React.Children.map(children, (child) => (
        <li className="flex gap-2.5 text-sm text-[#66666E] leading-relaxed">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#D4D4D0]" aria-hidden="true" />
          <span>{child}</span>
        </li>
      ))}
    </ul>
  );
}

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    icon: <Eye className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          Rankly analyzes publicly accessible web pages and produces search &amp; AI-visibility
          reports. This policy explains what we collect, why, how long we keep it, and the choices
          you have. Rankly works for guests (one free analysis, no signup required) and for
          optional registered accounts powered by Google Firebase Authentication.
        </P>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    icon: <ServerCog className="h-3.5 w-3.5" />,
    body: (
      <L>
        <>The URL you submit for analysis, plus a normalized reference ID for the resulting report.</>
        <>Publicly available content from the submitted page: HTML metadata, headings, link structure, robots.txt, sitemap.xml, and server response headers.</>
        <>A coarse client IP address used exclusively for rate limiting and abuse prevention. It is not linked to your browsing activity and is never sold or shared.</>
        <>If you create an account: your email address, display name/nickname, and profile photo URL (when signing in with Google). Authentication is handled by Firebase Authentication — Rankly never sees or stores your password.</>
        <>Onboarding preferences (nickname, website type, analysis focus) stored in your browser&apos;s localStorage, and — when you are signed in — as part of your profile and reports in Firestore.</>
      </L>
    ),
  },
  {
    id: "ai-processing",
    title: "AI processing (Gemini)",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          Report synthesis uses Google Gemini. Only aggregated, de-identified analysis signals
          (category scores, check outcomes, page-type classification) are sent to the AI layer —
          never your IP address, onboarding answers, or any credentials.
        </P>
        <div className="mt-3">
          <AiAccent variant="edge">
            <p className="text-xs text-[#66666E] py-1 pr-2">
              If Gemini is unavailable, Rankly transparently falls back to deterministic,
              rules-based recommendations. The report always states which mode produced it.
            </p>
          </AiAccent>
        </div>
      </>
    ),
  },
  {
    id: "storage-retention",
    title: "Storage & retention",
    icon: <Lock className="h-3.5 w-3.5" />,
    body: (
      <L>
        <>Audit reports are stored as lightweight JSON (scores, findings, metadata — never raw page HTML).</>
        <><strong>Guest reports</strong> are temporary and expire 7 days after creation; they become unavailable at that point and are removed from our database afterward.</>
        <><strong>Authenticated reports</strong> are stored in Firestore under your account and remain available in your workspace unless a future retention policy changes this.</>
        <>The public index keeps a maximum of the 500 most recent audits; older records are removed first.</>
        <>A domain can only be re-audited every 7 days; cooldown records carry a matching 7-day window.</>
        <>We use a small number of browser cookies/localStorage entries strictly for product function: your onboarding state, a signed identifier that ties your one free guest analysis to this browser, and your session when signed in. We do not use advertising or cross-site tracking cookies.</>
        <>No analytics service is currently enabled.</>
      </L>
    ),
  },
  {
    id: "public-reports",
    title: "Public reports & visibility",
    icon: <Eye className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          Reports are public by default: anyone with the report reference can view them, and recent
          reports may appear in the public Index. Do not submit URLs whose analysis you
          wouldn&apos;t want visible. Report data contains only information already exposed
          publicly by the target website itself. Private, owner-only reports are part of our data
          model and can only be opened by the authenticated account that created them.
        </P>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights & contact",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          If you have an account you can sign out at any time, and request deletion of your
          profile and associated reports. Guests can clear all local data from their browser
          settings. To request removal of a specific audit report, or to ask anything about this
          policy, contact us and we will action reasonable requests promptly.
        </P>
        <p className="text-sm text-[#121214] pt-2">
          Contact:{" "}
          <a href="https://yashshinde.is-a.dev" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[#D4D4D0] hover:decoration-[#121214] transition-colors">
            Yash Shinde · Nyxen
          </a>
        </p>
      </>
    ),
  },
];

const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    icon: <ScrollText className="h-3.5 w-3.5" />,
    body: (
      <P>
        By accessing or using Rankly (&quot;the Service&quot;), you agree to these Terms. If you do
        not agree, please do not use the Service. We may update these terms; continued use after an
        update constitutes acceptance of the revised terms.
      </P>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    body: (
      <L>
        <>Only submit URLs you own or have permission to analyze.</>
        <>Do not attempt to bypass rate limits (currently 5 audits per hour per IP), the one-free-analysis limit for guests, or the 7-day domain cooldown.</>
        <>Do not create multiple accounts to circumvent usage limits, and do not attempt to access another user&apos;s private reports.</>
        <>Do not use Rankly to probe, scan, or attack infrastructure, or to harvest content at scale.</>
        <>We enforce server-side SSRF protections and reserve the right to block any traffic that violates these rules.</>
      </L>
    ),
  },
  {
    id: "accounts",
    title: "Accounts & verification",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          Rankly offers optional free accounts (Google sign-in or email/password via Firebase
          Authentication). Email/password accounts must verify their email address before gaining
          full product access; verification emails can be resent from the product. You are
          responsible for activity under your account. Reports created while browsing as a guest
          may be linked to your account when you register from the same browser.
        </P>
      </>
    ),
  },
  {
    id: "service-description",
    title: "Service description",
    icon: <ServerCog className="h-3.5 w-3.5" />,
    body: (
      <P>
        Rankly performs read-only fetches of publicly available pages and produces heuristic +
        AI-assisted assessments of SEO, answer-engine (AEO), and generative-engine (GEO)
        readiness. Scores are directional guidance, not guarantees of search performance or AI
        citation outcomes.
      </P>
    ),
  },
  {
    id: "ip-content",
    title: "Content & intellectual property",
    icon: <Lock className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          You retain all rights to your website and its content. By submitting a URL you grant
          Rankly a limited, revocable license to fetch, parse, and display derived analysis of that
          public page within reports. Reports themselves — scores, summaries, and recommendations
          generated by Rankly — may be shared freely with attribution.
        </P>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer & liability",
    icon: <ScrollText className="h-3.5 w-3.5" />,
    body: (
      <>
        <P>
          The Service is provided &quot;as is&quot; without warranties of any kind. Analysis depends
          on third-party websites, crawlers, and AI providers whose behavior may change without
          notice. To the maximum extent permitted by law, Rankly and Nyxen are not liable for
          indirect, incidental, or consequential damages arising from use of the Service, including
          decisions made based on report contents.
        </P>
      </>
    ),
  },
];

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "privacy", label: "Privacy Policy", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { id: "terms", label: "Terms of Service", icon: <ScrollText className="h-3.5 w-3.5" /> },
];

export function LegalPage() {
  const params = useSearchParams();
  const initialTab = params.get("tab") === "terms" ? "terms" : "privacy";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [activeSection, setActiveSection] = useState<string>("");
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = tab === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
    // Reset the active tab when the ?tab= query param changes (deep links).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTab(initialTab);
  }, [initialTab]);

  // Track active section for the sticky nav highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <main ref={contentRef} className="relative mx-auto max-w-6xl px-6 pb-24">
      {/* Header */}
      <header className="pt-16 pb-10 border-b border-[#EFEFEA]">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
          <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
          <span>Legal Center</span>
          <span className="text-[#D4D4D0]">·</span>
          <span>Last updated August 2026</span>
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl font-light tracking-tight leading-[1.08]">
          Privacy &amp; Terms,{" "}
          <span className="spectral-text">
            in plain language.
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-sm sm:text-base text-[#66666E] leading-relaxed">
          Clear rules about what happens when you run an
          audit — written to be read, not skimmed past.
        </p>

        {/* Tab switcher */}
        <div className="mt-8 inline-flex border border-[#EFEFEA] bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                tab === t.id ? "text-white" : "text-[#66666E] hover:text-[#121214]"
              }`}
            >
              {tab === t.id && !reduce && (
                <motion.span
                  layoutId="legal-tab-pill"
                  className="absolute inset-0 bg-[#121214]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {tab === t.id && reduce && <span className="absolute inset-0 bg-[#121214]" />}
              <span className="relative flex items-center gap-2">
                {t.icon}
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Content + sticky TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 pt-10">
        {/* Sticky table of contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C94] block mb-3">
              On this page
            </span>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block px-2.5 py-1.5 text-xs border-l-2 transition-all ${
                  activeSection === section.id
                    ? "border-[#121214] text-[#121214] font-medium bg-[#F4F4F0]"
                    : "border-transparent text-[#66666E] hover:text-[#121214] hover:border-[#D4D4D0]"
                }`}
              >
                {section.title}
              </a>
            ))}
            <Link
              href="/"
              className="mt-6 flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-violet-700 font-medium group"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run an audit</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>

        {/* Sections */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="space-y-12"
            >
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="inline-flex items-center justify-center h-7 w-7 border border-[#EFEFEA] bg-white text-[#121214]">
                      {section.icon}
                    </span>
                    <h2 className="text-lg sm:text-xl font-light tracking-tight text-[#121214]">
                      {section.title}
                    </h2>
                    <span className="ml-auto font-mono text-[10px] text-[#9E9EA4]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="pl-0 sm:pl-9 space-y-3 border-l-0 sm:border-l sm:border-[#EFEFEA] sm:pl-6">
                    {section.body}
                  </div>
                </motion.section>
              ))}

              {/* Footer note */}
              <div className="border-t border-[#EFEFEA] pt-6">
                <p className="text-[11px] font-mono text-[#8C8C94] leading-relaxed">
                  Questions about this document? Reach out via{" "}
                  <a href="https://nyxen.in" target="_blank" rel="noopener noreferrer" className="text-[#121214] underline underline-offset-2">
                    nyxen.in
                  </a>
                  . These documents apply to all Rankly deployments including vercel-hosted
                  production environments.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
