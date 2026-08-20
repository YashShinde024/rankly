import { describe, it, expect } from "vitest";
import { isIpSafe, validateAndNormalizeUrl } from "../src/lib/security/ssrf";

describe("SSRF & URL Security Tests", () => {
  it("accepts valid public HTTP/HTTPS URLs", () => {
    const res = validateAndNormalizeUrl("https://example.com");
    expect(res.isValid).toBe(true);
    expect(res.domain).toBe("example.com");
    expect(res.normalizedUrl).toBe("https://example.com/");
  });

  it("prepends https protocol if missing", () => {
    const res = validateAndNormalizeUrl("linear.app");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://linear.app/");
  });

  it("blocks localhost and localdomain", () => {
    expect(validateAndNormalizeUrl("http://localhost:3000").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://localhost.localdomain").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://app.local").isValid).toBe(false);
  });

  it("blocks loopback IPv4 (127.0.0.1)", () => {
    expect(validateAndNormalizeUrl("http://127.0.0.1").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://127.8.9.1:8080").isValid).toBe(false);
    expect(isIpSafe("127.0.0.1")).toBe(false);
  });

  it("blocks private IPv4 ranges (10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12)", () => {
    expect(validateAndNormalizeUrl("http://10.0.0.1").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://192.168.1.1").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://172.16.0.1").isValid).toBe(false);
    expect(validateAndNormalizeUrl("http://172.31.255.255").isValid).toBe(false);
  });

  it("blocks AWS/GCP cloud metadata IP (169.254.169.254)", () => {
    expect(validateAndNormalizeUrl("http://169.254.169.254/latest/meta-data/").isValid).toBe(false);
    expect(isIpSafe("169.254.169.254")).toBe(false);
  });

  it("blocks IPv6 loopback (::1)", () => {
    expect(validateAndNormalizeUrl("http://[::1]").isValid).toBe(false);
    expect(isIpSafe("::1")).toBe(false);
  });

  it("rejects non-http protocols", () => {
    expect(validateAndNormalizeUrl("ftp://files.example.com").isValid).toBe(false);
    expect(validateAndNormalizeUrl("file:///etc/passwd").isValid).toBe(false);
    expect(validateAndNormalizeUrl("javascript:alert(1)").isValid).toBe(false);
  });
});
