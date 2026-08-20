import { NextRequest, NextResponse } from "next/server";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import { generateAuditForUrl } from "@/lib/demo-data";
import { generateAuditPdfHtml } from "@/lib/pdf/generate-pdf";

export const dynamic = "force-dynamic";

export function sanitizeFilename(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const normalizedId = normalizeAuditId(decodedId);

    let report = await auditStore.get(normalizedId);
    if (!report) {
      report = generateAuditForUrl(decodedId);
    }

    const htmlContent = generateAuditPdfHtml(report);
    const safeDomain = sanitizeFilename(report.domain || "website");
    const filename = `rankly-audit-${safeDomain}.html`;

    // Render as inline HTML so browser print dialog can open seamlessly
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Export failed", message: "Could not generate the audit document." },
      { status: 500 }
    );
  }
}
