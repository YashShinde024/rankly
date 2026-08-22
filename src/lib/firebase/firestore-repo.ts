import "server-only";

/**
 * Firestore-backed audit repository (authoritative production store).
 *
 * Collections:
 *   audits/{auditId}      — full report + index card, visibility, ownership
 *   domains/{hostname}    — 7-day public cooldown source of truth
 *   guests/{guestId}      — guest free-audit consumption
 *   users/{uid}           — profiles
 *
 * When Firebase is not configured (local dev without env vars), callers fall
 * back to the legacy persistence engine so nothing breaks.
 */

import { getAdminDb } from "./admin";
import { extractCanonicalHostname } from "@/lib/url";
import { ExploreAuditRecord, SeoAuditReport } from "@/types/audit";
import { DEMO_AUDIT } from "@/lib/demo-data";

export const DOMAIN_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const AUDIT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PUBLIC_AUDITS = 500;

export type AuditVisibility = "public" | "private";

/** Guest reports expire 7 days after creation (see TTL note in FIREBASE-SETUP.md). */
export const GUEST_REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuditIndexCard {
  hostname: string;
  pageTitle: string;
}

export interface AuditDoc {
  auditId: string;
  auditCode: string; // RKL-XXXXXX
  hostname: string;
  canonicalUrl: string | null;
  pageTitle: string;

  scores: {
    overall: number;
    seo: number;
    aeo: number;
    geo: number;
  };

  reportData: SeoAuditReport;
  card: AuditIndexCard;

  createdAt: FirebaseFirestore.FieldValue; // serverTimestamp sentinel on write
  updatedAt: FirebaseFirestore.FieldValue;
  nextAllowedAt: Date;

  userId: string | null;
  guestId?: string | null;

  visibility: AuditVisibility;
  analysisType: string; // goals: all|seo|aeo|geo
  websiteType: string;

  /** Guest-only hard expiration timestamp. */
  expiresAt?: Date | null;
}

/** Normalize an incoming id to the canonical RKL-XXXXXX document key. */
export function normalizeFirestoreAuditId(idOrDomain: string): string {
  const clean = decodeURIComponent(idOrDomain).trim();
  if (/^rkl-/i.test(clean)) return clean.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `RKL-${clean.toUpperCase()}`;
  return clean.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Audits                                                             */
/* ------------------------------------------------------------------ */

function toCard(report: SeoAuditReport): AuditIndexCard {
  return {
    hostname: extractCanonicalHostname(report.domain),
    pageTitle: report.title || `${report.domain} — Visibility Intelligence`,
  };
}

export async function saveAuditToFirestore(
  report: SeoAuditReport,
  opts: {
    userId: string | null;
    guestId?: string | null;
    visibility: AuditVisibility;
    websiteType: string;
    analysisType: string;
  }
): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error("FIREBASE_NOT_CONFIGURED");

  const now = new Date();
  const docRef = db.collection("audits").doc(report.id);

  await docRef.set({
    auditId: report.id,
    auditCode: report.id,
    hostname: extractCanonicalHostname(report.domain),
    canonicalUrl: report.url ?? null,
    pageTitle: report.title ?? "",
    scores: {
      overall: report.overallScore,
      seo: report.pillars.seo.score,
      aeo: report.pillars.aeo.score,
      geo: report.pillars.geo.score,
    },
    reportData: JSON.parse(JSON.stringify(report)), // strip undefined for Firestore
    card: toCard(report),
    createdAt: now,
    updatedAt: now,
    nextAllowedAt: new Date(now.getTime() + DOMAIN_COOLDOWN_MS),
    userId: opts.userId,
    guestId: opts.guestId ?? null,
    visibility: opts.visibility,
    analysisType: opts.analysisType,
    websiteType: opts.websiteType,

    // Guest reports are temporary: hard expiration is enforced at read time,
    // while physical deletion is handled asynchronously by a Firestore TTL
    // policy on this field (see FIREBASE-SETUP.md).
    ...(opts.userId
      ? {}
      : { expiresAt: new Date(now.getTime() + GUEST_REPORT_TTL_MS), retention: "guest-7d" }),
  });
}

