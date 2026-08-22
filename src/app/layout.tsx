import type { Metadata } from "next";
import "./globals.css";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export const SITE_URL = "https://rankly.nyxen.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rankly — Website Audit for SEO, AEO & GEO Visibility",
    template: "%s | Rankly",
  },
  description:
    "Free website intelligence tool that audits your site for traditional SEO, answer engine optimization (AEO), and generative engine optimization (GEO) — with deterministic checks and AI-prioritized fixes.",
  keywords: [
    "website audit",
    "SEO analysis",
    "SEO checker",
    "AEO",
    "answer engine optimization",
    "GEO",
    "generative engine optimization",
    "AI search visibility",
    "website intelligence",
  ],
  authors: [
    { name: "Yash Shinde", url: "https://yashshinde.is-a.dev" },
  ],
  creator: "Yash Shinde",
  publisher: "Nyxen",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Rankly",
    locale: "en_US",
    title: "Rankly — Website Audit for SEO, AEO & GEO Visibility",
    description:
      "Understand how your website performs across search engines, answer engines, and generative AI. Deterministic diagnostics + AI-prioritized fixes.",
    images: [
      {
        url: "/branding/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rankly — website intelligence for Search, Answers and Generative AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rankly — Website Audit for SEO, AEO & GEO Visibility",
    description:
      "Understand how your website performs across search engines, answer engines, and generative AI.",
    images: ["/branding/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  applicationName: "Rankly",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Rankly",
    statusBarStyle: "default",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rankly",
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Website intelligence tool auditing SEO, AEO (answer engine optimization), and GEO (generative engine optimization) signals with deterministic checks and AI-assisted prioritization.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: "Yash Shinde",
      url: "https://yashshinde.is-a.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "Nyxen",
      url: "https://nyxen.in",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rankly",
    url: SITE_URL,
    description:
      "Audit your website's visibility across search engines, answer engines, and generative AI systems.",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>      <body className="min-h-full flex flex-col bg-[#FBFBFA] text-[#121214]">
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
