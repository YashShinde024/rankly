import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | Rankly",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-5">
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          404 — Page not found
        </span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
          This page isn&apos;t <span className="spectral-text">visible</span> to us.
        </h1>
        <p className="text-sm text-[#66666E] leading-relaxed">
          The link may be outdated, or the report may have expired. Head back to analyze a website
          or browse recent public audits.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center bg-[#121214] text-white px-5 py-2.5 text-xs font-medium hover:bg-black transition-colors"
          >
            Analyze a website
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center border border-[#D4D4D0] bg-white px-5 py-2.5 text-xs font-medium text-[#121214] hover:border-[#B9B9B4] transition-colors"
          >
            Rankly Index
          </Link>
        </div>
      </div>
    </div>
  );
}
