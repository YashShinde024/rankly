import React from "react";
import { Search, MessageSquare, Bot, ArrowRight, ShieldCheck } from "lucide-react";

export function FeatureCategories() {
  return (
    <section id="checks" className="border-b border-[#EFEFEA] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
          <span>Signal Diagnostics</span>
        </div>

        <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
          What Rankly analyzes across the web.
        </h2>

        <p className="mt-4 max-w-2xl text-xs sm:text-sm text-[#66666E] leading-relaxed">
          Traditional search crawlers, answer engines, and generative AI models interpret your site through distinct signals. We inspect all three.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* SEO Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#121214] pb-3">
              <Search className="h-4 w-4 text-[#121214]" />
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#121214]">
                Search (SEO)
              </h3>
            </div>
            <p className="text-xs text-[#66666E] leading-relaxed">
              Technical crawlability, Core Web Vitals TTFB, canonicalization, viewport responsiveness, and metadata compliance.
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#121214]">
              <li className="flex items-center gap-2"><span>·</span> HTTPS & TLS 1.3 encryption</li>
              <li className="flex items-center gap-2"><span>·</span> Self-referencing canonical tags</li>
              <li className="flex items-center gap-2"><span>·</span> robots.txt & XML sitemaps</li>
              <li className="flex items-center gap-2"><span>·</span> Title & meta description length</li>
              <li className="flex items-center gap-2"><span>·</span> Image alt accessibility attributes</li>
            </ul>
          </div>

          {/* AEO Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-violet-600 pb-3">
              <MessageSquare className="h-4 w-4 text-violet-700" />
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#121214]">
                Answers (AEO)
              </h3>
            </div>
            <p className="text-xs text-[#66666E] leading-relaxed">
              Structuring content to directly answer search intent for voice queries, Google AI Overviews, and featured snippets.
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#121214]">
              <li className="flex items-center gap-2"><span>·</span> Interrogative question headings</li>
              <li className="flex items-center gap-2"><span>·</span> Direct 1-sentence answer blocks</li>
              <li className="flex items-center gap-2"><span>·</span> FAQ schema & accordion structures</li>
              <li className="flex items-center gap-2"><span>·</span> Clear intent matching paragraphs</li>
              <li className="flex items-center gap-2"><span>·</span> Standalone quotation blocks</li>
            </ul>
          </div>

          {/* GEO Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-blue-600 pb-3">
              <Bot className="h-4 w-4 text-blue-700" />
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#121214]">
                Generative (GEO)
              </h3>
            </div>
            <p className="text-xs text-[#66666E] leading-relaxed">
              Entity clarity and semantic knowledge graph integrations that allow ChatGPT, Gemini, and Perplexity to cite your brand.
            </p>
            <ul className="space-y-2 text-xs font-mono text-[#121214]">
              <li className="flex items-center gap-2"><span>·</span> Schema.org JSON-LD entity graph</li>
              <li className="flex items-center gap-2"><span>·</span> Strict semantic heading hierarchy</li>
              <li className="flex items-center gap-2"><span>·</span> Author & publisher provenance</li>
              <li className="flex items-center gap-2"><span>·</span> Topical cluster clarity</li>
              <li className="flex items-center gap-2"><span>·</span> Unambiguous brand entity definitions</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
