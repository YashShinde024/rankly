import { NextResponse } from "next/server";
import { auditStore } from "@/lib/store/audit-store";

export async function GET() {
  const recentAudits = auditStore.getRecent();
  return NextResponse.json({ audits: recentAudits }, { status: 200 });
}
