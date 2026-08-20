import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankly.app"),
  title: "Rankly — AI-Powered Website SEO Intelligence",
  description:
    "Know what's holding your website back. Deterministic technical and on-page SEO checks paired with actionable Gemini AI recommendations. An independent product by Nyxen.",
  keywords: [
    "SEO Intelligence",
    "Technical SEO Audit",
    "On-page SEO",
    "Website Diagnostic",
    "SEO Analyzer",
    "Gemini AI SEO",
    "Nyxen",
  ],
  authors: [
    { name: "Yash Shinde", url: "https://yashshinde.is-a.dev" },
    { name: "Nyxen", url: "https://nyxen.in" },
  ],
  creator: "Yash Shinde",
  publisher: "Nyxen",
  alternates: {
    canonical: "https://rankly.app",
  },
  openGraph: {
    title: "Rankly — AI-Powered Website SEO Intelligence",
    description:
      "Know what's holding your website back. Deterministic technical and on-page SEO checks paired with actionable Gemini AI recommendations.",
    url: "https://rankly.app",
    siteName: "Rankly",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rankly — AI-Powered Website SEO Intelligence",
    description:
      "Know what's holding your website back. Deterministic technical and on-page SEO checks paired with actionable Gemini AI recommendations.",
    creator: "@yashshinde",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Rankly",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description":
    "AI-powered website SEO intelligence tool providing deterministic technical checks and AI recommendations.",
  "author": {
    "@type": "Person",
    "name": "Yash Shinde",
    "url": "https://yashshinde.is-a.dev",
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nyxen",
    "url": "https://nyxen.in",
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
};

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
      </head>
      <body className="min-h-full flex flex-col bg-[#FBFBFA] text-[#121214]">
        {children}
      </body>
    </html>
  );
}
