"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-32 border-t border-[#EFEFEA]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#121214] leading-tight">
            See what your <br />
            website is missing.
          </h2>
          <p className="mt-4 text-sm text-[#66666E]">
            Run a deterministic SEO audit and receive prioritized recommendations in seconds.
          </p>

          <div className="mt-8">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#121214] px-6 py-3.5 text-xs font-medium text-white transition-colors hover:bg-black"
            >
              <span>Analyze your website</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
