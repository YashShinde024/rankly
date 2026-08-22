import "server-only";

/**
 * Firebase Admin SDK — server-only singleton.
 *
 * Credentials come from environment variables (never NEXT_PUBLIC_*):
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * The private key may contain literal "\n" sequences (common when pasted into
 * Vercel env vars); they are converted to real newlines here.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface AuthContext {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  provider: string;
}

function readPrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
  // Handle multiline keys serialized with escaped newlines (Vercel env vars)
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function getAdminApp(): App | null {
  if (!isAdminConfigured()) return null;

  try {
    if (getApps().length > 0) {
      return getApps()[0];
    }
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: readPrivateKey(),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (err) {
    console.error("[firebase/admin] Failed to initialize Admin SDK:", err);
    return null;
  }
}

/** Firestore instance, or null when Firebase is not configured (legacy fallback). */
export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.error("[firebase/admin] Failed to get Firestore:", err);
    return null;
  }
}

/**
 * Verify a Firebase ID token from an Authorization: Bearer header value.
 * Returns the auth context or null when absent/invalid.
 */
export async function verifyAuthToken(authHeader: string | null): Promise<AuthContext | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const app = getAdminApp();
  if (!app) return null;

  try {
    const { getAuth } = await import("firebase-admin/auth");
    const decoded: DecodedIdToken = await getAuth(app).verifyIdToken(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
      provider:
        decoded.firebase?.sign_in_provider === "google.com"
          ? "google.com"
          : (decoded.firebase?.sign_in_provider ?? "password"),
    };
  } catch (err) {
    console.warn("[firebase/admin] ID token verification failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
