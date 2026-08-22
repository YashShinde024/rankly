import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description:
    "How Rankly handles data, public audits, AI processing, retention, and the terms that govern use of the platform.",
  alternates: { canonical: "/legal" },
};

export default function Legal() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense>
          <LegalPage />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
