import { SeoAuditReport } from "@/types/audit";

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateAuditPdfHtml(report: SeoAuditReport): string {
  const criticalIssues = report.checks.filter((c) => c.status === "error");
  const warningIssues = report.checks.filter((c) => c.status === "warning");
  const passedChecks = report.checks.filter((c) => c.status === "pass");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rankly Search & AI Visibility Intelligence — ${escapeHtml(report.domain)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
        font-size: 8pt;
        color: #8C8C94;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #121214;
      background: #FFFFFF;
      line-height: 1.45;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .print-controls {
      background: #121214;
      color: #FFFFFF;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      font-family: monospace;
    }
    .print-controls button {
      background: #FFFFFF;
      color: #121214;
      border: none;
      padding: 6px 14px;
      font-weight: 600;
      font-size: 8.5pt;
      cursor: pointer;
      border-radius: 2px;
      font-family: inherit;
    }
    .print-controls button:hover {
      background: #EFEFEA;
    }
    @media print {
      .print-controls {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .doc-header {
      border-bottom: 2px solid #121214;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 16pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .brand-sub {
      font-size: 8pt;
      color: #66666E;
      margin-top: 4px;
      font-family: monospace;
    }
    .meta-box {
      font-family: monospace;
      font-size: 8.5pt;
      color: #66666E;
      text-align: right;
      line-height: 1.4;
    }

    .domain-heading {
      font-size: 22pt;
      font-weight: 300;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
      color: #121214;
      line-height: 1.1;
    }
    .page-title {
      font-size: 9.5pt;
      color: #66666E;
      margin-bottom: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Executive Summary Callout */
    .exec-summary-box {
      background: #FBFBFA;
      border-left: 3px solid #121214;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .exec-headline {
      font-weight: 600;
      font-size: 11.5pt;
      color: #121214;
      line-height: 1.3;
    }
    .exec-sub {
      font-size: 8.5pt;
      color: #66666E;
      margin-top: 4px;
    }

    /* 3 Pillars Score Grid */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .pillar-card {
      border: 1px solid #EFEFEA;
      padding: 10px 12px;
      background: #FFFFFF;
    }
    .pillar-title {
      font-family: monospace;
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #66666E;
      font-weight: 700;
    }
    .pillar-score {
      font-family: monospace;
      font-size: 20pt;
      font-weight: 300;
      color: #121214;
      margin: 2px 0;
    }
    .pillar-verdict {
      font-size: 8pt;
      font-weight: 600;
      color: #121214;
    }

    .section-banner {
      font-family: monospace;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #121214;
      margin: 22px 0 10px 0;
      border-bottom: 1px solid #121214;
      padding-bottom: 4px;
      font-weight: 700;
    }

    .snapshot-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 8.5pt;
    }
    .snapshot-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #EFEFEA;
    }
    .snapshot-table tr:nth-child(even) {
      background: #FAFAFA;
    }
    .snapshot-key {
      color: #66666E;
      width: 32%;
    }
    .snapshot-val {
      font-family: monospace;
      color: #121214;
      font-weight: 500;
    }

    /* Findings / Issues */
    .finding-block {
      border: 1px solid #EFEFEA;
      padding: 10px 14px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      background: #FFFFFF;
    }
    .finding-block.critical {
      border-left: 3px solid #DC2626;
    }
    .finding-block.warning {
      border-left: 3px solid #D97706;
    }
    .finding-status-tag {
      font-family: monospace;
      font-size: 7pt;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 2px;
      text-transform: uppercase;
    }
    .tag-critical {
      background: #FEE2E2;
      color: #991B1B;
    }
    .tag-warning {
      background: #FEF3C7;
      color: #92400E;
    }
    .finding-name {
      font-weight: 600;
      font-size: 9pt;
      margin-left: 4px;
    }

    /* Next Steps */
    .step-box {
      border: 1px solid #EFEFEA;
      background: #FCFCFA;
      padding: 8px 12px;
      margin-bottom: 6px;
      font-size: 8.5pt;
    }

    .doc-footer {
      margin-top: 28px;
      border-top: 1px solid #EFEFEA;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      font-family: monospace;
      color: #8C8C94;
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <div>Rankly Intelligence Document · ${escapeHtml(report.domain)}</div>
    <div>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>

  <div class="report-container">
    <!-- Document Header -->
    <div class="doc-header">
      <div>
        <div class="brand-title">rankly</div>
        <div class="brand-sub">Search, AEO & GEO Intelligence Report</div>
      </div>
      <div class="meta-box">
        <div>AUDIT ID: <strong>${escapeHtml(report.id)}</strong></div>
        <div>${escapeHtml(report.formattedDate)}</div>
      </div>
    </div>

    <!-- Domain Title -->
    <h1 class="domain-heading">${escapeHtml(report.domain)}</h1>
    <div class="page-title">${escapeHtml(report.title)}</div>

    <!-- Executive Summary Headline -->
    <div class="exec-summary-box">
      <div class="exec-headline">${escapeHtml(report.executiveSummary.headline)}</div>
      <div class="exec-sub">${escapeHtml(report.executiveSummary.subheadline)}</div>
    </div>

    <!-- 3 Pillars Breakdown -->
    <div class="pillars-grid">
      <div class="pillar-card">
        <div class="pillar-title">Search (SEO)</div>
        <div class="pillar-score">${report.pillars.seo.score}<span style="font-size:10pt; color:#8C8C94;">/100</span></div>
        <div class="pillar-verdict">${escapeHtml(report.pillars.seo.verdict)}</div>
      </div>
      <div class="pillar-card">
        <div class="pillar-title">Answers (AEO)</div>
        <div class="pillar-score">${report.pillars.aeo.score}<span style="font-size:10pt; color:#8C8C94;">/100</span></div>
        <div class="pillar-verdict">${escapeHtml(report.pillars.aeo.verdict)}</div>
      </div>
      <div class="pillar-card">
        <div class="pillar-title">Generative (GEO)</div>
        <div class="pillar-score">${report.pillars.geo.score}<span style="font-size:10pt; color:#8C8C94;">/100</span></div>
        <div class="pillar-verdict">${escapeHtml(report.pillars.geo.verdict)}</div>
      </div>
    </div>

    <!-- Audit Snapshot -->
    <div class="section-banner">Page Health Snapshot</div>
    <table class="snapshot-table">
      <tbody>
        <tr>
          <td class="snapshot-key">Protocol & Status:</td>
          <td class="snapshot-val">${escapeHtml(report.technicalDetails.protocol)} · ${report.technicalDetails.httpStatus} OK</td>
          <td class="snapshot-key">Server TTFB Latency:</td>
          <td class="snapshot-val">${report.technicalDetails.responseTimeMs} ms</td>
        </tr>
        <tr>
          <td class="snapshot-key">Title Length:</td>
          <td class="snapshot-val">${report.snapshot.titleLength} characters</td>
          <td class="snapshot-key">Meta Description:</td>
          <td class="snapshot-val">${report.snapshot.metaDescriptionPresent ? `${report.snapshot.metaDescriptionLength} chars` : "Missing"}</td>
        </tr>
        <tr>
          <td class="snapshot-key">H1 Headings:</td>
          <td class="snapshot-val">${report.snapshot.h1Count} detected</td>
          <td class="snapshot-key">Images & Alt Text:</td>
          <td class="snapshot-val">${report.snapshot.totalImages} images (${report.snapshot.imagesMissingAlt} missing alt)</td>
        </tr>
        <tr>
          <td class="snapshot-key">Internal / Outbound:</td>
          <td class="snapshot-val">${report.snapshot.internalLinksCount} internal / ${report.snapshot.externalLinksCount} outbound</td>
          <td class="snapshot-key">Schema JSON-LD:</td>
          <td class="snapshot-val">${report.snapshot.hasSchemaJsonLd ? `${report.snapshot.schemaTypesCount} schema types` : "None"}</td>
        </tr>
      </tbody>
    </table>

    <!-- Issues Worth Fixing -->
    <div class="section-banner">Priority Findings (${criticalIssues.length + warningIssues.length} Flagged)</div>
    ${[...criticalIssues, ...warningIssues].map((iss) => `
      <div class="finding-block ${iss.status === "error" ? "critical" : "warning"}">
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <div>
            <span class="finding-status-tag ${iss.status === "error" ? "tag-critical" : "tag-warning"}">${iss.status === "error" ? "CRITICAL" : "WARNING"}</span>
            <span class="finding-name">${escapeHtml(iss.title)}</span>
          </div>
          <span style="font-family:monospace; font-size:7pt; color:#8C8C94;">${escapeHtml(iss.area)}</span>
        </div>
        <div style="font-size:8pt; color:#66666E; margin-top:3px;">${escapeHtml(iss.details || iss.description)}</div>
        ${iss.recommendation ? `
          <div style="margin-top:5px; background:#F4F4F2; padding:5px 8px; font-size:7.5pt; font-family:monospace;">
            <strong>Fix:</strong> ${escapeHtml(iss.recommendation)}
          </div>
        ` : ""}
      </div>
    `).join("")}

    <!-- Action Plan: Next 3 Moves -->
    <div class="section-banner">Your Next 3 Moves</div>
    ${report.nextSteps.map((step) => `
      <div class="step-box">
        <strong>Move 0${step.stepNumber} (${escapeHtml(step.area)}):</strong> ${escapeHtml(step.title)}
        <div style="color:#66666E; font-size:7.5pt; margin-top:2px;">${escapeHtml(step.rationale)}</div>
      </div>
    `).join("")}

    <!-- Document Footer -->
    <div class="doc-footer">
      <div>Generated by Rankly (https://rankly.app) · An independent product by Nyxen</div>
      <div>CONFIDENTIAL AUDIT ${escapeHtml(report.id)}</div>
    </div>
  </div>
</body>
</html>`;
}
