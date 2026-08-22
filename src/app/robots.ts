import type { MetadataRoute } from "next";

/**
 * Allow public marketing/informational pages; keep ephemeral app surfaces
 * (onboarding modal state, API routes) out of crawlers. Audit report pages
 * (/audit/[id], /explore/[auditId]) remain indexable when discovered via
 * shared links — they carry unique per-domain content — but are excluded
 * from the sitemap to avoid thin-content scaling.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/onboarding"],
      },
    ],
    sitemap: "https://rankly.nyxen.in/sitemap.xml",
  };
}
