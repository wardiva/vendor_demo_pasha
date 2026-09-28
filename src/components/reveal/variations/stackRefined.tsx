import { useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import { ContactStackModal } from "@/components/reveal/ContactStack";
import type { ProspectContact } from "@/data/prospects";
import { RevealCta, revealAllCountLabel, type RevealPanelProps } from "./parts";

/**
 * Eight finished stacks.
 *
 * The brief these answer, in the order it binds them:
 *
 *   Left only. Every layer is anchored at the main card's right edge and only
 *   ever moves left, so its own right edge is always hidden behind the main
 *   card. Nothing protrudes to the right, up or down — layers are drawn inside
 *   the main card's own height, so the stack costs the row no vertical room
 *   and the right edge of the column stays a straight line down the page.
 *
 *   Compact. Steps of five to eight pixels, never more, and never more than
 *   three layers drawn however many contacts there are. The stack is a
 *   property of the card, not a second object beside it.
 *
 *   One palette, the product's. Deep teal #072929 is the product's own ink
 *   and primary; the sage #dde8e5 is the page every card already sits on;
 *   lime #b1fa63 is the brand's accent and is used once. The intent-band
 *   greens are deliberately absent — a stack drawn in the colours of an intent
 *   score would be read as one.
 *
 *   No numbers. The stack says "more than one" by being more than one layer.
 *   A company with one contact is one card, with nothing behind it.
 *
 *   The card itself is untouched. Blur, hover stroke, reveal CTA, tags and the
 *   reveal animation all come from ContactPreviewCard and useCompanyRevealFlow,
 *   exactly as the shipped stack uses them. What each variation adds is the
 *   layers behind, and at most a stroke or shadow on the main card's edge.
 */

export type RefinedStack =
  | "sage"
  | "teal"
  | "lime"
  | "outline"
  | "elevated"
  | "gradient"
  | "tabs"
  | "staircase";

const PANEL_W = 310;
const H = 59;
/** Drawn layers behind the main card, at most. */
const MAX_DEPTH = 3;

const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
const DUR = 300;
const MOVE = [
  "transform",
  "height",
  "top",
  "box-shadow",
  "z-index",
]
  .map(p => `${p} ${DUR}ms ${EASE}`)
  .join(", ");

/* ── the product's colour, at the weights a surface can carry ── */
const teal = (a: number) => `rgba(7,41,41,${a})`;
const ink = (a: number) => `rgba(47,43,61,${a})`;
const WHITE = "#ffffff";

const TAG_SEALED = {
  size: 8.5,
  labelSize: 9.5,
  medium: true,
  durationMs: DUR,
  className: "absolute right-[8px] top-[3px] transition-[right] duration-[300ms] ease-[cubic-bezier(0.4,0.05,0.2,1)]",
};
const TAG_OPEN = {
  size: 9.5,
  durationMs: DUR,
  className: "absolute right-[10px] top-[3px] transition-[right] duration-[300ms] ease-[cubic-bezier(0.4,0.05,0.2,1)]",
};

/* ── layer geometry ──
   k is depth behind the main card, 1 to MAX_DEPTH. Every shape keeps the layer
   inside the main card's own vertical extent, so only its left strip shows. */
type Geom = (k: number) => { top: number; height: number };
/** Shorter and centred: the stack recedes evenly into the card. */
const centred = (inset: number): Geom => k => ({ top: k * inset, height: H - 2 * k * inset });
/** Shorter and anchored to the foot: the layers descend like steps. */
const footed = (drop: number): Geom => k => ({ top: k * drop, height: H - k * drop });
/** The main card's full height: the layers read as a solid block of pages. */
const full: Geom = () => ({ top: 0, height: H });

type Spec = {
  /** Pixels each layer steps left while sealed; one more once opened. */
  step: number;
  geom: Geom;
  /** Layer corner radius. */
  radius?: string;
  /** The layer's face. `depth` is how many layers this deck draws. */
  face: (k: number, depth: number) => CSSProperties;
  /** A shadow cast by the layer box itself. */
  layerShadow?: (k: number) => string;
  /** What the main card's edge carries while it has layers behind it. */
  front?: { ring?: string; shadow?: string };
};

const SPECS: Record<RefinedStack, Spec> = {
  /* ── 1 · Sage steps ──
     Stepped, kept from the earlier study's structure and redrawn in the
     page's own sage. Three tints stepping darker as they recede, each with a
     1px white highlight on its exposed edge and a hairline of teal around it,
     so every layer is a crisp card rather than a smudge of grey. It is the one
     that looks most like it was always part of the product, because its
     colour is the page's. */
  sage: {
    step: 7,
    geom: centred(4),
    face: k => ({
      background: ["#e8f0ed", "#d5e4df", "#c3d8d1"][k - 1],
      border: `1px solid ${teal(0.08 + k * 0.03)}`,
      boxShadow: "inset 1px 0 0 rgba(255,255,255,0.85)",
    }),
    front: { ring: `1px solid ${teal(0.1)}` },
  },

  /* ── 2 · Deep teal ──
     Contrast as the cue. The layers are the product's own dark teal, deeper as
     they recede, so a narrow six-pixel edge reads instantly against the light
     card — the stack is visible from across the table. A faint highlight on
     each edge keeps the dark from going flat. Of the eight this is the
     boldest, and the one to check against a full page of rows. */
  teal: {
    step: 6,
    geom: centred(5),
    face: k => ({
      background: ["#3b6a66", "#224f4c", "#123a38"][k - 1],
      boxShadow: "inset 1px 0 0 rgba(255,255,255,0.16)",
    }),
    front: { ring: `1px solid ${teal(0.16)}` },
  },

  /* ── 3 · Lime edge ──
     Neutral layers, one accent. White cards with ink hairlines, and the
     outermost exposed edge alone carries a 3px band of the brand lime — the
     spine of the deck. Because it sits on the deepest layer, its distance from
     the main card grows with the stack, so the accent says "how deep" without
     ever being a number. The only variation that uses the lime, and it uses it
     once. */
  lime: {
    step: 6,
    geom: centred(4),
    face: (k, depth) => ({
      background: WHITE,
      border: `1px solid ${ink(0.13)}`,
      boxShadow: k === depth ? "inset 3px 0 0 #a3ec52" : undefined,
    }),
    front: { ring: `1px solid ${ink(0.11)}` },
  },

  /* ── 4 · Editorial outline ──
     Line, not fill. Every layer is white, drawn by its stroke alone in the
     product's teal, the main card's strongest and each layer fainter behind —
     the stack as nested rules, the way a well-set editorial page separates
     columns. Tight five-pixel steps and a single soft shadow under the main
     card keep it from reading as a wireframe: the lines are finished, and
     there are only as many as there are cards. */
  outline: {
    step: 5,
    geom: centred(3),
    face: k => ({
      background: WHITE,
      border: `1px solid ${teal([0.24, 0.16, 0.1][k - 1])}`,
    }),
    front: { ring: `1px solid ${teal(0.3)}`, shadow: `0 1px 3px ${teal(0.08)}` },
  },

  /* ── 5 · Elevated ──
     Depth as light. Near-white layers, each casting its own soft shadow to
     the left, and the main card lifted above them with a longer one — the
     stack reads as physical cards on a surface. Every shadow is thrown left
     and down, never right, so the right edge of the column stays clean. */
  elevated: {
    step: 6,
    geom: centred(3),
    face: k => ({ background: ["#ffffff", "#f6f8f7", "#eef1f0"][k - 1] }),
    layerShadow: () => `-2px 1px 5px -1px ${teal(0.16)}`,
    front: { shadow: `-4px 2px 10px -3px ${teal(0.24)}, 0 1px 2px ${teal(0.06)}` },
  },

  /* ── 6 · Brand gradient ──
     Colour that fades into the card. Each layer runs from a sage tint at its
     exposed edge to near-white under the main card, so the stack glows faintly
     from the left and dissolves toward the contact — colour where the eye
     finds the edge, none where it reads the name. Eight-pixel steps give the
     gradient room to be seen. */
  gradient: {
    step: 8,
    geom: centred(3),
    face: k => ({
      background: `linear-gradient(90deg, ${["#c7e0d7", "#afd2c5", "#98c4b4"][k - 1]} 0px, #edf5f2 14px, #f5f9f7 100%)`,
      border: "1px solid rgba(255,255,255,0.95)",
    }),
    front: { ring: `1px solid ${teal(0.09)}` },
  },

  /* ── 7 · Index tabs ──
     Full-height layers, contiguous, each separated from the one in front by a
     crisp white line — the stack as a block of filed cards seen edge-on. No
     layer is shorter than the main card, so the left edge of the deck is a
     solid band of stepped sage-to-teal tints rather than a set of slivers.
     The most architectural of the eight. */
  tabs: {
    step: 6,
    geom: full,
    radius: "10px",
    face: k => ({ background: ["#dae8e3", "#bfd6ce", "#a4c4b9"][k - 1] }),
    layerShadow: () => "-1.5px 0 0 0 #ffffff",
    front: { shadow: "-1.5px 0 0 0 #ffffff" },
  },

  /* ── 8 · Staircase ──
     The layers are anchored to the foot and shortened from the top, so their
     exposed edges descend like stair treads, each capped with a thin teal
     ledge. The silhouette is asymmetric where every other variation is
     centred, and it keeps the top-left corner — where the eye enters the row
     and the avatar sits — completely clear. */
  staircase: {
    step: 7,
    geom: footed(6),
    face: k => ({
      background: ["#edf3f1", "#dbe7e3", "#c8dbd5"][k - 1],
      border: `1px solid ${teal(0.1)}`,
      boxShadow: `inset 0 2px 0 ${teal(0.18)}`,
    }),
    front: { ring: `1px solid ${teal(0.1)}` },
  },
};

function Layer({
  contact,
  flow,
  slot,
  count,
  depth,
  open,
  kind,
  onSelect,
  label,
}: {
  contact: ProspectContact;
  flow: ReturnType<typeof useCompanyRevealFlow>;
  slot: number;
  count: number;
  /** Layers this deck draws behind the main card. */
  depth: number;
  open: boolean;
  kind: RefinedStack;
  onSelect: () => void;
  label: string;
}) {
  const spec = SPECS[kind];
  const front = slot === 0;
  /* Anything past the drawn depth sits exactly behind the deepest drawn
     layer, so a fourth or fifth contact never widens the stack. */
  const k = Math.min(slot, MAX_DEPTH);
  const step = spec.step + (open ? 1 : 0);
  const g = front ? { top: 0, height: H } : spec.geom(k);
  const stacked = depth > 0;

  const select = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-copy-row]") || target.closest(".lead-copy-icon")) return;
    e.stopPropagation();
    onSelect();
  };

  const box: CSSProperties = {
    width: PANEL_W,
    right: 0,
    top: g.top,
    height: g.height,
    /* Left only: every layer is anchored at the right and moved left. */
    transform: `translateX(${-k * step}px)`,
    borderRadius: front ? 12 : spec.radius ?? 12,
    overflow: "hidden",
    transition: MOVE,
    zIndex: count - slot,
    boxShadow: front ? (stacked ? spec.front?.shadow : undefined) : spec.layerShadow?.(k),
  };

  return (
    <div
      role={open ? "button" : undefined}
      tabIndex={open ? 0 : undefined}
      aria-pressed={open ? front : undefined}
      aria-label={open ? label : undefined}
      aria-hidden={!front && !open ? true : undefined}
      onClick={open ? select : undefined}
      onKeyDown={
        open
          ? (e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
      data-contact-select={open ? "" : undefined}
      className={`absolute ${open ? "cursor-pointer" : ""}`}
      style={box}
    >
      {front ? (
        <>
          <ContactPreviewCard
            variant={contact.variant}
            avatar={contact.avatar}
            name={contact.name}
            jobTitle={contact.jobTitle}
            phone={contact.phone}
            email={contact.email}
            locked={flow.locked}
            settled={flow.settled}
            onRevealRequest={flow.reveal}
            layout="prospect"
            frame
            tag={flow.locked ? TAG_SEALED : TAG_OPEN}
            className="w-full"
            reveal={
              flow.locked ? (
                <RevealCta
                  flow={flow}
                  count={count}
                  label={revealAllCountLabel(count)}
                  size="sm"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]"
                />
              ) : undefined
            }
          />
          {/* The main card's edge, only when it has something behind it — a
              lone card is drawn exactly as the product draws one. */}
          {stacked && spec.front?.ring && (
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-[12px]"
              style={{ border: spec.front.ring, zIndex: 6 }}
            />
          )}
        </>
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 box-border"
          style={{ borderRadius: "inherit", ...spec.face(k, depth) }}
        />
      )}
    </div>
  );
}

