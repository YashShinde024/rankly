import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contact — Talk to the Rankly Team",
  description:
    "Questions, feedback, issues, or ideas for Rankly? Send a message directly to the team at Nyxen — we read everything personally.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-6xl px-6">
          {/* Hero */}
          <header className="pt-20 pb-12 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#66666E]">
              Contact
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-light tracking-tight leading-[1.1]">
              Let&apos;s talk about{" "}
              <span className="spectral-text">
                your visibility.
              </span>
            </h1>
            <p className="mt-5 text-sm sm:text-base text-[#66666E] leading-relaxed">
              Whether it&apos;s feedback on an audit report, a technical issue, a feature idea, or
              just a question about how Rankly measures SEO, AEO &amp; GEO — send it over. This
              goes straight to the people building Rankly.
            </p>
          </header>

          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 pb-24">
              {/* Form */}
              <section aria-label="Contact form">
                <Suspense fallback={null}>
                  <ContactForm />
                </Suspense>
              </section>

              {/* Direct channels */}
              <aside className="space-y-4 lg:pt-14">
                <div className="border border-[#EFEFEA] bg-white p-5 space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block">
                    Prefer elsewhere?
                  </span>
                  <p className="text-xs text-[#66666E] leading-relaxed">
                    Rankly is built by Yash Shinde at{" "}
                    <a
                      href="https://nyxen.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#121214] underline underline-offset-2 hover:decoration-violet-600"
                    >
                      Nyxen
                    </a>
                    . For anything product-related, this form is the fastest route — messages land
                    directly with the team.
                  </p>
                </div>

                <div className="border border-[#EFEFEA] bg-[#FCFCFA] p-5 space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#121214] block">
                    Before you write
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#66666E] list-disc list-inside">
                    <li>Report URLs are public by design — see the Privacy Policy.</li>
                    <li>Audit reports expire after 30 days.</li>
                    <li>Domains can be re-audited every 7 days.</li>
                  </ul>
                  <Link
                    href="/legal?tab=privacy"
                    className="inline-block text-xs text-violet-700 underline underline-offset-2"
                  >
                    Read Privacy &amp; Terms →
                  </Link>
                </div>
              </aside>
            </div>
          </Reveal>
        </main>
      </div>

      <Footer />
    </div>
  );
}
