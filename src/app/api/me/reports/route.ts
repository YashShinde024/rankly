import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { getUserAudits } from "@/lib/firebase/firestore-repo";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/reports
 * Returns the authenticated user's report history (server-verified).
 */
export async function GET(req: NextRequest) {
  const authCtx = await verifyAuthToken(req.headers.get("authorization"));
  if (!authCtx) {
    return NextResponse.json(
      { success: false, error: "UNAUTHENTICATED", message: "Sign in to view your reports." },
      { status: 401 }
    );
  }

  try {
    const reports = await getUserAudits(authCtx.uid);
    return NextResponse.json({ success: true, reports }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/me/reports] Failed:", err);
    return NextResponse.json(
      { success: false, error: "FIRESTORE_ERROR", message: "Couldn't load your reports right now. Please try again." },
      { status: 500 }
    );
  }
}
