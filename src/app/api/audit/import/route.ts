import { NextRequest, NextResponse } from "next/server";
import { auditStore } from "@/lib/store/audit-store";
import type { SeoAuditReport } from "@/types/audit";

export const dynamic = "force-dynamic";

/**
 * Re-hydrates an audit report into this serverless instance's store.
 * Used when a client holds a freshly-created report in sessionStorage but
 * the audit page was served by a different lambda instance without KV configured.
 */
export async function POST(req: NextRequest) {
  let body: { report?: SeoAuditReport };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const report = body?.report;
  if (!report || typeof report.id !== "string" || typeof report.domain !== "string") {
    return NextResponse.json({ success: false, error: "INVALID_REPORT" }, { status: 400 });
  }

  await auditStore.set(report);
  return NextResponse.json({ success: true, auditId: report.id }, { status: 200 });
}
