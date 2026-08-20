import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/audit/route";
import { NextRequest } from "next/server";

describe("POST /api/audit Integration Test", () => {
  it("rejects invalid request body with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("rejects SSRF targets with 400 or 422", async () => {
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "http://127.0.0.1:8080" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("INVALID_URL");
    expect(data.message).toBeDefined();
  });
});
