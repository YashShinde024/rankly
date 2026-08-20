import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#EFEFEA] py-16 text-xs text-[#66666E]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand & Attribution Column */}
          <div className="sm:col-span-2 space-y-2">
            <Link href="/" className="font-semibold text-sm text-[#121214]">
              rankly
            </Link>
            <p className="text-xs text-[#66666E] max-w-sm leading-relaxed">
              AI-powered website SEO intelligence for people who build websites.
            </p>
            <p className="text-[11px] text-[#8C8C94] pt-1">
              Built by{" "}
              <a
                href="https://yashshinde.is-a.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#121214] hover:underline underline-offset-2"
              >
                Yash Shinde
              </a>{" "}
              from{" "}
              <a
                href="https://nyxen.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#121214] hover:underline underline-offset-2"
              >
                Nyxen
              </a>
              .
            </p>
          </div>

          {/* Product Links */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block mb-3">
              Product
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#121214] transition-colors">
                  Analyze website
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#121214] transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/audit/demo" className="hover:text-[#121214] transition-colors">
                  Sample report
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block mb-3">
              Company
            </span>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://nyxen.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#121214] transition-colors inline-flex items-center gap-1"
                >
                  <span>Nyxen</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#121214] transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block mb-3">
              Legal
            </span>
            <ul className="space-y-2 text-[#66666E]">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#EFEFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#9E9EA4]">
          <span>© 2026 Rankly. An independent product by Nyxen.</span>
          <span>Deterministic analysis + Gemini AI reasoning</span>
        </div>
      </div>
    </footer>
  );
}
