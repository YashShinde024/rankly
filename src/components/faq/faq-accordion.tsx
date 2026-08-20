"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "What does Rankly check?",
    a: "Rankly inspects 21 deterministic technical and on-page signals: HTTPS protocols, HTTP status latencies, canonical links, robots.txt, XML sitemaps, viewport tags, indexability rules, page title lengths, meta descriptions, single H1 requirements, heading hierarchy, image alt text, internal/external links, Open Graph tags, Twitter/X cards, and JSON-LD structured data.",
  },
  {
    q: "Is Rankly free?",
    a: "Yes. Individual URL audits are completely free without signup, credit card details, or token paywalls.",
  },
  {
    q: "Does AI calculate the SEO score?",
    a: "No. All scores and diagnostic states (PASS, WARN, ERROR) are calculated by transparent, deterministic formulas. The AI layer is strictly used to translate raw findings into prioritized explanations and copy-paste code fixes.",
  },
  {
    q: "How does Rankly handle my website URL?",
    a: "Rankly performs lightweight server-side HTTP requests using a dedicated User-Agent. We do not inject scripts into your site, store credentials, or track your end users.",
  },
  {
    q: "Is Rankly a replacement for Google Search Console?",
    a: "No. Google Search Console provides historical search queries and Google-indexed data. Rankly gives you immediate code-level diagnostic checks and AI-powered recommendations before and after deployment.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 border-t border-[#EFEFEA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
            Frequently asked questions.
          </h2>
        </div>

        {/* Minimal Hairline Accordion (No boxes) */}
        <div className="mt-16 border-t border-[#EFEFEA] divide-y divide-[#EFEFEA]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-start justify-between gap-6 text-left"
                >
                  <span className="text-sm font-normal text-[#121214]">
                    {faq.q}
                  </span>
                  <span className="text-[#66666E] shrink-0 mt-0.5 font-mono text-xs">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3 max-w-3xl text-xs leading-relaxed text-[#66666E]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
