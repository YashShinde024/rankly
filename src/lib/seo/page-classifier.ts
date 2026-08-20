import { ParsedSeoDoc, PageType } from "@/types/audit";

/**
 * Deterministically classifies the analyzed web page based on HTML and schema signals.
 */
export function detectPageType(doc: ParsedSeoDoc, url: string): PageType {
  const lowercaseUrl = url.toLowerCase();
  const schemaTypes = doc.schemaTypes.map((t) => t.toLowerCase());

  // 1. Documentation
  if (
    lowercaseUrl.includes("/docs") ||
    lowercaseUrl.includes("/documentation") ||
    lowercaseUrl.includes("/api-ref") ||
    lowercaseUrl.includes("/guide") ||
    schemaTypes.some((t) => t.includes("techarticle") || t.includes("api"))
  ) {
    return "Documentation";
  }

  // 2. Blog / Article
  if (
    schemaTypes.some((t) => t.includes("article") || t.includes("blogposting") || t.includes("newsarticle")) ||
    lowercaseUrl.includes("/blog") ||
    lowercaseUrl.includes("/post") ||
    lowercaseUrl.includes("/news/") ||
    lowercaseUrl.includes("/article") ||
    doc.hasAuthor
  ) {
    return "Blog / Article";
  }

  // 3. E-commerce
  if (
    schemaTypes.some((t) => t.includes("product") || t.includes("itemavailability") || t.includes("offer")) ||
    lowercaseUrl.includes("/product") ||
    lowercaseUrl.includes("/shop") ||
    lowercaseUrl.includes("/cart") ||
    lowercaseUrl.includes("/store")
  ) {
    return "E-commerce";
  }

  // 4. Product / SaaS
  if (
    schemaTypes.some((t) => t.includes("softwareapplication") || t.includes("webapplication")) ||
    lowercaseUrl.includes("/features") ||
    lowercaseUrl.includes("/pricing") ||
    lowercaseUrl.includes("/integrations")
  ) {
    return "Product / SaaS";
  }

  // 5. Portfolio
  if (
    lowercaseUrl.includes("/portfolio") ||
    lowercaseUrl.includes("/projects") ||
    schemaTypes.some((t) => t.includes("profilepage"))
  ) {
    return "Portfolio";
  }

  // 6. Homepage
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname === "/" || urlObj.pathname === "" || urlObj.pathname === "/home") {
      return "Homepage";
    }
  } catch {
    // If not parseable, continue
  }

  return "Unknown";
}
