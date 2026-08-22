"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AiAccent } from "@/components/ui/ai-accent";

const CATEGORIES = [
  { id: "feedback", label: "Product feedback" },
  { id: "issue", label: "Report issue" },
  { id: "idea", label: "Feature idea" },
  { id: "general", label: "General question" },
] as const;

type Status = "idle" | "sending" | "success" | "error";

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("feedback");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isSending = status === "sending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSending) return;

    setStatus("sending");
    setServerError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, category, company }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setStatus("success");
        return;
      }

      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      setServerError(data?.message || "Your message couldn't be sent. Please try again shortly.");
      setStatus("error");
    } catch {
      setServerError("Network issue — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-[#EFEFEA] bg-white p-10 text-center space-y-4"
        role="status"
      >
        <div className="inline-flex items-center justify-center h-11 w-11 border border-[#EFEFEA] bg-[#FBFBFA]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-light tracking-tight text-[#121214]">Message received.</h2>
        <p className="text-sm text-[#66666E] max-w-sm mx-auto leading-relaxed">
          Thanks for reaching out about Rankly. We read everything personally and typically respond
          within a few days.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
            setStatus("idle");
          }}
          className="text-xs font-mono text-[#66666E] underline underline-offset-4 hover:text-[#121214] transition-colors cursor-pointer"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  const inputClass =
    "w-full bg-white border border-[#EFEFEA] px-3.5 py-2.5 text-sm text-[#121214] placeholder:text-[#9E9EA4] focus:border-[#121214] focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Category quick-select */}
      <fieldset className="space-y-2">
        <legend className="font-mono text-xs uppercase tracking-wider text-[#66666E] mb-2">
          What can we help with?
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`px-3 py-1.5 border text-xs transition-all cursor-pointer ${
                category === c.id
                  ? "border-[#121214] bg-[#121214] text-white"
                  : "border-[#EFEFEA] bg-white text-[#66666E] hover:border-[#D4D4D0]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block font-mono text-xs uppercase tracking-wider text-[#66666E]">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.name)}
            className={inputClass}
          />
          {fieldErrors.name && (
            <p className="text-xs text-rose-700" role="alert">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block font-mono text-xs uppercase tracking-wider text-[#66666E]">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            className={inputClass}
          />
          {fieldErrors.email && (
            <p className="text-xs text-rose-700" role="alert">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="block font-mono text-xs uppercase tracking-wider text-[#66666E]">
          Subject <span className="text-[#9E9EA4] normal-case">(optional)</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary of your message"
          maxLength={120}
          aria-invalid={Boolean(fieldErrors.subject)}
          className={inputClass}
        />
        {fieldErrors.subject && (
          <p className="text-xs text-rose-700" role="alert">{fieldErrors.subject}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="block font-mono text-xs uppercase tracking-wider text-[#66666E]">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind — feedback, an issue you hit, or an idea for Rankly."
          rows={6}
          maxLength={2000}
          aria-invalid={Boolean(fieldErrors.message)}
          className={`${inputClass} resize-y min-h-[140px]`}
        />
        <div className="flex items-center justify-between">
          {fieldErrors.message ? (
            <p className="text-xs text-rose-700" role="alert">{fieldErrors.message}</p>
          ) : (
            <span />
          )}
          <span className="font-mono text-[10px] text-[#9E9EA4]" aria-hidden="true">
            {message.length}/2000
          </span>
        </div>
      </div>

      {/* Honeypot — invisible to humans */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
      />

      <AnimatePresence>
        {status === "error" && serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900"
            role="alert"
          >
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2 flex items-center justify-between gap-4">
        <p className="text-[11px] font-mono text-[#8C8C94] hidden sm:block">
          We reply from the Rankly team at Nyxen.
        </p>
        <button type="submit" disabled={isSending} className="group block relative cursor-pointer disabled:opacity-70 shrink-0">
          <AiAccent variant="border" intensity="active">
            <span className="px-6 py-2.5 text-xs font-medium flex items-center gap-2 text-white">
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <span>Send message</span>
                  <ArrowRight className="h-3 w-3 text-violet-300 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </AiAccent>
        </button>
      </div>
    </form>
  );
}
