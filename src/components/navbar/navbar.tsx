"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";
import { RanklyLogo } from "@/components/ui/rankly-logo";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works", match: (p: string) => p === "/how-it-works" },
  { href: "/explore", label: "Index", match: (p: string) => p.startsWith("/explore") },
  { href: "/about", label: "About", match: (p: string) => p === "/about" },
];

const MOBILE_EXTRA_LINKS = [
  { href: "/contact", label: "Contact", match: (p: string) => p === "/contact" },
  { href: "/legal", label: "Privacy & Terms", match: (p: string) => p.startsWith("/legal") },
];

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

  // Close the drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#EFEFEA] bg-[#FBFBFA]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(18,18,20,0.04)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="Rankly — home"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <RanklyLogo height={15} priority />
            <span className="sr-only">Rankly</span>
          </Link>
        </div>

        {/* Desktop links with animated active indicator */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-mono text-[#66666E]">
          {NAV_LINKS.map((link) => {
            const active = link.match(pathname || "/");
            return (
              <Link key={link.href} href={link.href} className="group relative py-1">
                <span
                  className={`transition-colors ${
                    active ? "text-[#121214] font-semibold" : "group-hover:text-[#121214]"
                  }`}
                >
                  {link.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 right-0 h-[1.5px] origin-left bg-[#121214] transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => router.push("/")} className="group block relative cursor-pointer">
            <AiAccent variant="border" className="transition-transform group-hover:scale-[1.03]">
              <span className="px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 text-white">
                <span>Analyze website</span>
                <ArrowRight className="h-3 w-3 text-violet-300 transition-transform group-hover:translate-x-0.5" />
              </span>
            </AiAccent>
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-[#121214] hover:text-black transition-colors"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="md:hidden overflow-hidden border-b border-[#EFEFEA] bg-[#FBFBFA]"
          >
            <motion.nav
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
              }}
              className="flex flex-col px-6 py-5 space-y-1 text-sm font-mono text-[#66666E]"
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    closed: { opacity: 0, x: -8 },
                    open: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2 hover:text-[#121214] transition-colors ${
                      link.match(pathname || "/") ? "text-[#121214] font-bold" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {MOBILE_EXTRA_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    closed: { opacity: 0, x: -8 },
                    open: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2 text-xs hover:text-[#121214] transition-colors ${
                      link.match(pathname || "/") ? "text-[#121214] font-bold" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
                className="pt-4 mt-2 border-t border-[#EFEFEA]"
              >
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
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
