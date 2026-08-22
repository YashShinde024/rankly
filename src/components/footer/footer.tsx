import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RanklyLogo } from "@/components/ui/rankly-logo";
import {
  NYXEN_SOCIALS,
  NYXEN_SUPPORT_URL,
  HeartSupportIcon,
} from "@/components/ui/social-icons";

const PRODUCT_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/explore", label: "Rankly Index" },
  { href: "/", label: "Analyze website" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/legal?tab=privacy", label: "Privacy" },
  { href: "/legal?tab=terms", label: "Terms" },
];

const NYXEN_PRODUCTS = [
  { href: "https://venzai.tech", label: "Venz AI", external: true },
  { href: "https://nychat.nyxen.in", label: "NyChat", external: true },
];

const SUPPORT_LINKS = [
  { href: "/contact?category=feedback", label: "Help & Feedback" },
  { href: "/contact?category=issue", label: "Report an issue" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[#EFEFEA] text-xs text-[#66666E]">
      {/* Signature spectral hairline along the top border */}
      <div aria-hidden="true" className="absolute top-[-1px] left-0 right-0 h-px overflow-hidden">
        <div className="h-full w-full spectrum-line opacity-60" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Rankly block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 max-w-md">
            <Link
              href="/"
              aria-label="Rankly — home"
              className="inline-flex hover:opacity-80 transition-opacity"
            >
              <RanklyLogo height={22} />
              <span className="sr-only">Rankly</span>
            </Link>
            <p className="text-xs leading-relaxed">
              Website intelligence for the AI search era. Rankly audits how your site is
              structured, understood, and discovered across SEO, answer engines, and generative AI.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              {NYXEN_SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-[#EFEFEA] bg-white text-[#8C8C94] hover:text-[#121214] hover:border-[#D4D4D0] transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nyxen block */}
          <div className="lg:justify-self-end lg:text-right space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#121214] block">
              Nyxen
            </span>
            <p className="text-xs leading-relaxed max-w-sm lg:max-w-xs lg:ml-auto">
              Rankly is designed and maintained by{" "}
              <a
                href="https://nyxen.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#121214] underline underline-offset-2 hover:decoration-violet-600"
              >
                nyxen.in
              </a>{" "}
              — an independent product studio building focused tools for the modern web.
            </p>
          </div>
        </div>

        <div className="h-px bg-[#EFEFEA]" role="presentation" />

        {/* Link columns */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10"
        >
          <FooterColumn title="Products">
            <li className="pt-0.5">
              <span className="font-medium text-[#121214]">Rankly</span>
              <span className="block text-[11px] text-[#9E9EA4] mt-0.5">You are here</span>
            </li>
            {NYXEN_PRODUCTS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href} label={link.label} />
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Product">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#121214] transition-colors min-h-[32px] inline-flex items-center">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#121214] transition-colors min-h-[32px] inline-flex items-center">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Support">
            <li>
              <a
                href={NYXEN_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 hover:text-[#121214] transition-colors min-h-[32px] items-center"
                aria-label="Support Rankly (opens in a new tab)"
              >
                <HeartSupportIcon className="h-3.5 w-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                <span>Support Rankly</span>
              </a>
            </li>
            {SUPPORT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#121214] transition-colors min-h-[32px] inline-flex items-center">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </nav>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#EFEFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#9E9EA4]">
          <span>© 2026 Rankly. An independent product by Nyxen.</span>
          <span className="font-mono hidden sm:inline">Deterministic analysis · AI-assisted interpretation</span>
        </div>
      </div>
    </footer>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 hover:text-[#121214] transition-colors min-h-[32px] items-center"
      aria-label={`${label} by Nyxen (opens in a new tab)`}
    >
      <span>{label}</span>
      <ArrowUpRight
        className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block mb-3">
        {title}
      </span>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}
