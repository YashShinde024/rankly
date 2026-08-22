import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CATEGORIES = ["feedback", "issue", "idea", "general"] as const;
type Category = (typeof CATEGORIES)[number];

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  category?: unknown;
  company?: unknown; // honeypot
}

// Lightweight per-instance rate limit: 5 messages / IP / hour
const ipHits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    ipHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return true;
}

function extractIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  // 1. Rate limit
  if (!checkRate(extractIp(req))) {
    return NextResponse.json(
      { success: false, error: "RATE_LIMITED", message: "Too many messages sent recently. Please try again later." },
      { status: 429 }
    );
  }

  // 2. Parse & validate
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_JSON", message: "Malformed request." },
      { status: 400 }
    );
  }

  // Honeypot: silently accept bot submissions without delivering
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const category = CATEGORIES.includes(body.category as Category) ? (body.category as Category) : "general";

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80) fieldErrors.name = "Please enter your name (2–80 characters).";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Please enter a valid email address.";
  if (subject.length > 120) fieldErrors.subject = "Subject must be under 120 characters.";
  if (message.length < 10 || message.length > 2000)
    fieldErrors.message = "Message must be between 10 and 2000 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_FAILED", fieldErrors },
      { status: 400 }
    );
  }

  const record = {
    name,
    email,
    subject: subject || `(No subject) — ${category}`,
    category,
    message,
    receivedAt: new Date().toISOString(),
  };

  // 3. Delivery: Resend email when configured…
  const resendKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_EMAIL_TO;

  if (resendKey && contactTo) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_EMAIL_FROM || "Rankly Contact <onboarding@resend.dev>",
          to: [contactTo],
          reply_to: email,
          subject: `[Rankly · ${category}] ${record.subject}`,
          text: `From: ${name} <${email}>\nCategory: ${category}\n\n${message}`,
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      console.error("[POST /api/contact] Email delivery failed:", err);
      // Fall through to durable archive so the message is never lost
    }
  }

  // 4. …otherwise archive durably to Vercel Blob (reviewable, never lost).
  try {
    const { put } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "DELIVERY_UNAVAILABLE",
          message:
            "The contact inbox isn't configured right now. Please reach us at nyxen.in meanwhile.",
        },
        { status: 503 }
      );
    }
    const filename = `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.json`;
    await put(filename, JSON.stringify(record), { access: "public", token });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/contact] Blob archive failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "DELIVERY_FAILED",
        message: "Your message couldn't be delivered right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}
