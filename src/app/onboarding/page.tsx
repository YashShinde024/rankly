import React from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | Rankly",
  description: "Set up your website profile and understand how search engines and AI view your platform.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <OnboardingFlow />
        </main>
      </div>

      <Footer />
    </div>
  );
}
