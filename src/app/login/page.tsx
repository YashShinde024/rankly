import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Sign in | Rankly",
  description: "Sign in to your Rankly workspace to access your website visibility reports.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 12%, rgba(139,92,246,0.05), rgba(59,130,246,0.03) 45%, transparent 75%)",
        }}
      />
      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <Suspense fallback={null}>
          <AuthPanel initialMode="signin" />
        </Suspense>
      </main>
    </div>
  );
}
