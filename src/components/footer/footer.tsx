import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RanklyLogo } from "@/components/ui/rankly-logo";

const PRODUCT_LINKS = [
  { href: "/", label: "Analyze Website" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/explore", label: "Rankly Index" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/legal?tab=privacy", label: "Privacy" },
  { href: "/legal?tab=terms", label: "Terms" },
];

const NYXEN_PRODUCTS = [
  { href: "https://venzai.tech", label: "Venz AI" },
  { href: "https://nychat.nyxen.in", label: "NyChat" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[#EFEFEA] py-16 text-xs text-[#66666E]">
      {/* Signature AI hairline accent along the top border */}
      <div aria-hidden="true" className="absolute top-[-1px] left-0 right-0 h-px overflow-hidden">
        <div className="h-full w-full spectrum-border-subtle opacity-60" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10">
          {/* Brand & Attribution Column */}
          <div className="col-span-2 space-y-4 pr-6">
            <Link
              href="/"
              aria-label="Rankly — home"
              className="inline-flex hover:opacity-80 transition-opacity"
            >
              <RanklyLogo height={22} />
              <span className="sr-only">Rankly</span>
            </Link>
            <p className="text-xs text-[#66666E] max-w-sm leading-relaxed">
              Rankly helps websites understand how they&apos;re seen across search engines, answer
              engines, and generative AI — with deterministic diagnostics and AI-prioritized fixes.
            </p>
            <p className="text-[11px] text-[#8C8C94] pt-1 leading-relaxed">
              Built by{" "}
              <a
                href="https://yashshinde.is-a.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#121214] hover:underline underline-offset-2"
              >
                Yash Shinde
              </a>
              . A product by{" "}
              <a
                href="https://nyxen.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#121214] hover:underline underline-offset-2"
                aria-label="Nyxen (opens in a new tab)"
              >
                Nyxen
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
              .
            </p>
          </div>

          {/* Product */}
          <FooterColumn title="Product">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="group inline-flex items-center gap-1 hover:text-[#121214] transition-colors">
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#121214] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Nyxen ecosystem */}
          <FooterColumn title="Nyxen Products">
            {NYXEN_PRODUCTS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 hover:text-[#121214] transition-colors"
                  aria-label={`${link.label} by Nyxen (opens in a new tab)`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#121214] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-[#EFEFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#9E9EA4]">
          <span>© 2026 Rankly. An independent product by Nyxen.</span>
          <span className="font-mono hidden sm:inline">Deterministic analysis + AI-assisted interpretation</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block mb-3">
        {title}
      </span>
      <ul className="space-y-2">{children}</ul>
    </nav>
  );
}
