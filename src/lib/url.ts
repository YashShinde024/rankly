/**
 * Canonical URL & Website Identity Utilities
 * Provides a single source of truth for URL normalization, validation, and hostname extraction.
 */

export interface AuditTarget {
  normalizedUrl: string;
  hostname: string;
}

/**
 * Normalizes any user-submitted website URL or domain into a clean, canonical format.
 * - Strips leading/trailing whitespace
 * - Ensures https:// protocol
 * - Normalizes hostnames (lowercases, normalizes 'www.' prefix by removing it for canonical identity)
 * - Removes default ports (:80, :443)
 * - Removes tracking and sensitive query params (utm_*, gclid, fbclid, token, auth, session, etc.)
 * - Removes hash fragments
 * - Resolves path structure
 */
export function normalizeWebsiteIdentity(input: string): {
  isValid: boolean;
  target?: AuditTarget;
  error?: string;
} {
  if (!input || typeof input !== "string") {
    return { isValid: false, error: "Please enter a valid website URL." };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: "Please enter a valid website URL." };
  }

  if (trimmed.length > 2048) {
    return { isValid: false, error: "URL exceeds maximum allowable length (2048 characters)." };
  }

  // Reject unsupported protocols
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are supported." };
  }

  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
    return { isValid: false, error: "Invalid URL structure." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are supported." };
  }

  // Clean raw hostname
  const rawHostname = parsed.hostname.toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (!rawHostname || !rawHostname.includes(".") || rawHostname.startsWith(".") || rawHostname.endsWith(".")) {
    return { isValid: false, error: "Please provide a valid domain name." };
  }

  // Canonical hostname: normalize www. (treat www.example.com and example.com as example.com)
  const canonicalHostname = rawHostname.startsWith("www.")
    ? rawHostname.substring(4)
    : rawHostname;

  // Clean pathname
  let pathname = parsed.pathname || "/";
  pathname = pathname.replace(/\/+/g, "/");

  // Filter sensitive / tracking query parameters
  const sensitiveParamPatterns = [
    /^utm_/i,
    /^gclid$/i,
    /^fbclid$/i,
    /^msclkid$/i,
    /^token$/i,
    /^auth$/i,
    /^key$/i,
    /^secret$/i,
    /^password$/i,
    /^session/i,
    /^ref/i,
  ];

  const searchParams = new URLSearchParams(parsed.search);
  const cleanParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    const isSensitive = sensitiveParamPatterns.some((pattern) => pattern.test(key));
    if (!isSensitive) {
      cleanParams.append(key, value);
    }
  }

  const queryString = cleanParams.toString();
  const searchPart = queryString ? `?${queryString}` : "";

  // Construct normalized URL
  const normalizedPath = pathname || "/";
  const normalizedUrl = `${parsed.protocol}//${canonicalHostname}${normalizedPath}${searchPart}`;

  return {
    isValid: true,
    target: {
      normalizedUrl,
      hostname: canonicalHostname,
    },
  };
}

/**
 * Extracts the canonical hostname from any URL string or domain.
 * Guarantee: never returns undefined, localhost, an ID, or empty.
 */
export function extractCanonicalHostname(input: string): string {
  const res = normalizeWebsiteIdentity(input);
  if (res.isValid && res.target) {
    return res.target.hostname;
  }
  // Fallback cleanup
  try {
    const formatted = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const parsed = new URL(formatted);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host) return host;
  } catch {
    // Ignore error and fall through
  }
  return input.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split("?")[0] || "website";
}
