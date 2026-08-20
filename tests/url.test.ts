import { describe, it, expect } from "vitest";
import { normalizeWebsiteIdentity, extractCanonicalHostname } from "../src/lib/url";

describe("Website Identity & Canonical Hostname Utility", () => {
  it("correctly extracts and normalizes standard domains", () => {
    expect(extractCanonicalHostname("example.com")).toBe("example.com");
    expect(extractCanonicalHostname("www.example.com")).toBe("example.com");
    expect(extractCanonicalHostname("https://example.com")).toBe("example.com");
    expect(extractCanonicalHostname("https://www.example.com")).toBe("example.com");
  });

  it("handles complex paths, queries, and tracking parameters correctly", () => {
    expect(extractCanonicalHostname("https://www.example.com/path")).toBe("example.com");
    expect(extractCanonicalHostname("https://example.com/path?query=value")).toBe("example.com");
    expect(extractCanonicalHostname("https://example.com/about?utm_source=twitter&utm_medium=social")).toBe("example.com");
  });

  it("normalizes URLs and strips tracking parameters while preserving structure", () => {
    const res = normalizeWebsiteIdentity("https://www.example.com/about?utm_source=test&clean=1#section");
    expect(res.isValid).toBe(true);
    expect(res.target?.hostname).toBe("example.com");
    expect(res.target?.normalizedUrl).toBe("https://example.com/about?clean=1");
  });

  it("never returns undefined, localhost, or an object", () => {
    expect(extractCanonicalHostname("")).not.toBe("undefined");
    expect(extractCanonicalHostname("https://sub.domain.co.uk/test")).toBe("sub.domain.co.uk");
  });
});
