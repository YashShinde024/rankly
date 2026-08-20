"use client";

import React from "react";

interface AiAccentProps {
  children?: React.ReactNode;
  variant?: "border" | "badge" | "underline" | "indicator" | "edge";
  className?: string;
  intensity?: "subtle" | "normal" | "active";
}

/**
 * AIAccent — The Signature Rankly Gemini-inspired AI Energy component.
 * Used exclusively for AI layers (Analyze CTA, Rankly AI badges, recommendation cards).
 * Measured data remains strictly monochrome.
 */
export function AiAccent({
  children,
  variant = "badge",
  className = "",
  intensity = "normal",
}: AiAccentProps) {
  if (variant === "indicator") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
        </span>
        {children}
      </span>
    );
  }

  if (variant === "edge") {
    return (
      <div className={`relative pl-3 ${className}`}>
        <div className="absolute left-0 top-0 bottom-0 w-[2px] spectrum-border rounded-full opacity-80" />
        {children}
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <span className={`relative inline-block ${className}`}>
        {children}
        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] spectrum-border opacity-70" />
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-violet-200/80 bg-violet-50/50 text-violet-900 font-mono text-[11px] font-semibold tracking-wide ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 animate-pulse" />
        {children || <span>Rankly AI</span>}
      </span>
    );
  }

  // Default: border wrapped container/button
  return (
    <div
      className={`spectrum-border relative p-[1.5px] inline-flex items-center justify-center transition-all ${
        intensity === "active" ? "shadow-sm shadow-violet-500/10" : ""
      } ${className}`}
    >
      <div className="bg-[#121214] text-white w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
