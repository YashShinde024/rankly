import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { AccountView } from "@/components/auth/account-view";

export const metadata: Metadata = {
  title: "Account | Rankly",
  description: "Your Rankly account.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#121214] flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
          <AccountView />
        </main>
      </div>
      <Footer />
    </div>
  );
}
