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
  /** The signed-off design, and what both pages render by default. */
  | "final"
  | "current"
  | "v1"
  | "v2"
  | "v3"
  | "v4"
  | "v5"
  | "v6"
  | "v7"
  | "v8"
  | "v10"
  | "v11"
  | "v12"
  | "v13"
  /* The eight stack studies — one interaction, eight ways of drawing depth.
     See variations/stackStyles. */
  | "s1"
  | "s2"
  | "s3"
  | "s4"
  | "s5"
  | "s6"
  | "s7"
  | "s8"
  /* The eight finished stacks — see variations/stackRefined. */
  | "r1"
  | "r2"
  | "r3"
  | "r4"
  | "r5"
  | "r6"
  | "r7"
  | "r8";

export const REVEAL_VARIATIONS: ReadonlyArray<{
  key: RevealVariation;
  /** What the switch calls it. */
  label: string;
  /** The one-line description under the switch. */
  description: string;
}> = [
  {
    key: "final",
    label: "Final — Figma",
    description: "The signed-off stack: 1:50, 3:52, 0:1817, 3:53",
  },
  /* The finished stacks, straight after the design they are variations of.
     Every one steps left only, stays inside the main card's height, and draws
     no count. */
  { key: "r1", label: "Variation 1 · Sage steps", description: "Stepped layers in the page's own sage, crisp white edges" },
  { key: "r2", label: "Variation 2 · Deep teal", description: "Dark product-teal layers — contrast as the cue" },
  { key: "r3", label: "Variation 3 · Lime edge", description: "White hairline layers, the deck's spine in brand lime" },
  { key: "r4", label: "Variation 4 · Editorial outline", description: "Line, not fill — nested teal strokes, tight steps" },
  { key: "r5", label: "Variation 5 · Elevated", description: "Near-white layers, each casting its shadow left" },
  { key: "r6", label: "Variation 6 · Brand gradient", description: "Sage at the edge, fading into the card" },
  { key: "r7", label: "Variation 7 · Index tabs", description: "Full-height layers, a solid block of filed cards" },
  { key: "r8", label: "Variation 8 · Staircase", description: "Foot-anchored layers descending like treads" },
  /* The first round of stack studies, kept for reference. Lettered rather than
     numbered so "Variation 1" means exactly one thing on this list. */
  { key: "s1", label: "Draft A · Colored stack", description: "First round — shipped geometry, depth in the product's ink" },
  { key: "s2", label: "Draft B · Bound spine", description: "First round — tight step held by a left rule" },
  { key: "s3", label: "Draft C · Elevated", description: "First round — no edges, depth as stacked shadow" },
  { key: "s4", label: "Draft D · Fanned", description: "First round — layers turned a degree" },
  { key: "s5", label: "Draft E · Stepped", description: "First round — wide, rimmed steps" },
  { key: "s6", label: "Draft F · Underlay", description: "First round — layers drop beneath like a pad" },
  { key: "s7", label: "Draft G · Corner fold", description: "First round — layers surface at the top-left corner" },
  { key: "s8", label: "Draft H · Variant rail", description: "First round — a rail, one segment per contact" },
  { key: "current", label: "Current", description: "Shipped before the model changed" },
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
  {
    key: "v10",
    label: "10 · Stacked deck + Interactive Contacts",
    description: "Deck sealed, deck opened — shuffle the faces",
  },
  {
    key: "v11",
    label: "11 · Left stack",
    description: "Cards step out to the left, one row tall",
  },
  {
    key: "v12",
    label: "12 · Fanned left",
    description: "The same stack, held rather than filed",
  },
  {
    key: "v13",
    label: "13 · Left rail",
    description: "One whole card, the others a rail of faces",
  },
];

export const DEFAULT_REVEAL_VARIATION: RevealVariation = "final";

const RevealVariationContext = createContext<RevealVariation>(DEFAULT_REVEAL_VARIATION);

export const RevealVariationProvider = RevealVariationContext.Provider;

export function useRevealVariation(): RevealVariation {
  return useContext(RevealVariationContext);
}

/** True while the pre-change, contact-by-contact implementation is on screen. */
export function useIsLegacyReveal(): boolean {
  return useRevealVariation() === "current";
}
