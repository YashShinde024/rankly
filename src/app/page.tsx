import { Navbar } from "@/components/navbar/navbar";
import { HeroSection } from "@/components/hero/hero-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rankly — Website Audit for SEO, AEO & GEO Visibility",
    description:
      "Run a free website audit covering search engine signals, answer engine readiness, and generative AI visibility.",
  },
};

// Mirrors the visible FAQ accordion content exactly.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Rankly check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rankly inspects 21 deterministic technical and on-page signals: HTTPS protocols, HTTP status latencies, canonical links, robots.txt, XML sitemaps, viewport tags, indexability rules, page title lengths, meta descriptions, single H1 requirements, heading hierarchy, image alt text, internal/external links, Open Graph tags, Twitter/X cards, and JSON-LD structured data.",
      },
    },
    {
      "@type": "Question",
      name: "Is Rankly free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Individual URL audits are completely free without signup, credit card details, or token paywalls.",
      },
    },
    {
      "@type": "Question",
      name: "Does AI calculate the SEO score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All scores and diagnostic states (PASS, WARN, ERROR) are calculated by transparent, deterministic formulas. The AI layer is strictly used to translate raw findings into prioritized explanations and copy-paste code fixes.",
      },
    },
    {
      "@type": "Question",
      name: "How does Rankly handle my website URL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rankly performs lightweight server-side HTTP requests using a dedicated User-Agent. We do not inject scripts into your site, store credentials, or track your end users.",
      },
    },
    {
      "@type": "Question",
      name: "Is Rankly a replacement for Google Search Console?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Google Search Console provides historical search queries and Google-indexed data. Rankly gives you immediate code-level diagnostic checks and AI-powered recommendations before and after deployment.",
      },
    },
  ],
};
import { FeatureCategories } from "@/components/features/feature-categories";
import { HowItWorksSection } from "@/components/how-it-works/how-it-works-section";
import { AiEditorialSection } from "@/components/ai-insight/ai-editorial-section";
import { SampleReportPreview } from "@/components/report-preview/sample-report-preview";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { FinalCta } from "@/components/cta/final-cta";
import { Footer } from "@/components/footer/footer";
import { FirstVisitOnboardingModal } from "@/components/onboarding/first-visit-onboarding-modal";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#121214]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Automatic First-Visit Onboarding Layer */}
      <FirstVisitOnboardingModal />

      <Navbar />
      <HeroSection />

      <Reveal>
        <FeatureCategories />
      </Reveal>

      <Reveal>
        <HowItWorksSection />
      </Reveal>

      <Reveal>
        <AiEditorialSection />
      </Reveal>

      <Reveal>
        <SampleReportPreview />
      </Reveal>

      <Reveal>
        <FaqAccordion />
      </Reveal>

      <Reveal>
        <FinalCta />
      </Reveal>

      <Footer />
    </main>
  );
}
