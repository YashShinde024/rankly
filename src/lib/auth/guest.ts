import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

/**
 * Guest identity via signed httpOnly cookie.
 * Survives refresh / browser restart; clearing the cookie only resets the
 * server-side record link, and the guests/{id} document still enforces usage.
 */

export const GUEST_COOKIE = "rankly_guest";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function sign(value: string): string {
  const secret = process.env.FIREBASE_PRIVATE_KEY || process.env.GEMINI_API_KEY || "rankly-guest-secret";
  return createHash("sha256").update(`${value}.${secret}`).digest("hex").slice(0, 32);
}

export function createGuestId(): string {
  return randomBytes(16).toString("hex");
}

/** Reads and validates the guest cookie. Returns null if absent/tampered. */
export function readGuestId(req: NextRequest): string | null {
  const raw = req.cookies.get(GUEST_COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || sign(id) !== sig) return null;
  return id;
}

/** Sets (or refreshes) the signed guest cookie on an outgoing response. */
export function attachGuestCookie(res: NextResponse, guestId: string): void {
  res.cookies.set(GUEST_COOKIE, `${guestId}.${sign(guestId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
}
