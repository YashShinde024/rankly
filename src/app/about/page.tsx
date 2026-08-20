import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { ArrowRight, ShieldCheck, Cpu, Search, MessageSquare, Bot, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Rankly — A Clearer Way to Understand Your Website",
  description:
    "Rankly analyzes measurable website signals across traditional search, answer-oriented content, and generative AI readiness. Built by Yash Shinde, part of Nyxen.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* 1. HERO / EDITORIAL HEADER */}
        <header className="border-b border-[#EFEFEA] bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
              About Rankly
            </span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-light tracking-tight text-[#121214] leading-[1.1]">
              A clearer way to understand <br className="hidden sm:inline" />
              your website.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#66666E] leading-relaxed max-w-2xl font-light">
              Rankly analyzes measurable website signals across traditional search, answer-oriented content, and generative AI readiness. It is designed to show not only a score, but the evidence behind it.
            </p>
          </div>
        </header>

        {/* 2. MAIN MANIFESTO CONTENT */}
        <main className="mx-auto max-w-4xl px-6 py-16 space-y-20">
          {/* SECTION: WHAT RANKLY ANALYZES */}
          <section className="space-y-6">
            <div className="border-b border-[#EFEFEA] pb-3 flex items-baseline justify-between">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#121214] font-semibold">
                What Rankly Analyzes
              </h2>
              <span className="font-mono text-[11px] text-[#8C8C94]">3 Diagnostic Pillars</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Search */}
              <div className="p-6 bg-white border border-[#EFEFEA] space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#121214]" />
                  <h3 className="font-mono text-xs uppercase font-semibold text-[#121214]">Search</h3>
                </div>
                <p className="text-xs text-[#66666E] leading-relaxed">
                  Technical and on-page signals that affect how a webpage is structured for search engines.
                </p>
              </div>

              {/* Answers */}
              <div className="p-6 bg-white border border-[#EFEFEA] space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-violet-700" />
                  <h3 className="font-mono text-xs uppercase font-semibold text-[#121214]">Answers</h3>
                </div>
                <p className="text-xs text-[#66666E] leading-relaxed">
                  Signals related to how clearly content is organized to answer user questions.
                </p>
              </div>

              {/* Generative */}
              <div className="p-6 bg-white border border-[#EFEFEA] space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-700" />
                  <h3 className="font-mono text-xs uppercase font-semibold text-[#121214]">Generative</h3>
                </div>
                <p className="text-xs text-[#66666E] leading-relaxed">
                  Signals that help evaluate how structured, understandable, and identifiable content is for generative AI systems.
                </p>
              </div>
            </div>

            {/* Crucial Disclaimer */}
            <div className="p-4 bg-[#F5F5F3] border-l-2 border-[#121214] text-xs font-mono text-[#66666E]">
              <span className="font-semibold text-[#121214]">Important Notice: </span>
              Rankly measures website readiness signals. It does not guarantee rankings or AI recommendations.
            </div>
          </section>

          {/* SECTION: HOW RANKLY WORKS */}
          <section className="space-y-6">
            <div className="border-b border-[#EFEFEA] pb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#121214] font-semibold">
                How Rankly Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-white border border-[#EFEFEA] space-y-2 font-mono text-xs">
                <span className="text-[11px] text-[#8C8C94]">Step 01</span>
                <h4 className="font-medium text-[#121214] text-sm font-sans">Submit a Public Website</h4>
                <p className="text-[#66666E] font-sans text-xs leading-relaxed">
                  You enter a public website address. Rankly sanitizes the URL and ensures it passes safety and rate boundaries.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#EFEFEA] space-y-2 font-mono text-xs">
                <span className="text-[11px] text-[#8C8C94]">Step 02</span>
                <h4 className="font-medium text-[#121214] text-sm font-sans">Inspect Measurable Signals</h4>
                <p className="text-[#66666E] font-sans text-xs leading-relaxed">
                  Rankly inspects measurable technical, structural, content, and metadata signals via non-destructive HTTP requests.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#EFEFEA] space-y-2 font-mono text-xs">
                <span className="text-[11px] text-[#8C8C94]">Step 03</span>
                <h4 className="font-medium text-[#121214] text-sm font-sans">Strict Scoring Engine</h4>
                <p className="text-[#66666E] font-sans text-xs leading-relaxed">
                  The scoring engine deterministically evaluates SEO, AEO, and GEO readiness based on verified compliance rules without arbitrary point inflation.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#EFEFEA] space-y-2 font-mono text-xs">
                <span className="text-[11px] text-[#8C8C94]">Step 04</span>
                <h4 className="font-medium text-[#121214] text-sm font-sans">AI Recommendations</h4>
                <p className="text-[#66666E] font-sans text-xs leading-relaxed">
                  Rankly AI helps synthesize complex issues into plain-English root-cause explanations and prioritized next moves.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: MEASURED SIGNALS VS AI RECOMMENDATIONS */}
          <section className="space-y-6">
            <div className="border-b border-[#EFEFEA] pb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#121214] font-semibold">
                Measured Signals vs. AI Recommendations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
              <div className="p-6 bg-white border border-[#EFEFEA] space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#121214]" />
                  <h3 className="font-mono text-xs uppercase font-semibold text-[#121214]">
                    Measured Signals
                  </h3>
                </div>
                <p className="text-[#66666E]">
                  These are 100% deterministic observations extracted directly from the HTML source, server response headers, XML sitemaps, and robots.txt. They include exact HTTP status codes, title character counts, Schema.org type arrays, heading trees, and image alt attributes. Scores and deductions are derived entirely from these empirical measurements.
                </p>
              </div>

              <div className="p-6 bg-white border border-[#EFEFEA] space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-violet-700" />
                  <h3 className="font-mono text-xs uppercase font-semibold text-[#121214]">
                    AI Recommendations
                  </h3>
                </div>
                <p className="text-[#66666E]">
                  AI is never used to fabricate scores or guess missing technical metrics. Instead, Gemini AI reads the verified findings to generate actionable remediation steps, suggest optimized copy, and outline code snippets to save engineers and founders time.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: PRIVACY & RESPONSIBLE CRAWLING */}
          <section className="space-y-6">
            <div className="border-b border-[#EFEFEA] pb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#121214] font-semibold">
                Privacy & Responsible Crawling
              </h2>
            </div>

            <div className="p-6 bg-white border border-[#EFEFEA] space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#66666E]">
                <div className="flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-[#121214] shrink-0 mt-0.5" />
                  <span><strong>Only public websites</strong> are analyzed. Private local hostnames (localhost, private subnets, cloud metadata) are permanently blocked via SSRF protection.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Anti-abuse protections:</strong> 5 audits per IP per hour, concurrent connection limits, and a strict 7-day public audit cooldown per domain.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-[#121214] font-bold">·</span>
                  <span><strong>No unnecessary storage:</strong> Raw HTML pages are not stored long-term after signal extraction.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-[#121214] font-bold">·</span>
                  <span><strong>Sanitized index:</strong> Sensitive URL parameters (tokens, auth keys, sessions) are stripped prior to indexing.</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: BUILT BY */}
          <section className="pt-8 border-t border-[#EFEFEA] space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C8C94] block">
              Provenance
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#121214]">
                  Rankly is built by{" "}
                  <a
                    href="https://yashshinde.is-a.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-black transition-colors"
                  >
                    Yash Shinde
                  </a>
                  .
                </p>
                <p className="text-xs text-[#66666E]">
                  Part of{" "}
                  <a
                    href="https://nyxen.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#121214] transition-colors"
                  >
                    Nyxen
                  </a>
                  .
                </p>
              </div>

              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-4 py-2 text-xs font-medium hover:bg-black transition-colors"
                >
                  <span>Analyze a website</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
