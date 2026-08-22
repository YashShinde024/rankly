import { NextRequest, NextResponse } from "next/server";
import { auditStore } from "@/lib/store/audit-store";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPublicRecentAudits } from "@/lib/firebase/firestore-repo";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  // Firestore is authoritative for public Index records when configured.
  const db = getAdminDb();
  if (db) {
    const publicAudits = await getPublicRecentAudits(50);
    if (publicAudits.length > 0) {
      return NextResponse.json({ audits: publicAudits }, { status: 200 });
    }
    // Empty Firestore → fall through to legacy store so pre-Firebase
    // public audits still appear in the Index.
  }

  const recentAudits = await auditStore.getRecent();
  return NextResponse.json({ audits: recentAudits }, { status: 200 });
}
