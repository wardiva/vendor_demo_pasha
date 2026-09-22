import { createContext, useContext } from "react";
import type { CompanyRevealPlan } from "@/context/CompanyRevealContext";

/**
 * Which contact-reveal experience is on screen right now — a prototype
 * control, not product state.
 *
 * "current" is the original, untouched per-contact experience: every surface
 * renders exactly as it did before this comparison existed. Every other value
 * selects one of the seven company-based concepts, all reading and writing
 * the same `CompanyRevealContext` so switching between them compares the
 * presentation, not seven different data models.
 */
export const REVEAL_EXPERIENCES = [
  "current",
  "v1",
  "v2",
  "v3",
  "v4",
  "v5",
  "v6",
  "v7",
] as const;

export type RevealExperience = (typeof REVEAL_EXPERIENCES)[number];

export const REVEAL_EXPERIENCE_LABELS: Record<RevealExperience, string> = {
  current: "Current",
  v1: "V1 · Your design",
  v2: "V2 · Grouped contacts",
  v3: "V3 · Stacked cards",
  v4: "V4 · Expandable group",
  v5: "V5 · Progressive reveal",
  v6: "V6 · CTA with previews",
  v7: "V7 · Reveal bundle",
};

export type RevealExperienceState = {
  experience: RevealExperience;
  setExperience: (e: RevealExperience) => void;
  plan: CompanyRevealPlan;
  setPlan: (p: CompanyRevealPlan) => void;
  /** Dev-only toggle so the zero-balance state can be previewed on demand. */
  simulateNoReveals: boolean;
  setSimulateNoReveals: (v: boolean) => void;
};

const RevealExperienceContext = createContext<RevealExperienceState>({
  experience: "current",
  setExperience: () => {},
  plan: "Growth",
  setPlan: () => {},
  simulateNoReveals: false,
  setSimulateNoReveals: () => {},
});

export const RevealExperienceProvider = RevealExperienceContext.Provider;

export function useRevealExperience(): RevealExperienceState {
  return useContext(RevealExperienceContext);
}
