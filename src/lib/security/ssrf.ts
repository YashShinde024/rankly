import net from "net";

/**
 * Validates a user-supplied URL and verifies it does NOT point to internal IP ranges,
 * localhost, cloud metadata services, private networks, or unsupported protocols.
 */
export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  domain?: string;
  error?: string;
}

// Blocked private IPv4 address blocks
const PRIVATE_IPV4_RANGES = [
  /^127\./,                         // Loopback 127.0.0.0/8
  /^10\./,                          // Private 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private 172.16.0.0/12
  /^192\.168\./,                    // Private 192.168.0.0/16
  /^169\.254\./,                    // Link-local / Cloud metadata 169.254.0.0/16
  /^0\./,                           // Zero addresses 0.0.0.0/8
  /^224\./,                         // Multicast
  /^240\./,                         // Reserved
];

// Blocked exact hostnames and internal patterns
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "local",
  "broadcasthost",
  "ip6-localhost",
  "ip6-loopback",
  "instance-data",
  "metadata.google.internal",
  "metadata",
]);

import { normalizeWebsiteIdentity } from "@/lib/url";

/**
 * Normalizes and checks if a URL string is safe to crawl.
 */
export function validateAndNormalizeUrl(input: string): UrlValidationResult {
  const norm = normalizeWebsiteIdentity(input);
  if (!norm.isValid || !norm.target) {
    return { isValid: false, error: norm.error || "Please enter a valid website URL." };
  }

  const cleanHost = norm.target.hostname;

  // Reject blocked hostnames
  if (BLOCKED_HOSTNAMES.has(cleanHost) || cleanHost.endsWith(".local") || cleanHost.endsWith(".internal")) {
    return { isValid: false, error: "Access to local, internal, or loopback hostnames is prohibited." };
  }

  // Check if hostname is an IP address
  const ipType = net.isIP(cleanHost);
  if (ipType === 4) {
    for (const regex of PRIVATE_IPV4_RANGES) {
      if (regex.test(cleanHost)) {
        return { isValid: false, error: "Access to private, loopback, or metadata IP ranges is prohibited." };
      }
    }
  } else if (ipType === 6 || cleanHost.includes(":")) {
    // IPv6 checks (loopback ::1, link-local fe80::, unique local fc00::/fd00::, mapped IPv4)
    if (
      cleanHost === "::1" ||
      cleanHost === "::" ||
      cleanHost.startsWith("fe80:") ||
      cleanHost.startsWith("fc") ||
      cleanHost.startsWith("fd") ||
      cleanHost.includes("127.0.0.1") ||
      cleanHost.endsWith("::1")
    ) {
      return { isValid: false, error: "Access to IPv6 loopback, link-local, or private addresses is prohibited." };
    }
  }

  return {
    isValid: true,
    normalizedUrl: norm.target.normalizedUrl,
    domain: cleanHost,
  };
}

/**
 * Checks if a target IP / hostname is safe before performing fetch requests.
 */
export function isIpSafe(ipOrHost: string): boolean {
  const cleanHost = ipOrHost.toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(cleanHost)) return false;

  const ipType = net.isIP(cleanHost);
  if (ipType === 4) {
    for (const regex of PRIVATE_IPV4_RANGES) {
      if (regex.test(cleanHost)) return false;
    }
  } else if (ipType === 6 || cleanHost.includes(":")) {
    if (
      cleanHost === "::1" ||
      cleanHost === "::" ||
      cleanHost.startsWith("fe80:") ||
      cleanHost.startsWith("fc") ||
      cleanHost.startsWith("fd") ||
      cleanHost.includes("127.0.0.1") ||
      cleanHost.endsWith("::1")
    ) {
      return false;
    }
  }

  return true;
}
