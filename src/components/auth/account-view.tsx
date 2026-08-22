"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck, FileText } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

const PROVIDER_LABELS: Record<string, string> = {
  "google.com": "Google",
  password: "Email & password",
};

export function AccountView() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-7 w-40 bg-[#EFEFEA] animate-pulse rounded-sm" />
        <div className="border border-[#EFEFEA] bg-white p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#EFEFEA] animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 w-40 bg-[#EFEFEA] animate-pulse rounded-sm" />
              <div className="h-3 w-52 bg-[#F3F3EF] animate-pulse rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const provider =
    PROVIDER_LABELS[user.email ? (user.photoURL ? "google.com" : "password") : "password"] ||
    "Email & password";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      <header>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E] inline-flex items-center gap-2">
          <span className="spectral-dot" aria-hidden="true" />
          Workspace
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight mt-1.5">Account</h1>
      </header>

      <section className="border border-[#EFEFEA] bg-white p-6 space-y-5">
        <div className="flex items-center gap-4 min-w-0">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover border border-[#EFEFEA] shrink-0"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#121214] text-white text-base font-mono font-semibold shrink-0">
              {(user.displayName || user.email || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <span className="block text-sm font-medium text-[#121214] truncate">
              {user.displayName || "Rankly user"}
            </span>
            <span className="block text-xs text-[#66666E] truncate">{user.email}</span>
            {!user.emailVerified && user.email && (
              <span className="inline-block mt-1 px-2 py-0.5 border border-amber-300 bg-amber-50 text-amber-800 font-mono text-[9px] uppercase tracking-wider">
                Email not verified
              </span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-[#EFEFEA] pt-5 text-xs">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[#9E9EA4]">Sign-in method</dt>
            <dd className="text-[#121214] mt-0.5 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              {provider}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-[#9E9EA4]">Plan</dt>
            <dd className="text-[#121214] mt-0.5">Free</dd>
          </div>
        </dl>

        <div className="flex flex-col sm:flex-row gap-3 border-t border-[#EFEFEA] pt-5">
          <Link
            href="/my-reports"
            className="inline-flex items-center justify-center gap-1.5 bg-[#121214] text-white px-5 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-medium hover:bg-black transition-colors"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            My Reports
          </Link>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="inline-flex items-center justify-center gap-1.5 border border-[#D4D4D0] bg-white px-5 py-2.5 min-h-[44px] sm:min-h-0 text-xs font-medium text-[#66666E] hover:border-rose-300 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </section>

      <p className="text-[11px] text-[#B9B9B4] leading-relaxed">
        Account data is stored securely in Firebase and governed by our{" "}
        <Link href="/legal?tab=privacy" className="underline underline-offset-2 hover:text-[#66666E]">
          Privacy Policy
        </Link>
        .
      </p>
    </motion.div>
  );
}
