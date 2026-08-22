import React from "react";
import { Navbar } from "@/components/navbar/navbar";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | Rankly",
  description:
    "Configure your website intelligence report and understand how search engines and AI view your platform.",
};

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col">
      {/* Faint dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #E3E3DE 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.35,
        }}
      />
      {/* Soft radial lighting behind the workspace */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 15%, rgba(139,92,246,0.06), rgba(59,130,246,0.035) 45%, transparent 75%)",
        }}
      />

      <div className="relative">
        <Navbar />
      </div>

      <main className="relative flex-1 mx-auto w-full max-w-[1160px] px-4 sm:px-6 py-8 sm:py-12">
        <OnboardingFlow />
      </main>
    </div>
  );
}
