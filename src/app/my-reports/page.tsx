import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { MyReportsView } from "@/components/reports/my-reports-view";

export const metadata: Metadata = {
  title: "My Reports | Rankly",
  description: "Your Rankly website visibility reports.",
  robots: { index: false, follow: false },
};

export default function MyReportsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
          <MyReportsView />
        </main>
      </div>
      <Footer />
    </div>
  );
}
