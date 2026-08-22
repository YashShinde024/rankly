import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { linkGuestAudits } from "@/lib/firebase/firestore-repo";
import { readGuestId } from "@/lib/auth/guest";

export const dynamic = "force-dynamic";

/**
 * POST /api/audits/link-guest
 * Links the caller's own guest audit(s) to their authenticated account.
 * Security: the guestId comes exclusively from the signed httpOnly cookie,
 * so a user can never claim another visitor's audits.
 */
export async function POST(req: NextRequest) {
  const authCtx = await verifyAuthToken(req.headers.get("authorization"));
  if (!authCtx) {
    return NextResponse.json(
      { success: false, error: "UNAUTHENTICATED", message: "Sign in to link your reports." },
      { status: 401 }
    );
  }

  const guestId = readGuestId(req);
  if (!guestId) {
    return NextResponse.json(
      { success: true, linked: 0 },
      { status: 200 }
    );
  }

  try {
    const linked = await linkGuestAudits(guestId, authCtx.uid);
    return NextResponse.json({ success: true, linked }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/audits/link-guest] Failed:", err);
    return NextResponse.json(
      { success: false, error: "LINK_FAILED", message: "Couldn't sync your earlier report. It stays available via its direct link." },
      { status: 500 }
    );
  }
}
