import type { ComponentType } from "react";
import type { LockedAnimation } from "@/lib/prospectsAccess";
import AnimOrbit from "./AnimOrbit";
import OrbitMinimal from "./orbit/OrbitMinimal";
import OrbitSpaces from "./orbit/OrbitSpaces";
import VaporCards from "./orbit/VaporCards";
import ResearchDeckRefined from "./orbit/ResearchDeckRefined";
import CaptureDeck from "./orbit/CaptureDeck";

const VaporPolished = () => <VaporCards native />;

/**
 * The Locked V2 panel's animations, in the order the history lists them.
 *
 * The final animation first; then the variations kept beside it for
 * comparison — the two it grew from, the approved orbit reference, and the
 * earlier Spaces and Original Background treatments.
 */
export const LOCKED_ANIMATIONS: ReadonlyArray<{
  key: LockedAnimation;
  label: string;
  description: string;
  Component: ComponentType;
  /** Starts a new group in the history, under this heading. */
  group?: string;
}> = [
  {
    key: "o15",
    label: "Final Animation",
    description: "Researching deck: the cursor clicks, the prospect is revealed and captured as a chip",
    Component: CaptureDeck,
  },
  {
    key: "o13",
    label: "Variation 13 — Vaporize, polished",
    description: "Variation 11 with a native, sharp card and the count as the status line",
    Component: VaporPolished,
  },
  {
    key: "o14",
    label: "Variation 14 — Researching deck, refined",
    description: "Variation 10 with a real stack and a physical pick-up, drag and flick",
    Component: ResearchDeckRefined,
  },
  {
    key: "a5",
    label: "Reference — Into your orbit",
    description: "The approved orbit the five are developed from",
    Component: AnimOrbit,
  },
  {
    key: "o6",
    label: "Variation 6 — Spaces",
    description: "Your category as host; companies gather, speak, surface named",
    Component: OrbitSpaces,
  },
  {
    key: "o1",
    label: "Variation 1 — Original Background",
    description: "Prospect cards and a cursor: detected, revealed, filed",
    Component: OrbitMinimal,
  },
];
