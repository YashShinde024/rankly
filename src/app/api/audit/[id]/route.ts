import { NextRequest, NextResponse } from "next/server";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import { DEMO_AUDIT } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const normalizedId = normalizeAuditId(decodedId);

  if (normalizedId === "demo") {
    return NextResponse.json({ report: DEMO_AUDIT }, { status: 200 });
  }

  const report = await auditStore.get(normalizedId);
  if (!report) {
    return NextResponse.json(
      { error: "Audit not found", message: "This audit report has expired or does not exist." },
      { status: 404 }
    );
  }

  return NextResponse.json({ report }, { status: 200 });
}
