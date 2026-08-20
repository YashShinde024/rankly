import React from "react";

export function AiEditorialSection() {
  return (
    <section className="py-24 border-t border-[#EFEFEA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            AI Insights
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight text-[#121214]">
            Don&apos;t just find the problem. <br />
            Understand it.
          </h2>
          <p className="mt-3 text-sm text-[#66666E] leading-relaxed">
            Deterministic analyzers calculate the exact technical facts. The AI layer explains why they matter and provides copy-paste adjustments.
          </p>
        </div>

        {/* Typographic Finding & Solution Layout (No giant gradient card) */}
        <div className="mt-16 border-t border-[#EFEFEA] pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Finding */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                WARNING
              </span>
              <span className="font-mono text-xs text-[#66666E]">
                Diagnostic Signal
              </span>
            </div>

            <h3 className="text-xl font-normal text-[#121214]">
              Missing Meta Description
            </h3>

            <div className="bg-white p-4 border border-[#EFEFEA] font-mono text-xs text-[#66666E]">
              &lt;meta name=&quot;description&quot; content=&quot;&quot; /&gt;
              <br />
              <span className="text-rose-600">→ Detected: Null (0 characters)</span>
            </div>

            <p className="text-xs text-[#66666E] leading-relaxed">
              Deterministic rule: The meta description must be present and contain between 120 and 160 characters.
            </p>
          </div>

          {/* AI Explanation & Fix */}
          <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-[#EFEFEA] lg:pl-12">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] block mb-1">
                Why it matters
              </span>
              <p className="text-xs text-[#121214] leading-relaxed">
                When no description exists, search engines extract arbitrary sentence fragments from page body copy. This results in disjointed SERP snippets and reduces organic click-through rates by up to 25%.
              </p>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#66666E] block mb-1">
                Rankly recommends
              </span>
              <p className="text-xs text-[#121214] leading-relaxed">
                Add a descriptive 140–155 character meta description highlighting your core product capability:
              </p>

              <div className="mt-3 bg-[#121214] text-white p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                &lt;meta name=&quot;description&quot;
                <br />
                &nbsp;&nbsp;content=&quot;Rankly delivers automated website SEO audits with clear, actionable recommendations. Uncover technical flaws without signup.&quot; /&gt;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
