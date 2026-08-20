import React from "react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "URL Probing",
      desc: "Protocol normalization, TLS certificate verification, and server response timing.",
    },
    {
      num: "02",
      title: "Signal Extraction",
      desc: "AST parsing of DOM, metadata, headings, images, robots.txt, and sitemaps.",
    },
    {
      num: "03",
      title: "Deterministic Scoring",
      desc: "20+ mathematical rule checks weighted against Google Core Web & search guidelines.",
    },
    {
      num: "04",
      title: "Actionable Intelligence",
      desc: "AI layer translates raw findings into prioritized root causes and code solutions.",
    },
  ];

  return (
    <section className="py-24 border-t border-[#EFEFEA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            Process
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
            How Rankly works.
          </h2>
          <p className="mt-3 text-sm text-[#66666E] leading-relaxed">
            A linear progression from raw network probing to developer-ready code fixes.
          </p>
        </div>

        {/* Clean Horizontal Architectural Progression */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative border-t border-[#EFEFEA] pt-12">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#66666E]">
                  {step.num}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#121214]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-[#66666E] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