export default function RefinedStackVariation({
  kind,
  ...props
}: RevealPanelProps & { kind: RefinedStack }) {
  const { company, contacts } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;
  const [cut, setCut] = useState(0);

  useEffect(() => {
    setCut(0);
  }, [company, count]);

  /* These are studies of the prospect row. The Contacts tab keeps the shipped
     stack whichever one is selected. */
  if (props.layout === "modal") return <ContactStackModal company={company} contacts={contacts} />;
  if (!count) return null;

  const depth = Math.min(count - 1, MAX_DEPTH);
  const start = open ? cut % count : 0;
  const slotOf = (i: number) => (i - start + count) % count;

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ width: PANEL_W, height: H }}
      data-name="Contact Stack"
      data-refined-stack={kind}
    >
      {contacts.map((contact, i) => {
        const slot = slotOf(i);
        return (
          <Layer
            key={contact.name}
            contact={contact}
            flow={flow}
            slot={slot}
            count={count}
            depth={depth}
            open={open}
            kind={kind}
            onSelect={() => setCut(c => (c + (slot === 0 ? 1 : slot)) % count)}
            label={slot === 0 ? (count > 1 ? "Show the next contact" : contact.name) : `Show ${contact.name}`}
          />
        );
      })}
      {count > 1 && <span className="sr-only">{`${count} contacts at this company`}</span>}
    </div>
  );
}
