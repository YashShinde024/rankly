import { AuditCheck, ParsedSeoDoc } from "@/types/audit";

export function runSocialChecks(parsedDoc: ParsedSeoDoc): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // 1. Open Graph Title
  if (parsedDoc.ogTitle) {
    checks.push({
      id: "social-og-title",
      category: "social",
      title: "Open Graph Title",
      description: "Checks og:title metadata for social sharing cards on platforms like LinkedIn, Slack, and Facebook.",
      status: "pass",
      severity: "info",
      value: parsedDoc.ogTitle,
      codeSnippet: `<meta property="og:title" content="${parsedDoc.ogTitle}" />`,
      details: "Open Graph title tag is properly declared.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "social-og-title",
      category: "social",
      title: "Open Graph Title",
      description: "Checks og:title metadata for social card sharing.",
      status: "warning",
      severity: "medium",
      value: "Missing",
      details: "No og:title meta tag found. Social platforms may default to using standard HTML titles or fallback text.",
      recommendation: 'Add <meta property="og:title" content="Your Page Title" /> to the <head>.',
      impact: "medium",
    });
  }

  // 2. Open Graph Description
  if (parsedDoc.ogDescription) {
    checks.push({
      id: "social-og-desc",
      category: "social",
      title: "Open Graph Description",
      description: "Checks og:description metadata for rich previews.",
      status: "pass",
      severity: "info",
      value: `${parsedDoc.ogDescription.slice(0, 60)}...`,
      codeSnippet: `<meta property="og:description" content="${parsedDoc.ogDescription}" />`,
      details: "Open Graph description is configured.",
      impact: "medium",
    });
  } else {
    checks.push({
      id: "social-og-desc",
      category: "social",
      title: "Open Graph Description",
      description: "Checks og:description metadata for rich social previews.",
      status: "warning",
      severity: "low",
      value: "Missing",
      details: "No og:description tag detected.",
      recommendation: 'Add <meta property="og:description" content="Your description" />.',
      impact: "medium",
    });
  }

  // 3. Open Graph Image
  if (parsedDoc.ogImage) {
    checks.push({
      id: "social-og-image",
      category: "social",
      title: "Open Graph Image",
      description: "Checks og:image for visually compelling social share cards.",
      status: "pass",
      severity: "info",
      value: parsedDoc.ogImage,
      codeSnippet: `<meta property="og:image" content="${parsedDoc.ogImage}" />`,
      details: "Open Graph image tag declared.",
      impact: "high",
    });
  } else {
    checks.push({
      id: "social-og-image",
      category: "social",
      title: "Open Graph Image",
      description: "Checks og:image for visually compelling social share cards.",
      status: "warning",
      severity: "medium",
      value: "Missing",
      details: "No og:image tag found. Social networks will not display a preview thumbnail when your link is shared.",
      recommendation: "Provide a 1200x630px high-resolution banner via og:image.",
      impact: "high",
    });
  }

  // 4. Twitter / X Card
  if (parsedDoc.twitterCard) {
    checks.push({
      id: "social-twitter-card",
      category: "social",
      title: "Twitter/X Card Configuration",
      description: "Checks twitter:card meta tag for timeline presentation.",
      status: "pass",
      severity: "info",
      value: parsedDoc.twitterCard,
      codeSnippet: `<meta name="twitter:card" content="${parsedDoc.twitterCard}" />`,
      details: `Twitter card set to "${parsedDoc.twitterCard}".`,
      impact: "medium",
    });
  } else {
    checks.push({
      id: "social-twitter-card",
      category: "social",
      title: "Twitter/X Card Configuration",
      description: "Checks twitter:card meta tag for timeline presentation.",
      status: "warning",
      severity: "low",
      value: "Missing",
      details: "No twitter:card tag found. Twitter/X defaults to small summary cards unless summary_large_image is defined.",
      recommendation: 'Add <meta name="twitter:card" content="summary_large_image" />.',
      impact: "medium",
    });
  }

  return checks;
}
