import React from "react";
import { SeoAuditReport } from "@/types/audit";

interface SnapshotSectionProps {
  snapshot: SeoAuditReport["snapshot"];
}

export function PageSnapshotSection({ snapshot }: SnapshotSectionProps) {
  return (
    <section id="snapshot" className="space-y-6 border-b border-[#EFEFEA] pb-16">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
          Page Health Snapshot
        </span>
        <h3 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] mt-1">
          Directly extracted website properties.
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Title Tag</span>
          <span className="text-[#121214] font-medium block truncate mt-1">
            {snapshot.title}
          </span>
          <span className="text-[#8C8C94] text-[11px]">{snapshot.titleLength} characters</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Meta Description</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.metaDescriptionPresent ? "Present" : "Missing"}
          </span>
          <span className="text-[#8C8C94] text-[11px]">{snapshot.metaDescriptionLength} characters</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">H1 Primary Heading</span>
          <span className="text-[#121214] font-medium block truncate mt-1">
            {snapshot.h1Text || "None detected"}
          </span>
          <span className="text-[#8C8C94] text-[11px]">{snapshot.h1Count} H1 tag{snapshot.h1Count === 1 ? "" : "s"}</span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Images & Alt</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.totalImages} total images
          </span>
          <span className={snapshot.imagesMissingAlt > 0 ? "text-amber-700 text-[11px]" : "text-emerald-700 text-[11px]"}>
            {snapshot.imagesMissingAlt} missing alt text
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Internal Crawlable Links</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.internalLinksCount} internal links
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">External Outbound</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.externalLinksCount} outbound links
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Schema.org Structured Data</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.hasSchemaJsonLd ? `${snapshot.schemaTypesCount} schema types detected` : "None detected"}
          </span>
          <span className="text-[#8C8C94] text-[11px] truncate block">
            {snapshot.schemaTypes.length > 0 ? snapshot.schemaTypes.join(", ") : "Standard HTML"}
          </span>
        </div>

        <div className="border-b border-[#EFEFEA] pb-2">
          <span className="text-[#66666E] block text-[10px] uppercase">Content Volume</span>
          <span className="text-[#121214] font-medium block mt-1">
            {snapshot.wordCount} words
          </span>
        </div>
      </div>
    </section>
  );
}
