import { createContext, useContext } from "react";

/**
 * Which contact-reveal design the app is rendering.
 *
 * A review control, not product UI. The company-based reveal model is being
 * designed in the page it will ship in, so each concept is a real, working
 * implementation reading the real reveal state — the switch only decides which
 * one is drawn. Everything around it (the list, the filters, the modal, the
 * allowance in the header) is untouched by the choice.
 *
 * "current" is the implementation that shipped before the model changed, kept
 * whole so the two can be compared side by side. It is the only variation that
 * still counts reveals per contact; every other one counts them per company.
 */
export type RevealVariation =
  | "current"
  | "v1"
  | "v2"
  | "v3"
  | "v4"
  | "v5"
  | "v6"
  | "v7"
  | "v8";

export const REVEAL_VARIATIONS: ReadonlyArray<{
  key: RevealVariation;
  /** What the switch calls it. */
  label: string;
  /** The one-line description under the switch. */
  description: string;
}> = [
  { key: "current", label: "Current", description: "Shipped today — one reveal per contact" },
  { key: "v1", label: "1 · Company unlock", description: "Primary contact, one company action" },
  { key: "v2", label: "2 · Grouped", description: "All contacts as one group card" },
  { key: "v3", label: "3 · Stacked deck", description: "Contacts stack, then fan out" },
  { key: "v4", label: "4 · Expandable", description: "Collapsed summary, expand to preview" },
  { key: "v5", label: "5 · Roles first", description: "Titles readable, identities sealed" },
  { key: "v6", label: "6 · Unlock banner", description: "Company CTA over skeleton previews" },
  { key: "v7", label: "7 · Browse & unlock", description: "Flip through contacts, unlock once" },
  {
    key: "v8",
    label: "8 · Grouped + Contact Selector",
    description: "Three seats, one unlock, then pick a contact",
  },
];

export const DEFAULT_REVEAL_VARIATION: RevealVariation = "v1";

const RevealVariationContext = createContext<RevealVariation>(DEFAULT_REVEAL_VARIATION);

export const RevealVariationProvider = RevealVariationContext.Provider;

export function useRevealVariation(): RevealVariation {
  return useContext(RevealVariationContext);
}

/** True while the pre-change, contact-by-contact implementation is on screen. */
export function useIsLegacyReveal(): boolean {
  return useRevealVariation() === "current";
}
