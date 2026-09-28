import { OrbitScene, type OrbitTheme } from "../AnimOrbit";
import { INK, MUTED } from "../shared";

/**
 * Orbit Variation 1 — Original Background.
 *
 * The approved orbit, move for move, on #f5f6f6. Only the colour system is
 * its own, and it is built the way data-visualisation and AI products build
 * theirs: dark neutrals carry the structure, one electric accent means "live",
 * one outcome colour means "done", and nothing else is coloured.
 *
 * Every company logo is drawn in the system's colours — tinted by its state —
 * so no logo brings a colour of its own into the field.
 *
 * The chosen system (E) reads in the order the story runs:
 *
 *   category    Product teal #072929 with a lime rim and halo: the darkest,
 *               largest mark on the ground, so the eye starts there.
 *   companies   Deep teal discs lit faintly cyan from within: present,
 *               intelligent, not yet known.
 *   researching Electric cyan: the company doing it glows cyan and its
 *               research flows to you as cyan-to-teal lines, with a cyan
 *               gauge closing round it.
 *   signal      Orange, and only the signal: the one warm colour in the
 *               system, so the detected signal is where the eye goes next.
 *   prospect    Lime: identified logos become neon-lime marks on near-black,
 *               ringed in green beside the green intent chip, and the tray
 *               holds the same marks.
 *
 * Four directions were explored before it — navy/cyan, circuit
 * (teal/blue/orange), graphite/lime and signal teal — see DIRECTIONS and the
 * design canvas; E combines the last with circuit's single warm accent.
 */

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

type Direction = {
  /** The category: your profile's disc, its rim and its glyph. */
  core: string;
  rim: string;
  glyph: string;
  /** The unidentified companies, and the orbit lines they sit on. */
  field: string;
  lines: string;
  /** Research in progress: the researching company, its gauge, the flow. */
  active: string;
  activeTint: string;
  /** The detected signal's label. */
  labelBg: string;
  labelText: string;
  labelDot: string;
  /** Identified: the ring, the prospect's disc tint, the tray. */
  done: string;
  doneTint: string;
  /* Refinements the final direction uses. */
  /** Idle companies glow faintly from within in this colour. */
  fieldGlow?: string;
  /** Identified logos as a dark mark on the outcome colour, not a tint. */
  doneAsMark?: boolean;
};

function system(d: Direction): OrbitTheme {
  return {
    stage: "#f5f6f6",
    ring: rgba(d.lines, 0.16),
    header: INK,
    headerWeight: 500,
    liveDark: false,
    live: d.active,
    thread: d.active,
    threadTo: d.core,
    threadOpacity: 1,
    labelBg: d.labelBg,
    labelText: d.labelText,
    labelDot: d.labelDot,
    labelShadow: `0px 4px 12px 0px ${rgba(d.core, 0.25)}`,
    coreBg: d.core,
    coreShadow: `0 0 0 2.5px ${d.rim}, 0 0 0 9px ${rgba(d.rim, 0.2)}, 0px 12px 28px 0px ${rgba(d.core, 0.38)}`,
    corePulse: d.rim,
    glyph: d.glyph,
    coreLabel: INK,
    /* Unidentified: dark neutral discs, the logo only a tone within them. */
    discBg: d.field,
    discShadow: d.fieldGlow
      ? `inset 0 0 10px 0px ${rgba(d.fieldGlow, 0.55)}, 0 0 0 2px #ffffff, 0px 4px 10px 0px ${rgba(d.core, 0.22)}`
      : `0 0 0 2px #ffffff, 0px 4px 10px 0px ${rgba(d.core, 0.22)}`,
    discOpacity: 0.9,
    discOpacityStray: 1,
    discGray: 1,
    discBlend: "luminosity",
    /* Researching: the disc takes the live accent and glows with it. */
    activeBg: d.activeTint,
    activeShadow: `0 0 0 2px #ffffff, 0 0 0 5px ${rgba(d.active, 0.22)}, 0px 6px 16px 0px ${rgba(d.active, 0.4)}`,
    stray: rgba(d.active, 0.5),
    gaugeTrack: rgba(d.active, 0.18),
    gauge: d.active,
    /* Identified: the outcome colour — rim, disc tint and the tray agree. */
    gaugeDone: d.done,
    doneBg: d.doneTint,
    doneBlend: d.doneAsMark ? "multiply" : "luminosity",
    doneGray: 1,
    /* As a mark: the logo flattened to ink, multiplied onto the outcome
       colour — its light ground takes the lime, its drawing stays dark. */
    doneFilter: d.doneAsMark ? "grayscale(1) contrast(2.4)" : undefined,
    doneShadow: `0 0 0 2px #ffffff, 0px 8px 18px 0px ${rgba(d.core, 0.28)}`,
    cardShadow: `0 0 0 1px ${rgba(d.core, 0.06)}, 0px 10px 24px 0px ${rgba(d.core, 0.16)}`,
    trayBg: "#ffffff",
    trayShadow: `0px 4px 18px 0px ${rgba(d.core, 0.1)}`,
    trayLabel: MUTED,
    trayCount: d.core,
    trayRing: "#ffffff",
    trayLogoBg: d.doneTint,
    trayLogoBlend: d.doneAsMark ? "multiply" : "luminosity",
    trayLogoGray: 1,
    trayLogoFilter: d.doneAsMark ? "grayscale(1) contrast(2.4)" : undefined,
    trayMark: d.done,
  };
}

