import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { RanklyIndexView } from "@/components/explore/rankly-index-view";
import { auditStore } from "@/lib/store/audit-store";
import { ArrowRight, Shield } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankly Index — Public Directory of Analyzed Websites",
  description:
    "A live public index of website intelligence records: overall visibility scores plus SEO, AEO, and GEO pillar breakdowns for every site analyzed by Rankly.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage() {
  const recentAudits = await auditStore.getRecent();

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Index Hero */}
        <header className="border-b border-[#EFEFEA] py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66666E]">
              <span>Public Directory</span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-5xl font-light tracking-tight text-[#121214]">
              Rankly Index
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#121214] font-medium">
              A public record of websites analyzed by Rankly.
            </p>

            <p className="mt-1 text-xs text-[#66666E]">
              Explore recent audits and see how websites perform across search, answer readiness, and generative visibility.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#8C8C94]">
              <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Publicly visible audit summaries. No private audit data or parameters are exposed.</span>
            </div>
          </div>
        </header>

        {/* Main Directory Table with Interactive Filtering & Search */}
        <main className="mx-auto max-w-6xl px-6 py-12">
          <RanklyIndexView initialAudits={recentAudits} />

          {/* Bottom Callout */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-[#EFEFEA] bg-white text-xs">
            <span className="text-[#66666E]">
              Want to see your website&apos;s Search, AEO &amp; GEO visibility?
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#121214] text-white px-4 py-2 font-medium hover:bg-black transition-colors shrink-0"
            >
              <span>Analyze your website</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
