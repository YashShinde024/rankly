"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "border-b border-[#EFEFEA] bg-[#FBFBFA]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Brand: rankly */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-[#121214] hover:opacity-80 transition-opacity font-sans"
          >
            rankly
          </Link>
        </div>

        {/* Navigation Links: How it works | Index | About */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-[#66666E]">
          <Link
            href="/how-it-works"
            className={`transition-colors py-1 hover:text-[#121214] ${
              pathname === "/how-it-works" ? "text-[#121214] font-semibold border-b border-[#121214]" : ""
            }`}
          >
            How it works
          </Link>
          <Link
            href="/explore"
            className={`transition-colors py-1 hover:text-[#121214] ${
              pathname?.startsWith("/explore") ? "text-[#121214] font-semibold border-b border-[#121214]" : ""
            }`}
          >
            Index
          </Link>
          <Link
            href="/about"
            className={`transition-colors py-1 hover:text-[#121214] ${
              pathname === "/about" ? "text-[#121214] font-semibold border-b border-[#121214]" : ""
            }`}
          >
            About
          </Link>
        </nav>

        {/* Primary CTA: Analyze website */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="group block relative cursor-pointer"
          >
            <AiAccent variant="border" className="transition-transform group-hover:scale-[1.02]">
              <span className="px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 text-white">
                <span>Analyze website</span>
                <ArrowRight className="h-3 w-3 text-violet-300 transition-transform group-hover:translate-x-0.5" />
              </span>
            </AiAccent>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-[#121214] hover:text-black"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#EFEFEA] bg-[#FBFBFA] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-mono text-[#66666E]">
            <Link
              href="/how-it-works"
              onClick={() => setMobileOpen(false)}
              className={`py-1 hover:text-[#121214] ${pathname === "/how-it-works" ? "text-[#121214] font-bold" : ""}`}
            >
              How it works
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileOpen(false)}
              className={`py-1 hover:text-[#121214] ${pathname?.startsWith("/explore") ? "text-[#121214] font-bold" : ""}`}
            >
              Index
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={`py-1 hover:text-[#121214] ${pathname === "/about" ? "text-[#121214] font-bold" : ""}`}
            >
              About
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#EFEFEA]">
            <button
              onClick={() => {
                setMobileOpen(false);
                router.push("/");
              }}
              className="w-full"
            >
              <AiAccent variant="border" className="w-full">
                <span className="w-full py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 text-white">
                  <span>Analyze website</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </AiAccent>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
