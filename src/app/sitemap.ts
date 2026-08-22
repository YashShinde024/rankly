import type { MetadataRoute } from "next";
import { auditStore } from "@/lib/store/audit-store";

const SITE_URL = "https://rankly.nyxen.in";

/**
 * Static marketing/informational pages + the demo report.
 *
 * Public audit reports (/audit/[id]) are intentionally NOT listed here:
 * they are ephemeral (30-day retention), risk thin/duplicate content at
 * scale, and their canonical value is marginal. Individual report pages
 * remain indexable when discovered organically (e.g., shared links) but
 * are excluded from the sitemap to keep it lean and evergreen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/legal?tab=privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/legal?tab=terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
