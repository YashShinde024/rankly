import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { AuditNotFound } from "@/components/audit/audit-not-found";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { ArrowRight, ArrowLeft, Shield, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ExploreDetailPageProps {
  params: Promise<{ auditId: string }>;
}

export async function generateMetadata({ params }: ExploreDetailPageProps): Promise<Metadata> {
  const { auditId } = await params;
  const decodedId = decodeURIComponent(auditId);
  const normalizedId = normalizeAuditId(decodedId);
  const report = normalizedId === "demo" ? DEMO_AUDIT : await auditStore.get(normalizedId);

  if (!report) {
    return {
      title: "Audit Not Found — Rankly Index",
    };
  }

  return {
    title: `${report.domain} — Rankly Index Public Summary`,
    description: `Public diagnostic summary for ${report.domain}. Overall Rankly Score: ${report.overallScore}/100.`,
  };
}

export default async function ExploreDetailPage({ params }: ExploreDetailPageProps) {
  const { auditId } = await params;
  const decodedId = decodeURIComponent(auditId);
  const normalizedId = normalizeAuditId(decodedId);

  const report = normalizedId === "demo" ? DEMO_AUDIT : await auditStore.get(normalizedId);
  if (!report) {
    return <AuditNotFound auditId={decodedId} />;
  }

  const criticalCount = report.checks.filter((c) => c.status === "error").length;
  const warningCount = report.checks.filter((c) => c.status === "warning").length;
  const passedCount = report.checks.filter((c) => c.status === "pass").length;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
          {/* Back to Index Link */}
          <div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#66666E] hover:text-[#121214] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Rankly Index</span>
            </Link>
          </div>

          {/* Sanitized Public Summary Card */}
          <div className="border border-[#EFEFEA] bg-white p-8 sm:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#EFEFEA] pb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
                  Sanitized Public Audit Summary
                </span>
                <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#121214] mt-2">
                  {report.domain}
                </h1>
                <p className="text-xs font-mono text-[#8C8C94] mt-1">
                  Analyzed on {report.formattedDate} · Audit ID: {report.id}
                </p>
              </div>

              {/* Overall Score */}
              <div className="text-right">
                <span className="font-mono text-xs uppercase tracking-wider text-[#66666E] block mb-1">
                  Rankly Score
                </span>
                <span className="font-mono text-4xl sm:text-5xl font-light text-[#121214]">
                  {report.overallScore}
                </span>
                <span className="font-mono text-xs text-[#8C8C94]"> / 100</span>
              </div>
            </div>

            {/* 3 Pillars Summary Spread */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 border border-[#EFEFEA] bg-[#FCFCFA] space-y-1">
                <span className="font-mono text-xs text-[#66666E] block uppercase">Search (SEO)</span>
                <span className="font-mono text-2xl font-light text-[#121214] block">
                  {report.pillars.seo.score}
                </span>
                <span className="text-xs text-[#66666E] block truncate">{report.pillars.seo.verdict}</span>
              </div>

              <div className="p-4 border border-[#EFEFEA] bg-[#FCFCFA] space-y-1">
                <span className="font-mono text-xs text-[#66666E] block uppercase">Answers (AEO)</span>
                <span className="font-mono text-2xl font-light text-violet-700 block">
                  {report.pillars.aeo.score}
                </span>
                <span className="text-xs text-[#66666E] block truncate">{report.pillars.aeo.verdict}</span>
              </div>

              <div className="p-4 border border-[#EFEFEA] bg-[#FCFCFA] space-y-1">
                <span className="font-mono text-xs text-[#66666E] block uppercase">Generative (GEO)</span>
                <span className="font-mono text-2xl font-light text-blue-700 block">
                  {report.pillars.geo.score}
                </span>
                <span className="text-xs text-[#66666E] block truncate">{report.pillars.geo.verdict}</span>
              </div>
            </div>

            {/* High-Level Findings Count */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono border-t border-b border-[#EFEFEA] py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span><strong>{criticalCount}</strong> Critical Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span><strong>{warningCount}</strong> Warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span><strong>{passedCount}</strong> Passed Signals</span>
              </div>
            </div>

            {/* Privacy Badge & View Full Audit CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C8C94]">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>No private tokens, parameters, or internal IP data exposed.</span>
              </div>

              <Link
                href={`/audit/${report.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#121214] text-white px-6 py-3 text-xs font-medium hover:bg-black transition-colors"
              >
                <span>View full diagnostic report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