export async function getAuditFromFirestore(
  idOrDomain: string
): Promise<{ report: SeoAuditReport; userId: string | null; visibility: AuditVisibility } | null> {
  const db = getAdminDb();
  if (!db) return null;

  if (idOrDomain.toLowerCase() === "demo") {
    return { report: DEMO_AUDIT, userId: null, visibility: "public" };
  }

  const auditId = normalizeFirestoreAuditId(idOrDomain);
  let snap = await db.collection("audits").doc(auditId).get();

  // Fall back to hostname lookup (legacy URLs may use a bare domain)
  if (!snap.exists) {
    const hostname = extractCanonicalHostname(idOrDomain);
    if (hostname && hostname.includes(".")) {
      const byDomain = await db
        .collection("audits")
        .where("hostname", "==", hostname)
        .limit(5)
        .get();
      if (!byDomain.empty) {
        // Pick the most recent of the matches (no composite index needed).
        let best = byDomain.docs[0];
        for (const d of byDomain.docs) {
          if ((d.data().createdAt?.toMillis?.() ?? 0) > (best.data().createdAt?.toMillis?.() ?? 0)) {
            best = d;
          }
        }
        snap = best;
      }
    }
  }

  if (!snap.exists) return null;

  const data = snap.data() as Partial<AuditDoc> & { reportData?: SeoAuditReport };
  if (!data.reportData) return null;

  // Guest reports hard-expire after 7 days — unavailable even before the
  // asynchronous TTL policy physically removes the document.
  const expiresMs = data.expiresAt instanceof Date ? data.expiresAt.getTime() : (data.expiresAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? null;
  if (!data.userId && expiresMs && expiresMs < Date.now()) {
    return null;
  }

  return {
    report: data.reportData,
    userId: data.userId ?? null,
    visibility: data.visibility === "private" ? "private" : "public",
  };
}

/** Recent public audits for the Rankly Index. */
export async function getPublicRecentAudits(limit = 50): Promise<ExploreAuditRecord[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    // Fetch newest-first then filter in-process — avoids a composite index.
    const snapshot = await db
      .collection("audits")
      .orderBy("createdAt", "desc")
      .limit(MAX_PUBLIC_AUDITS)
      .get();

    const cutoff = Date.now() - AUDIT_TTL_MS;
    const records: ExploreAuditRecord[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.visibility !== "public") return;
      const createdAtMs = data.createdAt?.toMillis?.() ?? 0;
      if (createdAtMs < cutoff) return;
      // Skip expired guest reports
      const expiresMs = data.expiresAt?.toMillis?.() ?? null;
      if (!data.userId && expiresMs && expiresMs < Date.now()) return;
      records.push({
        id: data.auditId ?? doc.id,
        domain: data.hostname ?? "",
        overallScore: data.scores?.overall ?? 0,
        scoreInterpretation:
          data.reportData?.scoreInterpretation ??
          (data.scores?.overall >= 80
            ? "Strong"
            : data.scores?.overall >= 60
              ? "Moderate"
              : "Needs work"),
        pillars: {
          seo: data.scores?.seo ?? 0,
          aeo: data.scores?.aeo ?? 0,
          geo: data.scores?.geo ?? 0,
        },
        categories: {
          technical: data.reportData?.categories?.technical?.score ?? 0,
          onpage: data.reportData?.categories?.onpage?.score ?? 0,
          content: data.reportData?.categories?.content?.score ?? 0,
          social: data.reportData?.categories?.social?.score ?? 0,
        },
        timestamp: createdAtMs,
        timeAgo: "just now",
      });
    });

    return records.slice(0, limit);
  } catch (err) {
    console.error("[firebase/audits] getPublicRecentAudits failed:", err);
    return [];
  }
}

/** All audits owned by a user (for My Audits). */
export async function getUserAudits(uid: string): Promise<
  Array<{
    auditId: string;
    hostname: string;
    pageTitle: string;
    scores: AuditDoc["scores"];
    createdAtMs: number;
  }>
> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    // Single-field filter (no composite index required); sorted in-process.
    const snapshot = await db.collection("audits").where("userId", "==", uid).limit(200).get();

    const out: Array<{
      auditId: string;
      hostname: string;
      pageTitle: string;
      scores: AuditDoc["scores"];
      createdAtMs: number;
    }> = [];

    snapshot.forEach((doc) => {
      const d = doc.data();
      out.push({
        auditId: d.auditId ?? doc.id,
        hostname: d.hostname ?? d.card?.hostname ?? "",
        pageTitle: d.card?.pageTitle ?? d.pageTitle ?? "",
        scores: {
          overall: d.scores?.overall ?? 0,
          seo: d.scores?.seo ?? 0,
          aeo: d.scores?.aeo ?? 0,
          geo: d.scores?.geo ?? 0,
        },
        createdAtMs: d.createdAt?.toMillis?.() ?? 0,
      });
    });

    out.sort((a, b) => b.createdAtMs - a.createdAtMs);
    return out.slice(0, 100);
  } catch (err) {
    console.error("[firebase/audits] getUserAudits failed:", err);
    throw err;
  }
}

/** Link guest-created audits to a newly authenticated user (cookie-verified). */
export async function linkGuestAudits(guestId: string, uid: string): Promise<number> {
  const db = getAdminDb();
  if (!db) return 0;

  const snapshot = await db.collection("audits").where("guestId", "==", guestId).get();
  if (snapshot.empty) return 0;

  let linked = 0;
  const batch = db.batch();
  snapshot.forEach((doc) => {
    batch.update(doc.ref, { userId: uid, guestId: null, updatedAt: new Date() });
    linked++;
  });
  await batch.commit();
  return linked;
}

/* ------------------------------------------------------------------ */
/*  Domain cooldown                                                    */
/* ------------------------------------------------------------------ */

export interface DomainCooldownInfo {
  latestAuditId: string | null;
  lastAuditAtMs: number;
  nextAllowedAtMs: number;
}

export async function getDomainCooldown(hostname: string): Promise<DomainCooldownInfo | null> {
  const db = getAdminDb();
  if (!db) return null;
  const canonical = extractCanonicalHostname(hostname);
  if (!canonical) return null;

  const snap = await db.collection("domains").doc(canonical).get();
  if (!snap.exists) return null;

  const d = snap.data();
  const lastAuditAtMs = d?.lastAuditAt?.toMillis?.() ?? 0;
  return {
    latestAuditId: d?.latestAuditId ?? null,
    lastAuditAtMs,
    nextAllowedAtMs: d?.nextAllowedAt?.toMillis?.() ?? lastAuditAtMs + DOMAIN_COOLDOWN_MS,
  };
}

export async function recordDomainAuditInFirestore(
  hostname: string,
  auditId: string,
  when: Date
): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error("FIREBASE_NOT_CONFIGURED");
  const canonical = extractCanonicalHostname(hostname);
  await db
    .collection("domains")
    .doc(canonical)
    .set(
      {
        hostname: canonical,
        latestAuditId: auditId,
        lastAuditAt: when,
        nextAllowedAt: new Date(when.getTime() + DOMAIN_COOLDOWN_MS),
      },
      { merge: true }
    );
}

/* ------------------------------------------------------------------ */
/*  Guests                                                             */
/* ------------------------------------------------------------------ */

export async function isGuestAuditUsed(guestId: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;
  const snap = await db.collection("guests").doc(guestId).get();
  return Boolean(snap.exists && snap.data()?.auditUsed);
}

export async function markGuestAuditUsed(
  guestId: string,
  auditId: string,
  uidIfLinked: string | null
): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error("FIREBASE_NOT_CONFIGURED");
  await db
    .collection("guests")
    .doc(guestId)
    .set(
      {
        auditUsed: true,
        auditId,
        userId: uidIfLinked,
        updatedAt: new Date(),
      },
      { merge: true }
    );
}

/* ------------------------------------------------------------------ */
/*  Users                                                              */
/* ------------------------------------------------------------------ */

export async function ensureUserProfile(
  profile: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    provider: string;
  },
  opts?: { nickname?: string; markLogin?: boolean }
): Promise<void> {
  const db = getAdminDb();
  if (!db) return;
  const ref = db.collection("users").doc(profile.uid);
  const snap = await ref.get();
  const now = new Date();
  const nickname = opts?.nickname?.trim() || null;

  if (!snap.exists) {
    await ref.set({
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      provider: profile.provider,
      nickname,
      plan: "free",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
  } else {
    const patch: Record<string, unknown> = { updatedAt: now };
    if (profile.displayName) patch.displayName = profile.displayName;
    if (profile.photoURL) patch.photoURL = profile.photoURL;
    if (nickname) patch.nickname = nickname;
    if (opts?.markLogin) patch.lastLoginAt = now;
    await ref.set(patch, { merge: true });
  }
}