/* The directions explored — see the design canvas for the comparison. */
export const DIRECTIONS: Record<string, OrbitTheme> = {
  /* A · Neural navy: navy structure, cyan live, lime outcome. */
  navy: system({
    core: "#0B1B33",
    rim: "#22D3EE",
    glyph: "#22D3EE",
    field: "#1E2E4A",
    lines: "#0B1B33",
    active: "#0AA5C7",
    activeTint: "#0891B2",
    labelBg: "#0B1B33",
    labelText: "#22D3EE",
    labelDot: "#22D3EE",
    done: "#5DBB1E",
    doneTint: "#9BE84F",
  }),
  /* B · Circuit: product teal structure, electric blue live, one warm orange
     for the detected signal, lime outcome. */
  circuit: system({
    core: "#072929",
    rim: "#B1FA63",
    glyph: "#B1FA63",
    field: "#1D3B3A",
    lines: "#072929",
    active: "#2563EB",
    activeTint: "#2563EB",
    labelBg: "#FF7A1A",
    labelText: "#ffffff",
    labelDot: "#ffffff",
    done: "#5DBB1E",
    doneTint: "#9BE84F",
  }),
  /* C · Graphite: near-black structure, neon lime live, emerald outcome. */
  graphite: system({
    core: "#101418",
    rim: "#B1FA63",
    glyph: "#B1FA63",
    field: "#2A3139",
    lines: "#101418",
    active: "#6CC417",
    activeTint: "#7ACC1F",
    labelBg: "#101418",
    labelText: "#B1FA63",
    labelDot: "#B1FA63",
    done: "#10B981",
    doneTint: "#34D399",
  }),
  /* D · Signal teal: the product's own teal structure, electric cyan live,
     lime outcome — the modal's teal button and lime ticks, extended. */
  signal: system({
    core: "#072929",
    rim: "#B1FA63",
    glyph: "#B1FA63",
    field: "#163A3B",
    lines: "#072929",
    active: "#00A7C4",
    activeTint: "#06B6D4",
    labelBg: "#072929",
    labelText: "#5EEAD4",
    labelDot: "#22D3EE",
    done: "#5DBB1E",
    doneTint: "#9BE84F",
  }),
  /* E · Signal, refined: D's teal, cyan and lime, with B's one warm accent
     kept for the detected signal alone, idle companies lit faintly from
     within, and identified prospects drawn as dark marks on lime. */
  refined: system({
    core: "#072929",
    rim: "#B1FA63",
    glyph: "#B1FA63",
    field: "#133536",
    lines: "#072929",
    active: "#0AA2BF",
    activeTint: "#06B6D4",
    labelBg: "#FF7A1A",
    labelText: "#ffffff",
    labelDot: "#ffffff",
    done: "#5DBB1E",
    doneTint: "#B1FA63",
    fieldGlow: "#22D3EE",
    doneAsMark: true,
  }),
};

/* E, refined, is the system the variation ships with. */
export const LIGHT = DIRECTIONS.refined;

export default function OrbitLight() {
  return <OrbitScene theme={LIGHT} />;
}
