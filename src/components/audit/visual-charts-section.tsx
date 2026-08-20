import React from "react";
import { SeoAuditReport } from "@/types/audit";

interface VisualChartsSectionProps {
  report: SeoAuditReport;
}

export function VisualChartsSection({ report }: VisualChartsSectionProps) {
  const { visibilityRadar, summary, categories, snapshot } = report;

  // SVG Radar calculations (center at 100,100, radius 70)
  const axes = [
    { label: "Technical", value: visibilityRadar.technical, angle: 0 },
    { label: "On-Page", value: visibilityRadar.onpage, angle: 60 },
    { label: "Content", value: visibilityRadar.content, angle: 120 },
    { label: "Social", value: visibilityRadar.social, angle: 180 },
    { label: "AEO", value: visibilityRadar.aeo, angle: 240 },
    { label: "GEO", value: visibilityRadar.geo, angle: 300 },
  ];

  const getCoordinates = (value: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (value / 100) * 70;
    const x = 100 + r * Math.cos(angleRad);
    const y = 100 + r * Math.sin(angleRad);
    return { x, y };
  };

  const radarPolygonPoints = axes
    .map((a) => {
      const { x, y } = getCoordinates(a.value, a.angle);
      return `${x},${y}`;
    })
    .join(" ");

  const totalFindings = summary.passedCount + summary.warningCount + summary.criticalCount || 1;
  const passPct = (summary.passedCount / totalFindings) * 100;
  const warnPct = (summary.warningCount / totalFindings) * 100;
  const critPct = (summary.criticalCount / totalFindings) * 100;

  return (
    <section id="charts" className="border-b border-[#EFEFEA] pb-16 space-y-8">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          Diagnostic Visualizations
        </span>
        <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
          Measured visibility & structural breakdown.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: SVG Visibility Radar */}
        <div className="border border-[#EFEFEA] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#66666E] font-semibold">
              Visibility Radar
            </span>
            <span className="font-mono text-[10px] text-[#8C8C94]">6 Axes</span>
          </div>

          <div className="flex justify-center py-2">
            <svg viewBox="0 0 200 200" className="w-44 h-44 overflow-visible">
              {/* Web Rings */}
              {[25, 50, 75, 100].map((ring) => (
                <circle
                  key={ring}
                  cx="100"
                  cy="100"
                  r={(ring / 100) * 70}
                  fill="none"
                  stroke="#EFEFEA"
                  strokeWidth="1"
                />
              ))}

              {/* Axes Lines */}
              {axes.map((a, i) => {
                const { x, y } = getCoordinates(100, a.angle);
                return (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={x}
                    y2={y}
                    stroke="#EFEFEA"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Polygon */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(37, 99, 235, 0.12)"
                stroke="#2563EB"
                strokeWidth="1.5"
              />

              {/* Data Points */}
              {axes.map((a, i) => {
                const { x, y } = getCoordinates(a.value, a.angle);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="#121214"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-center text-[#66666E]">
            <div>SEO: <strong className="text-[#121214]">{report.pillars.seo.score}</strong></div>
            <div>AEO: <strong className="text-[#121214]">{visibilityRadar.aeo}</strong></div>
            <div>GEO: <strong className="text-[#121214]">{visibilityRadar.geo}</strong></div>
          </div>
        </div>

        {/* Chart 2: Findings Distribution */}
        <div className="border border-[#EFEFEA] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#66666E] font-semibold">
              Findings Distribution
            </span>
            <span className="font-mono text-[10px] text-[#8C8C94]">{summary.totalChecks} Total</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Distribution Bar */}
            <div className="h-4 w-full bg-[#F4F4F2] flex overflow-hidden">
              <div style={{ width: `${passPct}%` }} className="bg-emerald-600" title={`Passed: ${summary.passedCount}`} />
              <div style={{ width: `${warnPct}%` }} className="bg-amber-500" title={`Warnings: ${summary.warningCount}`} />
              <div style={{ width: `${critPct}%` }} className="bg-rose-600" title={`Critical: ${summary.criticalCount}`} />
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">Passed Checks:</span>
                <span className="font-semibold text-[#121214]">{summary.passedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-medium">Warnings:</span>
                <span className="font-semibold text-[#121214]">{summary.warningCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-700 font-medium">Critical Errors:</span>
                <span className="font-semibold text-[#121214]">{summary.criticalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Category Comparison Bars */}
        <div className="border border-[#EFEFEA] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#66666E] font-semibold">
              Category Scores
            </span>
            <span className="font-mono text-[10px] text-[#8C8C94]">Measured</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {Object.values(categories).slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66666E] truncate max-w-[140px]">{cat.name}</span>
                  <span className="font-semibold text-[#121214]">{cat.score}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F4F2] overflow-hidden">
                  <div
                    className={`h-full ${
                      cat.score >= 85 ? "bg-emerald-600" : cat.score >= 70 ? "bg-amber-500" : "bg-rose-600"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Heading Structure Hierarchy */}
        <div className="border border-[#EFEFEA] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#66666E] font-semibold">
              Page Structure
            </span>
            <span className="font-mono text-[10px] text-[#8C8C94]">Headings</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono pt-1">
            <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-1.5">
              <span className="text-[#66666E]">H1 Primary:</span>
              <span className={`font-semibold ${snapshot.headingCounts.h1 === 1 ? "text-emerald-700" : "text-amber-700"}`}>
                {snapshot.headingCounts.h1} tag
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-1.5">
              <span className="text-[#66666E]">H2 Sections:</span>
              <span className="font-semibold text-[#121214]">{snapshot.headingCounts.h2} tags</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-1.5">
              <span className="text-[#66666E]">H3 Sub-sections:</span>
              <span className="font-semibold text-[#121214]">{snapshot.headingCounts.h3} tags</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#EFEFEA] pb-1.5">
              <span className="text-[#66666E]">H4 Topics:</span>
              <span className="font-semibold text-[#121214]">{snapshot.headingCounts.h4} tags</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
