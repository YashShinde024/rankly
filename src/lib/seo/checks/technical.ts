import { AuditCheck, AuxiliaryFetchResult, ParsedSeoDoc, RawFetchResult } from "@/types/audit";

export function runTechnicalChecks(
  fetchResult: RawFetchResult,
  parsedDoc: ParsedSeoDoc,
  robotsTxt: AuxiliaryFetchResult,
  sitemapXml: AuxiliaryFetchResult
): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // 1. HTTPS Check
  if (fetchResult.isHttps) {
    checks.push({
      id: "tech-https",
      category: "technical",
      title: "HTTPS & SSL Encryption",
      description: "Verifies whether the website enforces valid SSL/TLS encryption for search security and user privacy.",
      status: "pass",
      severity: "info",
      value: "Enabled (HTTPS)",
      details: `Website is served over HTTPS protocol. Response status: ${fetchResult.status}.`,
      impact: "high",
    });
  } else {
    checks.push({
      id: "tech-https",
      category: "technical",
      title: "HTTPS & SSL Encryption",
      description: "Verifies whether the website enforces valid SSL/TLS encryption.",
      status: "error",
      severity: "critical",
      value: "Insecure (HTTP)",
      details: "The website is loaded over insecure HTTP. Search engines treat HTTPS as a core ranking signal and flag insecure sites in browser address bars.",
      recommendation: "Install an SSL/TLS certificate and configure an automatic 301 redirect from HTTP to HTTPS.",
      impact: "high",
    });
  }

  // 2. HTTP Status Code
  if (fetchResult.status === 200) {
    checks.push({
      id: "tech-status",
      category: "technical",
      title: "HTTP Status Code",
      description: "Ensures the server responds with a healthy 200 OK status without errors.",
      status: "pass",
      severity: "info",
      value: `200 OK (${fetchResult.responseTimeMs}ms)`,
      details: `Page returned HTTP 200 OK with a response latency of ${fetchResult.responseTimeMs}ms.`,
      impact: "high",
    });
  } else if (fetchResult.status >= 300 && fetchResult.status < 400) {
    checks.push({
      id: "tech-status",
      category: "technical",
      title: "HTTP Status Code",
      description: "Checks for unnecessary redirect status codes on the target URL.",
      status: "warning",
      severity: "medium",
      value: `HTTP ${fetchResult.status}`,
      details: `Target URL returned redirect status ${fetchResult.status}. Multiple redirects increase crawl latency.`,
      recommendation: "Point direct links to the final canonical destination URL.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "tech-status",
      category: "technical",
      title: "HTTP Status Code",
      description: "Checks if the server responds with a successful status code.",
      status: "error",
      severity: "critical",
      value: `HTTP ${fetchResult.status}`,
      details: `Server returned an error status (${fetchResult.status} ${fetchResult.statusText}).`,
      recommendation: "Fix server configuration errors so the page returns a clean 200 OK status.",
      impact: "high",
    });
  }

  // 3. Canonical Tag
  if (parsedDoc.canonicalUrl) {
    checks.push({
      id: "tech-canonical",
      category: "technical",
      title: "Canonical Link Tag",
      description: "Verifies the canonical URL to prevent duplicate content indexing penalties.",
      status: "pass",
      severity: "info",
      value: parsedDoc.canonicalUrl,
      codeSnippet: `<link rel="canonical" href="${parsedDoc.canonicalUrl}" />`,
      details: "A valid canonical link tag is present in the HTML head.",
      impact: "high",
    });
  } else {
    checks.push({
      id: "tech-canonical",
      category: "technical",
      title: "Canonical Link Tag",
      description: "Verifies the canonical URL to prevent duplicate content indexing penalties.",
      status: "warning",
      severity: "medium",
      value: "Missing",
      expected: `<link rel="canonical" href="${fetchResult.url}" />`,
      details: "No rel='canonical' tag found. Search engines may index duplicate variations (e.g. trailing slashes, query parameters).",
      recommendation: `Add a canonical tag to the <head>: <link rel="canonical" href="${fetchResult.finalUrl}" />`,
      impact: "high",
    });
  }

  // 4. Viewport Meta Tag
  if (parsedDoc.viewport) {
    const isResponsive = parsedDoc.viewport.includes("width=device-width");
    checks.push({
      id: "tech-viewport",
      category: "technical",
      title: "Mobile Viewport Configuration",
      description: "Confirms responsive viewport configuration for mobile search bots and mobile-first indexing.",
      status: isResponsive ? "pass" : "warning",
      severity: isResponsive ? "info" : "high",
      value: parsedDoc.viewport,
      codeSnippet: `<meta name="viewport" content="${parsedDoc.viewport}" />`,
      details: isResponsive
        ? "Mobile viewport tag is properly configured with width=device-width."
        : "Viewport tag is present but missing standard width=device-width parameter.",
      recommendation: isResponsive
        ? undefined
        : 'Update viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      impact: "high",
    });
  } else {
    checks.push({
      id: "tech-viewport",
      category: "technical",
      title: "Mobile Viewport Configuration",
      description: "Confirms responsive viewport configuration for mobile search bots.",
      status: "error",
      severity: "high",
      value: "Missing",
      expected: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      details: "Page lacks a viewport meta tag, causing mobile search engines to render the page with desktop scaling.",
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0" /> to your <head>.',
      impact: "high",
    });
  }

  // 5. Indexability / Robots Directives
  const robotsMeta = parsedDoc.robotsMeta?.toLowerCase() || "";
  const isNoindex = robotsMeta.includes("noindex");
  if (isNoindex) {
    checks.push({
      id: "tech-indexability",
      category: "technical",
      title: "Indexability Directives",
      description: "Verifies if the page explicitly permits search engines to index its content.",
      status: "error",
      severity: "critical",
      value: `Blocked: ${parsedDoc.robotsMeta}`,
      codeSnippet: `<meta name="robots" content="${parsedDoc.robotsMeta}" />`,
      details: "A 'noindex' directive was detected. This prevents Google and search engines from indexing this page in search results.",
      recommendation: "Remove the 'noindex' directive from your robots meta tag or HTTP response headers if this page should rank.",
      impact: "high",
    });
  } else {
    checks.push({
      id: "tech-indexability",
      category: "technical",
      title: "Indexability Directives",
      description: "Verifies if the page explicitly permits search engines to index its content.",
      status: "pass",
      severity: "info",
      value: parsedDoc.robotsMeta ? `Allowed (${parsedDoc.robotsMeta})` : "Allowed (Implicit index, follow)",
      details: "No restrictive noindex tags were found. Search engine crawlers can index this page.",
      impact: "high",
    });
  }

  // 6. robots.txt Availability
  if (robotsTxt.exists) {
    checks.push({
      id: "tech-robots",
      category: "technical",
      title: "robots.txt Configuration",
      description: "Checks if a valid robots.txt file exists to guide search engine crawlers.",
      status: "pass",
      severity: "info",
      value: "Accessible (HTTP 200)",
      codeSnippet: robotsTxt.content.slice(0, 150),
      details: "Accessible robots.txt found at standard location.",
      impact: "high",
    });
  } else {
    checks.push({
      id: "tech-robots",
      category: "technical",
      title: "robots.txt Configuration",
      description: "Checks if a valid robots.txt file exists to guide search engine crawlers.",
      status: "warning",
      severity: "low",
      value: "Not detected or unreachable",
      details: "robots.txt was not found at standard /robots.txt path. While not strictly fatal, having one helps manage crawler crawl budgets.",
      recommendation: "Create a robots.txt file at the root of your domain specifying sitemap location and crawl directives.",
      impact: "medium",
    });
  }

  // 7. Sitemap.xml Availability
  if (sitemapXml.exists) {
    checks.push({
      id: "tech-sitemap",
      category: "technical",
      title: "XML Sitemap",
      description: "Detects accessible XML sitemap for efficient search engine URL discovery.",
      status: "pass",
      severity: "info",
      value: "Accessible (HTTP 200)",
      details: "XML Sitemap located and reachable at standard /sitemap.xml path.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "tech-sitemap",
      category: "technical",
      title: "XML Sitemap",
      description: "Detects accessible XML sitemap for search engine URL discovery.",
      status: "warning",
      severity: "medium",
      value: "Not found at /sitemap.xml",
      details: "No XML sitemap responded at /sitemap.xml. Sitemaps allow crawlers to discover all your indexable URLs quickly.",
      recommendation: "Generate an XML sitemap and reference it in your robots.txt or submit it in Google Search Console.",
      impact: "medium",
    });
  }

  return checks;
}
