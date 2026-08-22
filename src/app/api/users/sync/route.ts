import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/firebase/admin";
import { ensureUserProfile } from "@/lib/firebase/firestore-repo";

export const dynamic = "force-dynamic";

/**
 * POST /api/users/sync
 * Creates/updates the caller's Firestore profile after sign-in.
 * Body (optional): { nickname?: string }
 * Identity comes exclusively from the verified ID token — never the body.
 */
export async function POST(req: NextRequest) {
  const authCtx = await verifyAuthToken(req.headers.get("authorization"));
  if (!authCtx) {
    return NextResponse.json(
      { success: false, error: "UNAUTHENTICATED", message: "Sign in to sync your profile." },
      { status: 401 }
    );
  }

  let nickname: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body.nickname === "string" && body.nickname.trim().length <= 60) {
      nickname = body.nickname.trim();
    }
  } catch {
    // empty body is fine
  }

  try {
    await ensureUserProfile(
      {
        uid: authCtx.uid,
        displayName: authCtx.name,
        email: authCtx.email,
        photoURL: authCtx.picture,
        provider: authCtx.provider,
      },
      { nickname, markLogin: true }
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/users/sync] Failed:", err);
    return NextResponse.json(
      { success: false, error: "SYNC_FAILED", message: "Couldn't sync your profile right now." },
      { status: 500 }
    );
  }
}
