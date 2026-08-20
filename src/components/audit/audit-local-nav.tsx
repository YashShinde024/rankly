"use client";

import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "executive-summary", label: "Executive Summary" },
  { id: "charts", label: "Visual Profile" },
  { id: "aeo-geo", label: "AEO / GEO Diagnostics" },
  { id: "snapshot", label: "Page Snapshot" },
  { id: "findings", label: "Findings" },
  { id: "ai-recommendations", label: "AI Interpretation" },
  { id: "next-steps", label: "Next Moves" },
  { id: "technical-details", label: "Server Directives" },
];

export function AuditLocalNav() {
  const [activeSection, setActiveSection] = useState<string>("executive-summary");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.offsetTop - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="sticky top-14 z-40 w-full border-b border-[#EFEFEA] bg-[#FBFBFA]/95 backdrop-blur-sm"
      aria-label="Audit report sections"
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-mono no-scrollbar">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeSection === sec.id
                ? "text-[#121214] font-semibold border-b-2 border-[#121214]"
                : "text-[#66666E] hover:text-[#121214]"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
