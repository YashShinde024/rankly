import React from "react";
import { Target, Brain, Code2 } from "lucide-react";

export function WhyRanklySection() {
  const benefits = [
    {
      title: "Actionable",
      description: "Know exactly what needs attention instead of digging through confusing, bloated SEO reports with endless vanity metrics.",
      icon: <Target className="h-5 w-5 text-indigo-600" />,
      tag: "Zero Fluff",
    },
    {
      title: "Intelligent",
      description: "AI turns technical findings into understandable recommendations, explaining business impact and giving you ready-to-use fixes.",
      icon: <Brain className="h-5 w-5 text-indigo-600" />,
      tag: "Contextual AI",
    },
    {
      title: "Developer-friendly",
      description: "Transparent checks, structured findings, copy-paste code snippets, and a report you can actually act on in your codebase.",
      icon: <Code2 className="h-5 w-5 text-indigo-600" />,
      tag: "Code Ready",
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-zinc-200/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Core Pillars</span>
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Built for people who ship.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Designed to bridge the gap between technical web development and modern search visibility.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6 transition-all hover:bg-white hover:border-zinc-300 hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-2xs">
                    {b.icon}
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100">
                    {b.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-950">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
