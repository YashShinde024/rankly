import { AuditCheck, ParsedSeoDoc } from "@/types/audit";

export function runOnPageChecks(parsedDoc: ParsedSeoDoc): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // 1. Page Title Existence & Length
  if (!parsedDoc.title) {
    checks.push({
      id: "onpage-title",
      category: "onpage",
      title: "Page Title Tag",
      description: "Evaluates title existence and length for search result snippet generation.",
      status: "error",
      severity: "critical",
      value: "Missing",
      expected: "50-60 characters",
      details: "The page has no <title> tag. Search engines rely heavily on the HTML title to understand page topic and generate SERP headlines.",
      recommendation: "Add a descriptive, keyword-rich <title> tag between 50 and 60 characters.",
      impact: "high",
    });
  } else {
    const titleLen = parsedDoc.title.length;
    if (titleLen < 30) {
      checks.push({
        id: "onpage-title",
        category: "onpage",
        title: "Page Title Tag",
        description: "Evaluates title length and completeness.",
        status: "warning",
        severity: "medium",
        value: `${parsedDoc.title} (${titleLen} chars)`,
        expected: "50-60 characters",
        details: `Title is only ${titleLen} characters. It may be too short to adequately describe the page topic.`,
        recommendation: "Expand the title tag to 50-60 characters incorporating primary keywords and branding.",
        codeSnippet: `<title>${parsedDoc.title}</title>`,
        impact: "high",
      });
    } else if (titleLen > 65) {
      checks.push({
        id: "onpage-title",
        category: "onpage",
        title: "Page Title Tag",
        description: "Evaluates title length and truncation risks in search results.",
        status: "warning",
        severity: "low",
        value: `${parsedDoc.title} (${titleLen} chars)`,
        expected: "50-60 characters",
        details: `Title is ${titleLen} characters long and will likely be truncated with ellipsis (...) on desktop and mobile SERPs.`,
        recommendation: "Shorten the title to around 55-60 characters to prevent truncation.",
        codeSnippet: `<title>${parsedDoc.title}</title>`,
        impact: "high",
      });
    } else {
      checks.push({
        id: "onpage-title",
        category: "onpage",
        title: "Page Title Tag",
        description: "Evaluates title length and formatting.",
        status: "pass",
        severity: "info",
        value: `${parsedDoc.title} (${titleLen} chars)`,
        details: `Title length (${titleLen} characters) is in the ideal 50-60 character range.`,
        codeSnippet: `<title>${parsedDoc.title}</title>`,
        impact: "high",
      });
    }
  }

  // 2. Meta Description Existence & Length
  if (!parsedDoc.metaDescription) {
    checks.push({
      id: "onpage-meta-desc",
      category: "onpage",
      title: "Meta Description Tag",
      description: "Evaluates meta description presence and optimal length.",
      status: "error",
      severity: "high",
      value: "Missing",
      expected: "120-160 characters",
      details: "No meta description tag was found. Search engines may generate random snippets from page copy.",
      recommendation: "Add a concise meta description between 120 and 160 characters that summarizes your page proposition.",
      impact: "high",
    });
  } else {
    const descLen = parsedDoc.metaDescription.length;
    if (descLen < 80) {
      checks.push({
        id: "onpage-meta-desc",
        category: "onpage",
        title: "Meta Description Tag",
        description: "Evaluates meta description length.",
        status: "warning",
        severity: "medium",
        value: `${descLen} characters`,
        expected: "120-160 characters",
        details: `Meta description is only ${descLen} characters long. It misses the opportunity to display compelling search snippets.`,
        codeSnippet: `<meta name="description" content="${parsedDoc.metaDescription}" />`,
        recommendation: "Expand the description to 120-160 characters to maximize snippet click-through rates.",
        impact: "high",
      });
    } else if (descLen > 165) {
      checks.push({
        id: "onpage-meta-desc",
        category: "onpage",
        title: "Meta Description Tag",
        description: "Evaluates meta description truncation.",
        status: "warning",
        severity: "low",
        value: `${descLen} characters`,
        expected: "120-160 characters",
        details: `Meta description is ${descLen} characters and may be clipped on search result pages.`,
        codeSnippet: `<meta name="description" content="${parsedDoc.metaDescription}" />`,
        recommendation: "Trim the description to under 160 characters.",
        impact: "high",
      });
    } else {
      checks.push({
        id: "onpage-meta-desc",
        category: "onpage",
        title: "Meta Description Tag",
        description: "Evaluates meta description presence and length.",
        status: "pass",
        severity: "info",
        value: `${descLen} characters`,
        details: `Meta description length (${descLen} characters) is within the optimal 120-160 character window.`,
        codeSnippet: `<meta name="description" content="${parsedDoc.metaDescription}" />`,
        impact: "high",
      });
    }
  }

  // 3. H1 Heading Existence & Single H1 Detection
  const h1Count = parsedDoc.h1s.length;
  if (h1Count === 0) {
    checks.push({
      id: "onpage-h1",
      category: "onpage",
      title: "H1 Primary Heading",
      description: "Verifies the presence of a primary H1 heading on the page.",
      status: "error",
      severity: "high",
      value: "0 H1 headings found",
      expected: "Exactly 1 H1 heading",
      details: "No <h1> heading was found. The H1 heading represents the primary subject of the page for search engines.",
      recommendation: "Add a single <h1> heading clearly stating the main topic or product name.",
      impact: "high",
    });
  } else if (h1Count > 1) {
    checks.push({
      id: "onpage-h1",
      category: "onpage",
      title: "H1 Primary Heading",
      description: "Detects multiple H1 headings that may dilute topical hierarchy.",
      status: "warning",
      severity: "medium",
      value: `${h1Count} H1 headings detected`,
      expected: "Exactly 1 H1 heading",
      details: `Detected ${h1Count} distinct <h1> tags. Using a single H1 clarifies primary topical focus.`,
      recommendation: "Consolidate into 1 primary <h1> and use <h2>/<h3> tags for secondary sections.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "onpage-h1",
      category: "onpage",
      title: "H1 Primary Heading",
      description: "Verifies clean single H1 heading structure.",
      status: "pass",
      severity: "info",
      value: `1 H1: "${parsedDoc.h1s[0]}"`,
      codeSnippet: `<h1>${parsedDoc.h1s[0]}</h1>`,
      details: "Single <h1> heading properly implemented.",
      impact: "high",
    });
  }

  // 4. Heading Hierarchy (Skipped levels)
  let hasSkippedLevel = false;
  const headings = parsedDoc.allHeadingsInOrder;
  for (let i = 0; i < headings.length - 1; i++) {
    const currentLevel = parseInt(headings[i].tag.replace("h", ""), 10);
    const nextLevel = parseInt(headings[i + 1].tag.replace("h", ""), 10);
    if (nextLevel > currentLevel + 1) {
      hasSkippedLevel = true;
      break;
    }
  }

  if (headings.length === 0) {
    checks.push({
      id: "onpage-hierarchy",
      category: "onpage",
      title: "Heading Hierarchy",
      description: "Evaluates semantic nesting of headings (H1-H6).",
      status: "warning",
      severity: "low",
      value: "No headings found",
      details: "No heading tags (H1-H6) were found on the page.",
      recommendation: "Structure page content using semantic H1, H2, and H3 tags.",
      impact: "medium",
    });
  } else if (hasSkippedLevel) {
    checks.push({
      id: "onpage-hierarchy",
      category: "onpage",
      title: "Heading Hierarchy",
      description: "Evaluates semantic nesting of headings (H1-H6).",
      status: "warning",
      severity: "low",
      value: "Skipped heading levels detected",
      details: "Headings skip structural levels (for example H1 directly to H3 without an intervening H2).",
      recommendation: "Follow sequential heading hierarchy (H1 → H2 → H3) for accessibility and crawl structure.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "onpage-hierarchy",
      category: "onpage",
      title: "Heading Hierarchy",
      description: "Evaluates semantic nesting of headings (H1-H6).",
      status: "pass",
      severity: "info",
      value: `Semantic hierarchy valid (${headings.length} total headings)`,
      details: "Headings follow a clean, accessible nesting order without skipped levels.",
      impact: "medium",
    });
  }

  // 5. Images and Alt Attributes
  const totalImages = parsedDoc.images.length;
  const missingAltImages = parsedDoc.images.filter((img) => !img.hasAlt);
  if (totalImages === 0) {
    checks.push({
      id: "onpage-images-alt",
      category: "onpage",
      title: "Image Alt Attributes",
      description: "Checks image tags for descriptive alt attributes.",
      status: "pass",
      severity: "info",
      value: "0 images found",
      details: "No image tags detected on the audited page.",
      impact: "medium",
    });
  } else if (missingAltImages.length > 0) {
    checks.push({
      id: "onpage-images-alt",
      category: "onpage",
      title: "Image Alt Attributes",
      description: "Checks image tags for descriptive alt attributes for accessibility and image search.",
      status: "warning",
      severity: "medium",
      value: `${missingAltImages.length} of ${totalImages} images missing alt text`,
      expected: "100% of images with descriptive alt text",
      details: `${missingAltImages.length} image elements lack descriptive alt attributes. This hampers accessibility (WCAG) and Google Image search visibility.`,
      recommendation: "Add descriptive alt attributes to all <img> tags.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "onpage-images-alt",
      category: "onpage",
      title: "Image Alt Attributes",
      description: "Checks image tags for descriptive alt attributes.",
      status: "pass",
      severity: "info",
      value: `All ${totalImages} images contain alt attributes`,
      details: "All detected images include descriptive alt attributes.",
      impact: "medium",
    });
  }

  // 6. Links: Internal, External, Empty Links
  const totalInternal = parsedDoc.internalLinks.length;
  const emptyLinks = parsedDoc.internalLinks.filter((l) => l.isEmpty);

  if (emptyLinks.length > 0) {
    checks.push({
      id: "onpage-links-empty",
      category: "onpage",
      title: "Empty Anchor Links",
      description: "Detects anchor tags with no descriptive anchor text or nested image alt labels.",
      status: "warning",
      severity: "low",
      value: `${emptyLinks.length} empty links detected`,
      details: "Found anchor tags without readable text. Screen readers and search engines cannot determine the link context.",
      recommendation: "Provide descriptive text or aria-labels for all clickable anchor tags.",
      impact: "low",
    });
  } else {
    checks.push({
      id: "onpage-links-empty",
      category: "onpage",
      title: "Empty Anchor Links",
      description: "Detects anchor tags with no descriptive anchor text.",
      status: "pass",
      severity: "info",
      value: `All ${totalInternal} internal links have descriptive text`,
      details: "No empty anchor elements detected.",
      impact: "low",
    });
  }

  return checks;
}
