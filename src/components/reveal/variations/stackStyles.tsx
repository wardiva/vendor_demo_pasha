import { useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import { ContactStackModal } from "@/components/reveal/ContactStack";
import type { ProspectContact } from "@/data/prospects";
import { RevealCta, revealAllCountLabel, type RevealPanelProps } from "./parts";

/**
 * Eight stacks, one interaction.
 *
 * Every one of these is the same deck doing the same thing: the company's
 * contacts held as one object, the front card carrying the reveal, a press
 * dealing the next contact once they are open. What differs is only how the
 * depth is drawn — and the point of having eight is that depth has more than
 * one mechanism available to it, and they are not interchangeable.
 *
 * The rules they all keep:
 *
 *   The row is 310 x 59 and never grows. A prospect list that changed height
 *   between a one-contact company and a three-contact one would reflow as you
 *   scanned it, so depth is spent on width and surface, never on height.
 *
 *   Nothing is drawn behind the front card but a flat panel. The cards behind
 *   carry no contact — only the front one is ever read — which is what keeps
 *   a stack a stack rather than three overlapping cards competing to be read.
 *
 *   No counts. Whatever the stack says about how many contacts there are, it
 *   says by looking like more than one thing, not by printing a number.
 *
 *   The blur, the hover stroke and the reveal are ContactPreviewCard's and
 *   useCompanyRevealFlow's, untouched — these are the same components the
 *   shipped design renders, arranged differently.
 *
 * A company with one contact draws one card in every one of them. A stack of
 * one is not a stack, and dressing a lone card up as one would be the panel
 * lying about the company.
 */

export type StackStyle =
  | "colored"
  | "spine"
  | "elevated"
  | "fanned"
  | "stepped"
  | "underlay"
  | "fold"
  | "rail";

/* ── the envelope ──
   The row's own box, and the front card's. Everything below is expressed
   against these so no treatment can quietly grow the row.

   Measured, not assumed: the stack sits in a 67px prospect card with 4px of
   room above it, 4px below and 4px to the right before the card's own rounded
   edge — and 684px of empty gutter to the left. So depth can be spent freely
   leftward and in slivers of 4 up or down, and nowhere else. Every geometry
   below stays inside that; the ones that reach up or down stop at 4. */
const PANEL_W = 310;
const CARD_H = 59;
const ROOM_Y = 4;

/* One curve for every move, the one the shipped stack uses. */
const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
const DUR = 300;
const MOVE = `transform ${DUR}ms ${EASE}, width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, top ${DUR}ms ${EASE}, box-shadow ${DUR}ms ${EASE}, z-index ${DUR}ms ${EASE}`;

/* ── the product's ink, at the weights a background can carry ──
   The accents are all one hue — the product's own #072929 — held at single
   figures so they read as depth rather than as decoration. A stack that
   announces itself in colour is competing with the intent chip and the
   verified mark, which are the two things on the row that have earned it. */
const TEAL = "7,41,41";
const teal = (a: number) => `rgba(${TEAL},${a})`;
const PAPER = "#ffffff";

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

/**
 * Where a layer sits, and what it is filled with.
 *
 * `slot` is depth from the front — 0 is the card being read. Each style
 * answers the same question a different way, and the comment on each is the
 * mechanism it is testing rather than a description of the numbers.
 */
type Layer = {
  /** Geometry, applied to the absolutely-positioned layer box. */
  box: CSSProperties;
  /** What fills a layer behind the front card. Slot 0 draws the contact. */
  fill?: CSSProperties;
};

const LAYERS: Record<StackStyle, (slot: number, open: boolean, total: number) => Layer> = {
  /* ── 1 · Colored stack ──
     The shipped geometry, given a hue. The layers behind step left and darken
     in the product's own ink rather than in neutral grey, and the deepest edge
     carries a 2px accent — so the stack reads as one object with a spine
     instead of three grey slivers that happen to be adjacent. Colour is doing
     the separating here, which is why nothing else about the geometry moved:
     this is the control for the other seven. */
  colored: (slot, open) => ({
    box: {
      width: PANEL_W,
      height: CARD_H - slot * 5,
      top: slot * 3,
      transform: `translateX(${-slot * (open ? 7 : 6)}px)`,
    },
    fill: {
      background: slot === 1 ? teal(0.055) : teal(0.095),
      borderLeft: slot === 2 ? `2px solid ${teal(0.28)}` : undefined,
    },
  }),

  /* ── 2 · Bound spine ──
     Depth by binding rather than by offset. The layers barely step — four
     pixels, not six — and what says "more than one" is the solid rule down the
     left edge holding them, the way a spine holds pages. It is the most
     compact of the eight: the stack costs eight pixels of gutter instead of
     twelve, and still reads, because a bound edge is a stronger signal than a
     wider fan. */
  spine: (slot, open) => ({
    box: {
      width: PANEL_W,
      height: CARD_H - slot * 3,
      top: slot * 2,
      transform: `translateX(${-slot * (open ? 5 : 4)}px)`,
    },
    fill: {
      background: slot === 1 ? "#f2f1ef" : "#e9e7e4",
      borderLeft: `3px solid ${teal(slot === 1 ? 0.5 : 0.75)}`,
    },
  }),

  /* ── 3 · Elevated ──
     No edge at all. The layers sit exactly behind the front card and are
     never seen as cards — what shows is their shadow, falling below it and
     deepening with every card added. So the stack is read as weight rather
     than as outline, and the cleanest silhouette of the eight.

     The front card carries only its own hairline of shadow. That is not a
     detail: the first draft gave it the stack's full shadow too, and a lone
     one-contact card then looked exactly like a deck of three — the one thing
     every variation here must not do. The depth has to come from the layers,
     so a card with none behind it is plainly one card. */
  elevated: slot => ({
    box: {
      width: PANEL_W,
      height: CARD_H,
      top: 0,
      transform: "none",
      boxShadow:
        slot === 0
          ? `0 1px 1.5px ${teal(0.06)}`
          : `0 ${slot * 2 + 1}px ${slot * 3 + 3}px -2px ${teal(0.1 + slot * 0.04)}`,
    },
    fill: { background: PAPER },
  }),

  /* ── 4 · Fanned ──
     Angular depth. The layers turn about their bottom-right corner, so their
     left ends lift and spread — the stack reads as cards held in a hand rather
     than filed in a drawer. A small angle is enough and a large one is not
     available: a 310-wide card turned 2° lifts its far end eleven pixels, and
     there are four above the row. So the layers are shortened first, which
     buys the room to turn, and the angle stops where the lift meets the row's
     edge. Rotation is the one mechanism here that is legible even at a degree
     — a tilt reads at a glance where six pixels of edge does not. */
  fanned: (slot, open) => ({
    box: {
      width: PANEL_W,
      height: CARD_H - slot * 5,
      top: slot * 3,
      transform: `translateX(${-slot * (open ? 5 : 4)}px) rotate(${slot * (open ? 1 : 0.9)}deg)`,
      transformOrigin: "100% 100%",
    },
    fill: {
      background: slot === 1 ? "#f4f2f0" : "#edebe8",
      border: `1px solid ${PAPER}`,
    },
  }),

  /* ── 5 · Stepped ──
     The opposite argument to the spine: if the stack is worth showing, show
     it. Ten pixels a layer instead of six, each with its own rim and shadow,
     so the three edges are unmistakably three. Spacious rather than dense,
     and the one to compare against 2 — the pair are the same idea at opposite
     settings, which is the only honest way to find where the line is. */
  stepped: (slot, open) => ({
    box: {
      width: PANEL_W,
      height: CARD_H - slot * 6,
      top: slot * 4,
      transform: `translateX(${-slot * (open ? 11 : 10)}px)`,
      boxShadow: slot > 0 ? `-1px 1px 3px ${teal(0.07)}` : undefined,
    },
    fill: {
      background: slot === 1 ? "#f5f3f1" : "#eeecea",
      border: `1px solid ${PAPER}`,
    },
  }),

  /* ── 6 · Underlay ──
     Vertical depth only. The layers do not step sideways at all — they drop,
     two pixels each, so their bottom edges show as thin bands under the front
     card the way a pad of paper does. It is the one treatment that leaves the
     card's left edge entirely alone, so the avatar is never crowded, and it
     spends none of the gutter. What it spends instead is the row's four
     pixels below, all of them — which is why it stops at two layers deep of
     visible edge however many contacts there are. */
  underlay: slot => ({
    box: {
      width: PANEL_W - slot * 8,
      height: CARD_H,
      top: Math.min(slot * 2, ROOM_Y),
      transform: `translateX(${-slot * 4}px)`,
    },
    /* No inset rule at the foot. The first draft drew a white line along each
       layer's bottom edge to separate the bands, and with only two pixels of
       band showing it erased half of every one. The front card's own edge is
       the separation; the fill just has to be dark enough to be seen. */
    fill: { background: slot === 1 ? "#e4e2de" : "#d6d3cf" },
  }),

  /* ── 7 · Corner fold ──
     Diagonal depth. The layers step up and left together, so they surface at
     the top-left corner only and the card's own left edge stays clean — the
     stack is a corner lifted rather than a side exposed. It puts the cue
     where a reader's eye enters the row, which is the argument for it; it
     also puts it next to the avatar, which is the argument against. The rise
     stops at the row's four pixels above. */
  fold: (slot, open) => ({
    box: {
      width: PANEL_W,
      height: CARD_H - slot * 2,
      top: -Math.min(slot * 2, ROOM_Y),
      transform: `translateX(${-slot * (open ? 5 : 4)}px)`,
    },
    /* A corner is a small target, so the edges that make it do the work: a
       hairline along the top and the left in the product's ink, where the
       first draft had a grey fill alone and the fold barely registered. */
    fill: {
      background: slot === 1 ? "#ebe9e6" : "#dfddd9",
      borderTop: `1px solid ${teal(0.14)}`,
      borderLeft: `1px solid ${teal(0.14)}`,
    },
  }),

  /* ── 8 · Variant rail ──
     The layers are gone. In their place is a rail down the left edge divided
     into one segment per contact, each carrying that person's own status
     colour — so the stack's depth and the make-up of what is in it are the
     same mark. It is the only one that says something about *who* is behind
     the card rather than just how much, and the only one whose cue is exact
     without being a number. */
  rail: slot => ({
    box: {
      width: PANEL_W,
      height: CARD_H,
      top: 0,
      transform: "none",
      opacity: slot === 0 ? 1 : 0,
      pointerEvents: slot === 0 ? undefined : "none",
    },
  }),
};

/** 8 draws its own chrome rather than layers; the rest do not. */
const RAIL_W = 3;

function VariantRail({ contacts }: { contacts: ProspectContact[] }) {
  /* One segment a contact, in the colour that contact's own tag carries, so
     the rail is a legend for the deck rather than a decoration on it. */
  const tone = (v: ProspectContact["variant"]) =>
    v === "recommended" ? "#b1fa63" : v === "verified" ? "#8c57ff" : teal(0.35);
  return (
    <span
      aria-hidden
      className="absolute overflow-hidden rounded-[100px]"
      style={{ left: -8, top: 4, bottom: 4, width: RAIL_W, zIndex: 5 }}
    >
      <span className="flex h-full w-full flex-col">
        {contacts.map((c, i) => (
          <span
            key={c.name}
            className="w-full flex-1"
            style={{ background: tone(c.variant), marginTop: i === 0 ? 0 : 2 }}
          />
        ))}
      </span>
    </span>
  );
}

function StackLayer({
  contact,
  flow,
  slot,
  count,
  open,
  style,
  onSelect,
  label,
}: {
  contact: ProspectContact;
  flow: ReturnType<typeof useCompanyRevealFlow>;
  slot: number;
  count: number;
  open: boolean;
  style: StackStyle;
  onSelect: () => void;
  label: string;
}) {
  const front = slot === 0;
  const layer = LAYERS[style](slot, open, count);

  const select = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-copy-row]") || target.closest(".lead-copy-icon")) return;
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      role={open ? "button" : undefined}
      tabIndex={open ? 0 : undefined}
      aria-pressed={open ? front : undefined}
      aria-label={open ? label : undefined}
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
      className={`absolute rounded-[12px] ${open ? "cursor-pointer" : ""}`}
      style={{
        right: 0,
        overflow: "hidden",
        transition: MOVE,
        zIndex: count - slot,
        ...layer.box,
      }}
    >
      {front ? (
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
      ) : (
        /* A layer behind carries no contact — see the note at the top of the
           file on why only the front card is ever read. */
        <span aria-hidden className="absolute inset-0 rounded-[12px]" style={layer.fill} />
      )}
    </div>
  );
}

