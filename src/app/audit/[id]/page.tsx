import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { AuditHeader } from "@/components/audit/audit-header";
import { AuditLocalNav } from "@/components/audit/audit-local-nav";
import { ExecutiveSummarySection } from "@/components/audit/executive-summary-section";
import { VisualChartsSection } from "@/components/audit/visual-charts-section";
import { AeoGeoDiagnosticsSection } from "@/components/audit/aeo-geo-diagnostics-section";
import { PageSnapshotSection } from "@/components/audit/page-snapshot-section";
import { DetailedChecksTable } from "@/components/audit/detailed-checks-table";
import { AiRecommendations } from "@/components/audit/ai-recommendations";
import { NextStepsSection } from "@/components/audit/next-steps-section";
import { TechnicalDetailsSection } from "@/components/audit/technical-details-section";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { auditStore } from "@/lib/store/audit-store";
import type { Metadata } from "next";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const report = decodedId === "demo" ? DEMO_AUDIT : auditStore.get(decodedId);

  if (!report) {
    return {
      title: "Audit Not Found — Rankly",
      description: "The requested website audit report was not found or has expired.",
    };
  }

  return {
    title: `${report.domain} — Rankly Audit`,
    description: `Website search and AI visibility diagnostic for ${report.domain}. Overall Health: ${report.overallScore}/100.`,
  };
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const report = decodedId === "demo" ? DEMO_AUDIT : auditStore.get(decodedId);
  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />
        <AuditHeader report={report} activeTab="overview" />
        <AuditLocalNav />

        <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
          {/* 1. Executive Summary & 3 Pillars (SEO, AEO, GEO) */}
          <ExecutiveSummarySection report={report} />

          {/* 2. Visual Diagnostic Charts (Radar, Distribution, Categories, Structure) */}
          <VisualChartsSection report={report} />

          {/* 3. AEO & GEO Readiness Diagnostics + Heading Hierarchy */}
          <AeoGeoDiagnosticsSection
            aeo={report.aeoSignals}
            geo={report.geoSignals}
            headingTree={report.headingTree}
          />

          {/* 4. Page Health Snapshot (Extracted Values) */}
          <PageSnapshotSection snapshot={report.snapshot} />

          {/* 5. Comprehensive Signal Findings Table (with Pillar & Status Filters) */}
          <DetailedChecksTable checks={report.checks} />

          {/* 6. Rankly AI Interpretation (What I'd Fix First) */}
          <AiRecommendations
            recommendations={report.recommendations}
            isAvailable={report.aiInsight.isAvailable}
          />

          {/* 7. Action Plan (Next 3 Moves) */}
          <NextStepsSection steps={report.nextSteps} />

          {/* 8. Server & Crawler Directives Matrix */}
          <TechnicalDetailsSection technical={report.technicalDetails} />
        </main>
      </div>

      <Footer />
    </div>
  );
}
