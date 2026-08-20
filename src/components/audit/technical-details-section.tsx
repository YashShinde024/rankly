import React from "react";
import { SeoAuditReport } from "@/types/audit";

interface TechnicalDetailsProps {
  technical: SeoAuditReport["technicalDetails"];
}

export function TechnicalDetailsSection({ technical }: TechnicalDetailsProps) {
  return (
    <section id="technical-details" className="space-y-6 pb-12">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          Server & Crawler Directives
        </span>
        <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
          Technical infrastructure & headers.
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-mono">
        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">Protocol & Encryption</span>
          <span className="text-[#121214] font-medium block mt-1">{technical.protocol}</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">HTTP Status Code</span>
          <span className="text-emerald-700 font-medium block mt-1">{technical.httpStatus} OK</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">Server Response Time</span>
          <span className="text-[#121214] font-medium block mt-1">{technical.responseTimeMs} ms TTFB</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">Content Type</span>
          <span className="text-[#121214] font-medium block mt-1 truncate">{technical.contentType}</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">HTML Payload Size</span>
          <span className="text-[#121214] font-medium block mt-1">
            {(technical.contentLengthBytes / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">Redirect Hops</span>
          <span className="text-[#121214] font-medium block mt-1">{technical.redirectCount} redirects</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">Canonical URL</span>
          <span className="text-[#121214] font-medium block mt-1 truncate">
            {technical.canonicalUrl || "None declared"}
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">robots.txt Status</span>
          <span className="text-[#121214] font-medium block mt-1">{technical.robotsTxtStatus}</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-3">
          <span className="text-[#66666E] block text-[10px] uppercase">XML Sitemap</span>
          <span className="text-[#121214] font-medium block mt-1">{technical.sitemapStatus}</span>
        </div>
      </div>
    </section>
  );
}
