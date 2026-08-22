import { NextRequest, NextResponse } from "next/server";
import { auditStore, normalizeAuditId } from "@/lib/store/audit-store";
import { DEMO_AUDIT } from "@/lib/demo-data";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase/admin";
import { getAuditFromFirestore } from "@/lib/firebase/firestore-repo";

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

  const db = getAdminDb();
  if (db) {
    const record = await getAuditFromFirestore(normalizedId).catch(() => null);
    if (record) {
      // Private audits are visible only to their owner.
      if (record.visibility === "private" && record.userId) {
        const viewer = await verifyAuthToken(req.headers.get("authorization"));
        if (viewer?.uid !== record.userId) {
          return NextResponse.json(
            { error: "Audit not found", message: "This audit report is private or does not exist." },
            { status: 404 }
          );
        }
      }
      return NextResponse.json({ report: record.report }, { status: 200 });
    }
    // Not in Firestore — fall through to legacy store so pre-Firebase URLs keep working.
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
