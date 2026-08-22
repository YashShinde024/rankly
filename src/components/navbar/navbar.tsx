"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X, FileText, Settings, LogOut, ChevronDown } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";
import { RanklyLogo } from "@/components/ui/rankly-logo";
import { useAuth } from "@/components/auth/auth-provider";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works", match: (p: string) => p === "/how-it-works" },
  { href: "/explore", label: "Rankly Index", match: (p: string) => p.startsWith("/explore") },
  { href: "/about", label: "About", match: (p: string) => p === "/about" },
  { href: "/contact", label: "Contact", match: (p: string) => p === "/contact" },
];

const MOBILE_EXTRA_LINKS = [
  { href: "/legal", label: "Privacy & Terms", match: (p: string) => p.startsWith("/legal") },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOutUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close overlays on navigation (UI reset tied to route changes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close profile menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = (user?.displayName || user?.email || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setMenuOpen(false);
    await signOutUser();
    router.push("/");
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#EFEFEA] bg-[#FBFBFA]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(18,18,20,0.04)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center shrink-0">
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
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-mono text-[#66666E]" aria-label="Primary">
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

        {/* Desktop right cluster */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {authLoading ? (
            <span className="h-7 w-16 rounded-sm bg-[#EFEFEA] animate-pulse" aria-hidden="true" />
          ) : user ? (
            <>
              <Link
                href="/my-reports"
                className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 transition-colors ${
                  pathname.startsWith("/my-reports")
                    ? "text-[#121214] font-semibold"
                    : "text-[#66666E] hover:text-[#121214]"
                }`}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>My Reports</span>
              </Link>

              {/* Profile menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 border border-[#EFEFEA] bg-white pl-1 pr-2 py-1 hover:border-[#D4D4D0] transition-colors cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#121214] text-white text-[10px] font-mono font-semibold">
                      {initials}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3 w-3 text-[#8C8C94] transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-2 w-60 border border-[#EFEFEA] bg-white shadow-[0_12px_40px_-12px_rgba(18,18,20,0.15)] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-[#EFEFEA] min-w-0">
                        <span className="block text-xs font-medium text-[#121214] truncate">
                          {user.displayName || "Rankly user"}
                        </span>
                        <span className="block text-[11px] text-[#8C8C94] truncate">{user.email}</span>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/my-reports"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#66666E] hover:text-[#121214] hover:bg-[#FCFCFB] transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          My Reports
                        </Link>
                        <Link
                          href="/account"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#66666E] hover:text-[#121214] hover:bg-[#FCFCFB] transition-colors"
                        >
                          <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                          Account
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#66666E] hover:text-rose-700 hover:bg-rose-50/60 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs font-mono text-[#66666E] hover:text-[#121214] transition-colors px-1 py-1"
            >
              Sign in
            </Link>
          )}

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
        <div className="flex lg:hidden items-center gap-2">
          {!authLoading && !user && (
            <Link
              href="/login"
              className="text-xs font-mono text-[#66666E] hover:text-[#121214] transition-colors px-1 min-h-[36px] inline-flex items-center"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#121214] hover:text-black transition-colors"
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
            className="lg:hidden overflow-hidden border-b border-[#EFEFEA] bg-[#FBFBFA]"
          >
            <motion.nav
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
              }}
              className="flex flex-col px-5 sm:px-6 py-5 space-y-1 text-sm font-mono text-[#66666E]"
              aria-label="Mobile"
            >
              {user && (
                <motion.div
                  variants={{ closed: { opacity: 0, x: -8 }, open: { opacity: 1, x: 0 } }}
                  className="flex items-center gap-3 pb-3 mb-1 border-b border-[#EFEFEA]"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-full object-cover" />
                  ) : (
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#121214] text-white text-xs font-mono font-semibold">
                      {initials}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-[#121214] truncate">
                      {user.displayName || "Rankly user"}
                    </span>
                    <span className="block text-[11px] text-[#8C8C94] truncate">{user.email}</span>
                  </span>
                </motion.div>
              )}

              {[...NAV_LINKS, ...(user ? [{ href: "/my-reports", label: "My Reports", match: (p: string) => p.startsWith("/my-reports") }] : []), ...MOBILE_EXTRA_LINKS].map(
                (link) => (
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
                      className={`block py-2.5 min-h-[44px] flex items-center hover:text-[#121214] transition-colors ${
                        link.match(pathname || "/") ? "text-[#121214] font-bold" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}

              {user && (
                <motion.div variants={{ closed: { opacity: 0, x: -8 }, open: { opacity: 1, x: 0 } }}>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 min-h-[44px] items-center hover:text-[#121214] transition-colors"
                  >
                    Account
                  </Link>
                </motion.div>
              )}

              <motion.div
                variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
                className="pt-4 mt-2 border-t border-[#EFEFEA] space-y-2.5"
              >
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void handleSignOut();
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 border border-[#D4D4D0] bg-white py-2.5 min-h-[44px] text-xs font-mono text-[#66666E] hover:border-[#B9B9B4] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    Sign out
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/");
                  }}
                  className="w-full"
                >
                  <AiAccent variant="border" className="w-full">
                    <span className="w-full py-2.5 min-h-[44px] text-xs font-medium flex items-center justify-center gap-1.5 text-white">
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
