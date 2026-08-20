import React from "react";
import { PillarArea } from "@/types/audit";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface NextStepsProps {
  steps: Array<{
    stepNumber: number;
    title: string;
    rationale: string;
    area: PillarArea;
  }>;
}

export function NextStepsSection({ steps }: NextStepsProps) {
  return (
    <section id="next-steps" className="border-b border-[#EFEFEA] pb-16 space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
            Action Plan
          </span>
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
            Your next 3 moves.
          </h3>
        </div>
        <span className="font-mono text-xs text-[#8C8C94]">Prioritized by algorithmic impact</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="border border-[#EFEFEA] bg-white p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#121214]">
                  Move 0{step.stepNumber}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider bg-[#FAFAFA] border border-[#EFEFEA] px-2 py-0.5 text-[#66666E]">
                  {step.area}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-[#121214] leading-snug">
                {step.title}
              </h4>
              <p className="text-xs text-[#66666E] leading-relaxed">
                {step.rationale}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFEFEA] flex items-center gap-1.5 text-xs font-mono text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified High Impact</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