export default function StackStyleVariation({
  style,
  ...props
}: RevealPanelProps & { style: StackStyle }) {
  const { company, contacts } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;
  const [cut, setCut] = useState(0);

  useEffect(() => {
    setCut(0);
  }, [company, count]);

  /* The modal has its own geometry and its own node; these eight are about the
     prospect row, so the Contacts tab keeps the shipped stack whichever one is
     being looked at. */
  if (props.layout === "modal") {
    return <ContactStackModal company={company} contacts={contacts} />;
  }
  if (!count) return null;

  const start = open ? cut % count : 0;
  const slotOf = (i: number) => (i - start + count) % count;

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ width: PANEL_W, height: CARD_H }}
      data-name="Contact Stack"
      data-stack-style={style}
    >
      {contacts.map((contact, i) => (
        <StackLayer
          key={contact.name}
          contact={contact}
          flow={flow}
          slot={slotOf(i)}
          count={count}
          open={open}
          style={style}
          onSelect={() => setCut(c => (c + (slotOf(i) === 0 ? 1 : slotOf(i))) % count)}
          label={
            slotOf(i) === 0
              ? count > 1
                ? "Show the next contact"
                : contact.name
              : `Show ${contact.name}`
          }
        />
      ))}

      {/* 8 replaces the layers with a rail, so it is the one style that draws
          something the loop above does not. */}
      {style === "rail" && count > 1 && <VariantRail contacts={contacts} />}

      {/* The stack's size is a fact a screen reader cannot see, and none of
          these draw a number. It is stated once, here. */}
      {count > 1 && <span className="sr-only">{`${count} contacts at this company`}</span>}
    </div>
  );
}
