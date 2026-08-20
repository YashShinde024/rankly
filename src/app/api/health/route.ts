import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "Rankly SEO Intelligence API",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      checks: {
        ssrfProtection: "active",
        deterministicEngine: "active",
        aiLayer: process.env.GEMINI_API_KEY ? "gemini-enabled" : "deterministic-fallback",
      },
    },
    { status: 200 }
  );
}
