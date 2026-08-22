import * as cheerio from "cheerio";
import { HeadingItem, ParsedSeoDoc } from "@/types/audit";

export function parseHtml(html: string, baseUrl: string): ParsedSeoDoc {
  const $ = cheerio.load(html);

  // 1. Basic Metadata
  const title = $("title").first().text().trim() || undefined;
  const metaDescription =
    $('meta[name="description" i]').attr("content")?.trim() ||
    $('meta[property="og:description" i]').attr("content")?.trim() ||
    undefined;

  // 2. Canonical & Viewport
  let canonicalUrl = $('link[rel="canonical" i]').attr("href")?.trim() || undefined;
  if (canonicalUrl) {
    try {
      canonicalUrl = new URL(canonicalUrl, baseUrl).href;
    } catch {
      // keep as is if malformed
    }
  }

  const viewport = $('meta[name="viewport" i]').attr("content")?.trim() || undefined;
  const robotsMeta = $('meta[name="robots" i]').attr("content")?.trim() || undefined;
  const lang = $("html").attr("lang")?.trim() || undefined;

  // 3. Headings & Heading Hierarchy Tree
  const h1s: string[] = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1s.push(text);
  });

  const h2s: string[] = [];
  $("h2").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });

  const h3s: string[] = [];
  $("h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3s.push(text);
  });

  const h4s: string[] = [];
  $("h4").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h4s.push(text);
  });

  const h5s: string[] = [];
  $("h5").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h5s.push(text);
  });

  const h6s: string[] = [];
  $("h6").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h6s.push(text);
  });

  const allHeadingsInOrder: { tag: string; text: string }[] = [];
  const headingTree: HeadingItem[] = [];

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tag = (el.tagName ? el.tagName.toLowerCase() : "h2") as HeadingItem["tag"];
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) {
      allHeadingsInOrder.push({ tag, text });
      const level = parseInt(tag.replace("h", ""), 10) || 2;
      headingTree.push({ tag, text, level });
    }
  });

  // Count question-oriented headings (AEO readiness)
  const questionPattern = /^(how|what|why|when|where|who|can|is|are|does|which|should|will)\b|\?$/i;
  const questionHeadingsCount = allHeadingsInOrder.filter((h) => questionPattern.test(h.text)).length;

  // 4. Images & Alt Attributes
  const images: { src?: string; alt?: string; hasAlt: boolean }[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src")?.trim();
    const alt = $(el).attr("alt");
    const hasAlt = typeof alt === "string" && alt.trim().length > 0;
    images.push({
      src,
      alt: alt?.trim(),
      hasAlt,
    });
  });

  // 5. Internal and External Links
  let baseHostname = "";
  try {
    baseHostname = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    baseHostname = "";
  }

  const internalLinks: { href: string; text: string; isEmpty: boolean }[] = [];
  const externalLinks: { href: string; text: string; rel?: string; target?: string }[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    const text = $(el).text().trim();
    const rel = $(el).attr("rel")?.trim();
    const target = $(el).attr("target")?.trim();

    if (!href || href.startsWith("javascript:") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) {
      return;
    }

    const isEmpty = text.length === 0 && $(el).find("img[alt]").length === 0;

    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname.toLowerCase() === baseHostname || !resolved.hostname) {
        internalLinks.push({ href: resolved.href, text, isEmpty });
      } else {
        externalLinks.push({ href: resolved.href, text, rel, target });
      }
    } catch {
      // Relative link fallback
      if (href.startsWith("/")) {
        internalLinks.push({ href, text, isEmpty });
      }
    }
  });

  // 6. Social Meta Tags
  const ogTitle = $('meta[property="og:title" i]').attr("content")?.trim() || undefined;
  const ogDescription = $('meta[property="og:description" i]').attr("content")?.trim() || undefined;
  const ogImage = $('meta[property="og:image" i]').attr("content")?.trim() || undefined;
  const ogUrl = $('meta[property="og:url" i]').attr("content")?.trim() || undefined;

  const twitterCard =
    $('meta[name="twitter:card" i]').attr("content")?.trim() ||
    $('meta[property="twitter:card" i]').attr("content")?.trim() ||
    undefined;
  const twitterTitle =
    $('meta[name="twitter:title" i]').attr("content")?.trim() ||
    $('meta[property="twitter:title" i]').attr("content")?.trim() ||
    undefined;
  const twitterDescription =
    $('meta[name="twitter:description" i]').attr("content")?.trim() ||
    $('meta[property="twitter:description" i]').attr("content")?.trim() ||
    undefined;
  const twitterImage =
    $('meta[name="twitter:image" i]').attr("content")?.trim() ||
    $('meta[property="twitter:image" i]').attr("content")?.trim() ||
    undefined;

  // 7. Schema.org JSON-LD Blocks & Schema Types
  const jsonLdBlocks: Record<string, unknown>[] = [];
  const schemaTypes: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html()?.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        jsonLdBlocks.push(parsed);

        const extractType = (obj: Record<string, unknown>) => {
          if (!obj) return;
          if (obj["@type"]) {
            if (Array.isArray(obj["@type"])) {
              schemaTypes.push(...(obj["@type"] as string[]));
            } else {
              schemaTypes.push(obj["@type"] as string);
            }
          }
          if (Array.isArray(obj["@graph"])) {
            (obj["@graph"] as Record<string, unknown>[]).forEach(extractType);
          }
        };
        extractType(parsed);
      } catch {
        // invalid JSON-LD
      }
    }
  });

  const faqDetected =
    schemaTypes.some((t) => /faq/i.test(t)) ||
    $("details, .faq, #faq, [class*='faq' i], [id*='faq' i]").length > 0;

  const hasAuthor =
    schemaTypes.some((t) => /person|author|organization/i.test(t)) ||
    $('meta[name="author" i]').length > 0 ||
    $("[rel='author']").length > 0 ||
    $("[class*='author' i]").length > 0;

  // 8. Favicon
  const faviconUrl =
    $('link[rel="icon" i]').attr("href")?.trim() ||
    $('link[rel="shortcut icon" i]').attr("href")?.trim() ||
    $('link[rel="apple-touch-icon" i]').attr("href")?.trim() ||
    undefined;

  // 9. Content Depth & Word Count
  $("script, style, noscript, nav, header, footer, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const rawTextLength = bodyText.length;
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  return {
    title,
    metaDescription,
    canonicalUrl,
    viewport,
    robotsMeta,
    h1s,
    h2s,
    h3s,
    h4s,
    h5s,
    h6s,
    allHeadingsInOrder,
    headingTree,
    images,
    internalLinks,
    externalLinks,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLdBlocks,
    schemaTypes: Array.from(new Set(schemaTypes)),
    faviconUrl,
    lang,
    wordCount,
    rawTextLength,
    questionHeadingsCount,
    faqDetected,
    hasAuthor,
  };
}
