"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Check } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  /** Contextual line, e.g. the hostname the user tried to analyze. */
  contextHostname?: string | null;
}

const BENEFITS = [
  "Analyze more websites",
  "Keep your audit history",
  "Access reports anytime",
  "Track your website intelligence",
];

export function AuthGateModal({ open, onClose, contextHostname }: AuthGateModalProps) {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
      router.push("/my-reports");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't sign in. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#121214]/30 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Create your Rankly account"
          onClick={(e) => e.target === e.currentTarget && !googleLoading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white border border-[#EFEFEA] shadow-[0_24px_64px_-16px_rgba(18,18,20,0.18)]"
          >
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
              <div className="h-full w-full spectrum-line opacity-80" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={googleLoading}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-7 sm:p-9 space-y-6">
              <div className="space-y-2 text-left">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#66666E]">
                  Your first report is complete
                </span>
                <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#121214] leading-snug">
                  Unlock your Rankly workspace
                </h2>
                <p className="text-xs sm:text-sm text-[#66666E] leading-relaxed">
                  Create a free account to continue analyzing websites{" "}
                  {contextHostname ? (
                    <>
                      beyond <span className="font-mono text-[#121214]">{contextHostname}</span>{" "}
                    </>
                  ) : null}
                  and keep your reports in one place.
                </p>
              </div>

              <ul className="space-y-1.5 border-y border-[#EFEFEA] py-4">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-[#121214]">
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {/* Google button */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full inline-flex items-center justify-center gap-2.5 border border-[#D4D4D0] bg-white px-4 py-3 text-xs font-medium text-[#121214] hover:bg-[#FAFAF8] hover:border-[#B9B9B4] transition-colors cursor-pointer disabled:opacity-60 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
                >
                  {googleLoading ? (
                    <span>Connecting…</span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#121214] px-4 py-3 text-xs font-medium text-white hover:bg-black transition-colors cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
                >
                  Create account with email
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-700 border border-rose-200 bg-rose-50 p-2.5" role="alert">
                  {error}
                </p>
              )}

              <p className="text-[11px] font-mono text-[#8C8C94] text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-[#121214] underline underline-offset-2 hover:text-black">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}
