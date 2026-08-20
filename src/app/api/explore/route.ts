import { NextResponse } from "next/server";
import { auditStore } from "@/lib/store/audit-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const recentAudits = await auditStore.getRecent();
  return NextResponse.json({ audits: recentAudits }, { status: 200 });
}
