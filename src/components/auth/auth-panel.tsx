"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import { RanklyLogo } from "@/components/ui/rankly-logo";
import { useAuth } from "@/components/auth/auth-provider";
import { GoogleIcon } from "@/components/auth/auth-gate-modal";

type Mode = "signin" | "signup" | "forgot";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function AuthPanel({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/my-reports";
  const { signInEmail, signUpEmail, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const busy = emailLoading || googleLoading;

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (isSignup && !name.trim()) errs.name = "Enter your name.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";

    if (!isForgot) {
      if (!password) errs.password = "Password is required.";
      else if (isSignup && password.length < 6)
        errs.password = "Password must be at least 6 characters.";
      if (isSignup && confirm !== password) errs.confirm = "Passwords don't match.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !validate()) return;

    setFormError(null);
    setNotice(null);
    setEmailLoading(true);
    try {
      if (isForgot) {
        await resetPassword(email.trim());
        setNotice(`Password reset link sent to ${email.trim()}. Check your inbox.`);
      } else if (isSignup) {
        await signUpEmail(name, email.trim(), password);
        router.push(next);
      } else {
        await signInEmail(email.trim(), password);
        router.push(next);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setEmailLoading(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push(next);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't sign in with Google.");
      setGoogleLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-[#EFEFEA] px-3.5 py-3 text-sm text-[#121214] placeholder:text-[#B9B9B4] focus:border-[#121214] focus:outline-none transition-colors";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white border border-[#EFEFEA] shadow-[0_1px_2px_rgba(18,18,20,0.04),0_16px_48px_-16px_rgba(18,18,20,0.08)]">
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="h-full w-full spectrum-line opacity-80" />
        </div>

        <div className="p-7 sm:p-10 space-y-7">
          <div className="space-y-3">
            <Link href="/" aria-label="Rankly home" className="inline-block hover:opacity-80 transition-opacity">
              <RanklyLogo height={18} priority />
            </Link>
            <h1 className="text-2xl font-light tracking-tight text-[#121214]">
              {isForgot
                ? "Reset your password"
                : isSignup
                  ? "Create your account"
                  : "Welcome back"}
            </h1>
            <p className="text-xs text-[#66666E] leading-relaxed">
              {isForgot
                ? "We'll email you a secure link to choose a new password."
                : isSignup
                  ? "Free forever for core features. Your first analysis is on us."
                  : "Sign in to access your reports and workspace."}
            </p>
          </div>

          {/* Google */}
          {!isForgot && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2.5 border border-[#D4D4D0] bg-white px-4 py-3 text-xs font-medium text-[#121214] hover:bg-[#FAFAF8] hover:border-[#B9B9B4] transition-colors cursor-pointer disabled:opacity-60 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
              >
                {googleLoading ? (
                  <span>Connecting…</span>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>{isSignup ? "Sign up with Google" : "Continue with Google"}</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-[#EFEFEA]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9EA4]">
                  or continue with email
                </span>
                <span className="h-px flex-1 bg-[#EFEFEA]" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <label htmlFor="auth-name" className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
                  Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or organization"
                  autoComplete="name"
                  maxLength={60}
                  aria-invalid={Boolean(fieldErrors.name)}
                  className={inputClass}
                />
                {fieldErrors.name && <p className="text-xs text-rose-700" role="alert">{fieldErrors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                className={inputClass}
              />
              {fieldErrors.email && <p className="text-xs text-rose-700" role="alert">{fieldErrors.email}</p>}
            </div>

            {!isForgot && (
              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignup ? "At least 6 characters" : "Your password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8C94] hover:text-[#121214] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-rose-700" role="alert">{fieldErrors.password}</p>}
              </div>
            )}

            {isSignup && (
              <div className="space-y-1.5">
                <label htmlFor="auth-confirm" className="block font-mono text-[10px] uppercase tracking-wider text-[#66666E]">
                  Confirm password
                </label>
                <input
                  id="auth-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.confirm)}
                  className={inputClass}
                />
                {fieldErrors.confirm && <p className="text-xs text-rose-700" role="alert">{fieldErrors.confirm}</p>}
              </div>
            )}

            {!isSignup && !isForgot && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setFormError(null);
                    setNotice(null);
                    setFieldErrors({});
                  }}
                  className="text-[11px] font-mono text-[#66666E] hover:text-[#121214] underline underline-offset-2 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs" role="alert">
                {formError}
              </div>
            )}

            {notice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2" role="status">
                <CheckCircle2 className="h-3.5 w-3.5 mt-px shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group w-full inline-flex items-center justify-center gap-2 bg-[#121214] px-4 py-3 text-xs font-medium text-white hover:bg-black transition-colors cursor-pointer disabled:opacity-60 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6]"
            >
              {emailLoading ? (
                <span>{isForgot ? "Sending…" : isSignup ? "Creating account…" : "Signing in…"}</span>
              ) : (
                <>
                  <span>
                    {isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign in"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8C94]">
            {isForgot ? (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="inline-flex items-center gap-1 hover:text-[#121214] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </button>
            ) : (
              <>
                <span>
                  {isSignup ? "Already have an account?" : "New to Rankly?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(isSignup ? "signin" : "signup");
                      setFormError(null);
                      setFieldErrors({});
                    }}
                    className="text-[#121214] underline underline-offset-2 hover:text-black cursor-pointer"
                  >
                    {isSignup ? "Sign in" : "Create account"}
                  </button>
                </span>
                <Link href="/" className="hover:text-[#121214] transition-colors">
                  Home
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[11px] text-[#B9B9B4] leading-relaxed max-w-sm mx-auto">
        By continuing you agree to Rankly&apos;s{" "}
        <Link href="/legal?tab=terms" className="underline underline-offset-2 hover:text-[#66666E]">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal?tab=privacy" className="underline underline-offset-2 hover:text-[#66666E]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export function MailIconHint() {
  return <Mail className="h-3.5 w-3.5" />;
}
