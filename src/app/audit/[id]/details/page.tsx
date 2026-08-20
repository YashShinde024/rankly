import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { AuditHeader } from "@/components/audit/audit-header";
import { DetailedChecksTable } from "@/components/audit/detailed-checks-table";
import { AuditNotFound } from "@/components/audit/audit-not-found";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface AuditDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuditDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const normalizedId = normalizeAuditId(decodedId);
  const report = normalizedId === "demo" ? DEMO_AUDIT : await auditStore.get(normalizedId);

  if (!report) {
    return {
      title: "Audit Details Not Found — Rankly",
    };
  }

  return {
    title: `Diagnostics & Checks — ${report.domain} | Rankly`,
    description: `Detailed signal diagnostics and 22+ checks for ${report.domain}.`,
  };
}

export default async function AuditDetailsPage({ params }: AuditDetailsPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const normalizedId = normalizeAuditId(decodedId);

  const report = normalizedId === "demo" ? DEMO_AUDIT : await auditStore.get(normalizedId);
  if (!report) {
    return <AuditNotFound auditId={decodedId} />;
  }

  const techChecks = report.checks.filter((c) => c.category === "technical");
  const onpageChecks = report.checks.filter((c) => c.category === "onpage");
  const contentChecks = report.checks.filter((c) => c.category === "content");
  const socialChecks = report.checks.filter((c) => c.category === "social");

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />
        <AuditHeader report={report} activeTab="details" />

        <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
          {/* Technical SEO Section */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-[#EFEFEA] pb-4">
              <div>
                <span className="font-mono text-xs text-[#66666E]">01</span>
                <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
                  Technical SEO Signals
                </h2>
              </div>
              <span className="font-mono text-xs text-[#66666E]">
                Score: {report.categories.technical.score} / 100
              </span>
            </div>
            <DetailedChecksTable checks={techChecks} />
          </section>

          {/* On-Page SEO Section */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-[#EFEFEA] pb-4">
              <div>
                <span className="font-mono text-xs text-[#66666E]">02</span>
                <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
                  On-Page SEO Signals
                </h2>
              </div>
              <span className="font-mono text-xs text-[#66666E]">
                Score: {report.categories.onpage.score} / 100
              </span>
            </div>
            <DetailedChecksTable checks={onpageChecks} />
          </section>

          {/* Content Section */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-[#EFEFEA] pb-4">
              <div>
                <span className="font-mono text-xs text-[#66666E]">03</span>
                <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
                  Content &amp; Semantic Structure
                </h2>
              </div>
              <span className="font-mono text-xs text-[#66666E]">
                Score: {report.categories.content.score} / 100
              </span>
            </div>
            <DetailedChecksTable checks={contentChecks} />
          </section>

          {/* Social Section */}
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-[#EFEFEA] pb-4">
              <div>
                <span className="font-mono text-xs text-[#66666E]">04</span>
                <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214]">
                  Search &amp; Social Discoverability
                </h2>
              </div>
              <span className="font-mono text-xs text-[#66666E]">
                Score: {report.categories.social.score} / 100
              </span>
            </div>
            <DetailedChecksTable checks={socialChecks} />
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
