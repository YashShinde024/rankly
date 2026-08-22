"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OnboardingExperience } from "@/components/onboarding/onboarding-experience";

interface FirstVisitOnboardingModalProps {
  forceOpen?: boolean;
}

export function FirstVisitOnboardingModal({ forceOpen = false }: FirstVisitOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Opening must happen after mount: reading localStorage during render would
    // cause an SSR hydration mismatch, so this effect is intentionally required.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    try {
      const completed = localStorage.getItem("rankly_onboarding_completed");
      if (!completed) {
        setIsOpen(true);
      }
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [forceOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F7F5]/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Rankly onboarding"
    >
      {/* Ambient depth behind the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, #E3E3DE 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.3,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 18%, rgba(139,92,246,0.06), rgba(59,130,246,0.035) 45%, transparent 75%)",
        }}
      />

      <div className="relative min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-[1080px] py-4"
        >
          <OnboardingExperience variant="modal" onSkip={() => setIsOpen(false)} />
        </motion.div>
      </div>
    </div>
  );
}
