import { Navbar } from "@/components/navbar/navbar";
import { HeroSection } from "@/components/hero/hero-section";
import { FeatureCategories } from "@/components/features/feature-categories";
import { HowItWorksSection } from "@/components/how-it-works/how-it-works-section";
import { AiEditorialSection } from "@/components/ai-insight/ai-editorial-section";
import { SampleReportPreview } from "@/components/report-preview/sample-report-preview";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { FinalCta } from "@/components/cta/final-cta";
import { Footer } from "@/components/footer/footer";
import { FirstVisitOnboardingModal } from "@/components/onboarding/first-visit-onboarding-modal";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#121214]">
      {/* Automatic First-Visit Onboarding Layer */}
      <FirstVisitOnboardingModal />

      <Navbar />
      <HeroSection />
      <FeatureCategories />
      <HowItWorksSection />
      <AiEditorialSection />
      <SampleReportPreview />
      <FaqAccordion />
      <FinalCta />
      <Footer />
    </main>
  );
}
