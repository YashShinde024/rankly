import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "URL Probing & DNS Resolution",
      desc: "Validates public IP boundaries, checks SSL/TLS handshakes, and evaluates initial Time-To-First-Byte (TTFB) latency.",
    },
    {
      num: "02",
      title: "Crawl & Document Ingestion",
      desc: "Fetches static HTML, crawls robots.txt directives, and inspects sitemap.xml endpoints without overloading the target server.",
    },
    {
      num: "03",
      title: "AST DOM & Meta Parsing",
      desc: "Extracts titles, descriptions, canonical tags, viewport configurations, heading hierarchy, image attributes, and JSON-LD structured data.",
    },
    {
      num: "04",
      title: "Deterministic Rule Verification",
      desc: "Applies 20+ strict, mathematical validations against Google Core Web and W3C standards. No artificial intelligence is used to invent findings.",
    },
    {
      num: "05",
      title: "Rankly SEO Score Calculation",
      desc: "Computes category health scores across Technical SEO (35%), On-Page SEO (30%), Content (20%), and Social Discoverability (15%).",
    },
    {
      num: "06",
      title: "AI Synthesis & Recommendation Engine",
      desc: "Translates raw errors and warnings into concise root-cause explanations and generates copy-paste code snippets.",
    },
    {
      num: "07",
      title: "Structured Diagnostic Report",
      desc: "Delivers an actionable, prioritized report ready for immediate developer deployment.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        <header className="border-b border-[#EFEFEA] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
              Architecture
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-light tracking-tight text-[#121214]">
              How Rankly works under the hood.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#66666E] leading-relaxed">
              A transparent two-layer engine: rigorous deterministic signal verification paired with intelligent AI synthesis.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-20">
          {/* Architectural Statement */}
          <div className="border-b border-[#EFEFEA] pb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
              Core Principle
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#121214] leading-relaxed">
              <strong>Rankly does not use AI to calculate SEO scores or invent issues.</strong> Deterministic parsers check actual HTTP headers and HTML markup. AI is used solely to explain the underlying business impact and provide ready-to-use code fixes.
            </p>
          </div>

          {/* Stepped Timeline */}
          <div className="mt-16 divide-y divide-[#EFEFEA]">
            {steps.map((step) => (
              <div key={step.num} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <div className="md:col-span-2 font-mono text-xs text-[#66666E]">
                  Phase {step.num}
                </div>
                <div className="md:col-span-4 text-base font-medium text-[#121214]">
                  {step.title}
                </div>
                <div className="md:col-span-6 text-xs text-[#66666E] leading-relaxed">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-20 pt-12 border-t border-[#EFEFEA] flex items-center justify-between">
            <span className="text-sm font-light text-[#121214]">
              Ready to analyze your website?
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#121214] px-5 py-2.5 text-xs font-medium text-white hover:bg-black transition-colors"
            >
              <span>Analyze site</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
