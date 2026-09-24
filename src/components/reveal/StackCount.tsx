import { useSyncExternalStore } from "react";

/**
 * How many cards are in the stack, said on the stack.
 *
 * The row already answers "who is this contact" on the face of the front card
 * and "what will it cost" on the reveal button. What it has never answered is
 * how much is behind the card you are looking at — a two-contact company and a
 * three-contact company differ by six pixels of exposed edge, which is not a
 * quantity anyone reads. The count says it outright.
 *
 * Four rules constrain every treatment here, and they are why none of them is
 * simply a number in the corner of the card:
 *
 *   It belongs to the stack, not the contact. Anything that sits inside the
 *   front card's content area reads as a fact about that person. So every
 *   variation anchors to the exposed left edge, the stack's own geometry, or
 *   the card's outer corner — never its interior.
 *
 *   It is not a price. The row already carries an intent score, a reveal
 *   allowance and a "Reveal contacts" button, and a lone number in a coloured
 *   pill would be read as one of those. Nothing here uses the product's lime,
 *   its live ink or its band colours; the count is neutral grey or plain ink,
 *   which is what the rest of the app puts behind a small quantity.
 *
 *   It survives the reveal. The count is the size of the deck, not the number
 *   of things still sealed, so it does not change or disappear when the cards
 *   open — it only shifts with the stack, whose step widens from 6 to 7.
 *
 *   It costs no height. The row is 59px whatever a company holds, and that is
 *   load-bearing: the prospect table does not reflow between a one-contact
 *   company and a three-contact one. Everything here is absolutely positioned
 *   inside the existing 310 x 59 panel, mostly in the left gutter the stack
 *   already overhangs into.
 *
 * One card shows nothing. A "1" on a single card is not a count, it is a label
 * for a quantity nobody was wondering about.
 */

/* ── tokens ──
   Deliberately drab. See the second rule above: the count competes with three
   coloured things already on the row, so it wins by not entering. */
const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const FAINT = "rgba(47,43,61,0.45)";
const HAIR = "rgba(47,43,61,0.16)";
/** The neutral the app puts behind a small value — the intent score's own chip. */
const CHIP = "#eeedf0";
/** The row is white; a chip on the stack's edge needs to sit on something. */
const PAPER = "#ffffff";

/* ── the stack's geometry, from ContactStack ──
   Repeated rather than imported because these are the numbers the count is
   positioned against, and a treatment that silently moved when the stack was
   restyled would be worse than one that visibly disagreed with it. */
const CARD_H = 59;
const STEP_SEALED = 6;
const STEP_OPEN = 7;
const DROP = 3;
const SHRINK = 5;

export type StackCountGeometry = {
  count: number;
  open: boolean;
  /** How far apart the layers step, which widens when the deck opens. */
  step: number;
  /** x of the deepest layer's left edge, relative to the panel. Negative. */
  edge: number;
  /** y of the deepest layer's top, and of its bottom. */
  backTop: number;
  backBottom: number;
};

const geometryOf = (count: number, open: boolean): StackCountGeometry => {
  const step = open ? STEP_OPEN : STEP_SEALED;
  const back = count - 1;
  return {
    count,
    open,
    step,
    edge: -back * step,
    backTop: back * DROP,
    backBottom: back * DROP + (CARD_H - back * SHRINK),
  };
};

/** Every treatment moves with the stack, so they all share one transition. */
const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
const MOVE = `left 300ms ${EASE}, top 300ms ${EASE}, height 300ms ${EASE}`;

/* ── the ten ───────────────────────────────────────────────────────── */

type Treatment = {
  id: number;
  name: string;
  /** What it is trying, in one line, for the picker. */
  note: string;
  render: (g: StackCountGeometry) => React.ReactNode;
};

/** The numeral itself, at the one size all ten agree on. */
function Numeral({
  children,
  size = 10,
  color = INK,
  weight = 600,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
}) {
  return (
    <span
      className="font-['Inter',sans-serif] tabular-nums"
      style={{ fontSize: size, lineHeight: `${size + 2}px`, color, fontWeight: weight }}
    >
      {children}
    </span>
  );
}

export const STACK_COUNT_TREATMENTS: readonly Treatment[] = [
  /* ── 1 ── */
  {
    id: 1,
    name: "Figma 32:1414",
    note: "The design's own: 20px disc on the stack's top-left shoulder",
    render: g => (
      /* `Frame 2147225056` in the design, and the values are its own: 20 x 20,
         #eeedf0 behind a 2px white ring at a full radius, the numeral 10px
         Semi Bold in the card's ink.

         Its position is the part worth reading twice. Every one of the eight
         stacks in the node puts it at x 677 — against a three-card stack that
         starts at 672 and a two-card stack that starts at 678 — so it is not
         pinned to the back layer, whose x moves with the count. It is pinned
         to the front card, seven pixels out from its left edge and level with
         its top, and that is what keeps it still: the shoulder of the stack
         is in the same place whether the deck holds two cards or three. */
      <span
        className="absolute flex items-center justify-center rounded-[100px]"
        style={{
          left: -7,
          top: 0,
          width: 20,
          height: 20,
          background: CHIP,
          border: `2px solid ${PAPER}`,
        }}
      >
        <Numeral>{g.count}</Numeral>
      </span>
    ),
  },

  /* ── 2 ── */
  {
    id: 2,
    name: "Corner chip",
    note: "The same chip, tucked into the front card's outer bottom-left corner",
    render: g => (
      /* The corner is the quietest part of the card — the avatar is left of
         centre but above this, the channels run right. It is on the card's
         outer edge rather than inside its padding, so it still reads as
         attached to the stack rather than to the person. */
      <span
        className="absolute flex items-center justify-center rounded-[100px]"
        style={{
          left: -8,
          top: CARD_H - 8,
          transform: "translateY(-50%)",
          height: 16,
          minWidth: 16,
          padding: "0 4px",
          background: CHIP,
          boxShadow: `0 0 0 2px ${PAPER}`,
          transition: MOVE,
        }}
      >
        <Numeral>{g.count}</Numeral>
      </span>
    ),
  },

  /* ── 3 ── */
  {
    id: 3,
    name: "Layer rail",
    note: "One mark per card down the edge, with the total at its head",
    render: g => (
      /* The only one that draws the quantity as well as stating it: three
         marks for three cards, so the number is a caption on something the
         eye has already counted. It is also the only one that would still
         say "three" with the numeral removed. */
      <span
        className="absolute flex flex-col items-center"
        style={{
          left: g.edge - 9,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          gap: 3,
          transition: MOVE,
        }}
      >
        <Numeral size={9} color={MUTED}>
          {g.count}
        </Numeral>
        <span className="flex flex-col items-center" style={{ gap: 2 }}>
          {Array.from({ length: g.count }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="block rounded-[1px]"
              style={{ width: 6, height: 2, background: i === 0 ? MUTED : HAIR }}
            />
          ))}
        </span>
      </span>
    ),
  },

  /* ── 4 ── */
  {
    id: 4,
    name: "Folder tab",
    note: "A tab off the top of the deepest layer, the way a file names itself",
    render: g => (
      /* Borrowed from the one object everybody already reads as "a stack of
         things with a count": the tabbed folder. It sits above the back card's
         top edge, which is 6px of clear space the front card is not using. */
      <span
        className="absolute flex items-center justify-center"
        style={{
          left: g.edge,
          top: g.backTop - 9,
          height: 13,
          minWidth: 17,
          padding: "0 4px",
          background: CHIP,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          transition: MOVE,
        }}
      >
        <Numeral size={9} color={MUTED}>
          {g.count}
        </Numeral>
      </span>
    ),
  },

  /* ── 5 ── */
  {
    id: 5,
    name: "Outlined spine chip",
    note: "Variation 1 as a hairline ring — the same anchor, less ink",
    render: g => (
      /* The fill in 1 is a small solid block on a white row, and on a table of
         nineteen rows nineteen of them make a column. A ring holds the same
         shape and puts almost nothing on the page. */
      <span
        className="absolute flex items-center justify-center rounded-[100px]"
        style={{
          left: g.edge - 3,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          height: 16,
          minWidth: 16,
          padding: "0 4px",
          background: PAPER,
          border: `1px solid ${HAIR}`,
          transition: MOVE,
        }}
      >
        <Numeral color={MUTED}>{g.count}</Numeral>
      </span>
    ),
  },

  /* ── 6 ── */
  {
    id: 6,
    name: "Multiplier",
    note: "×3 in the gutter — a quantity of the thing, not a number on it",
    render: g => (
      /* "3" alone is ambiguous on a row that also carries a score and an
         allowance. The multiplication sign resolves it before the digit is
         read: this many of what you are looking at. No container at all,
         because the glyph is already doing the disambiguating. */
      <span
        className="absolute flex items-baseline"
        style={{
          left: g.edge - 16,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          gap: 0,
          transition: MOVE,
        }}
      >
        <Numeral size={9} color={FAINT} weight={400}>
          ×
        </Numeral>
        <Numeral size={10} color={MUTED}>
          {g.count}
        </Numeral>
      </span>
    ),
  },

  /* ── 7 ── */
  {
    id: 7,
    name: "Layers glyph",
    note: "A stacked-sheets mark with the count beside it",
    render: g => (
      /* Says "cards" in the icon and "how many" in the digit, so neither has
         to carry the whole meaning. The cost is that it is the widest of the
         ten, and width in this gutter is the scarce thing. */
      <span
        className="absolute flex items-center"
        style={{
          left: g.edge - 24,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          gap: 3,
          transition: MOVE,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden className="block shrink-0">
          <rect x="1.5" y="3.5" width="7" height="7" rx="1.5" stroke={FAINT} />
          <path d="M4 3V2.5A1 1 0 0 1 5 1.5h4.5A1 1 0 0 1 10.5 2.5V7a1 1 0 0 1-1 1H9" stroke={FAINT} strokeLinecap="round" />
        </svg>
        <Numeral size={9.5} color={MUTED}>
          {g.count}
        </Numeral>
      </span>
    ),
  },

  /* ── 8 ── */
  {
    id: 8,
    name: "Edge numeral",
    note: "The digit alone in the gutter, no container of any kind",
    render: g => (
      /* The lightest thing that can be done. Nothing is drawn but the number,
         set faint and small, sitting in the space the stack overhangs into.
         Whether it is enough is exactly the question this set is asking. */
      <span
        className="absolute"
        style={{
          left: g.edge - 13,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          transition: MOVE,
        }}
      >
        <Numeral size={10.5} color={FAINT} weight={500}>
          {g.count}
        </Numeral>
      </span>
    ),
  },

  /* ── 9 ── */
  {
    id: 9,
    name: "Edge cap",
    note: "A grey cap closing the stack's exposed edge, numbered",
    render: g => (
      /* Treats the exposed edge as an object rather than as leftover space: a
         bar the full height of the back card, capped round on its outer side,
         with the count set in it. It is the most literal reading of "this is
         the side of a stack" and the most present of the ten. */
      <span
        className="absolute flex items-center justify-center"
        style={{
          left: g.edge - 12,
          top: g.backTop,
          height: g.backBottom - g.backTop,
          width: 14,
          background: CHIP,
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
          transition: MOVE,
        }}
      >
        <Numeral size={9.5} color={MUTED}>
          {g.count}
        </Numeral>
      </span>
    ),
  },

  /* ── 10 ── */
  {
    id: 10,
    name: "Depth dots",
    note: "A dot per card on the edge, the total only on the leading one",
    render: g => (
      /* The quantity is the dots; the numeral is set inside the first of them
         so the two cannot be read as separate claims. Reads as a position
         indicator at a glance, which is the risk — it is a count, not a
         carousel — so the dots are all the same weight. */
      <span
        className="absolute flex flex-col items-center"
        style={{
          left: g.edge - 11,
          top: (g.backTop + g.backBottom) / 2,
          transform: "translateY(-50%)",
          gap: 2,
          transition: MOVE,
        }}
      >
        <span
          className="flex items-center justify-center rounded-[100px]"
          style={{ width: 14, height: 14, background: CHIP }}
        >
          <Numeral size={9} color={INK}>
            {g.count}
          </Numeral>
        </span>
        {Array.from({ length: Math.max(0, g.count - 1) }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className="block rounded-[100px]"
            style={{ width: 4, height: 4, background: HAIR }}
          />
        ))}
      </span>
    ),
  },
];

/* ── which one is showing ───────────────────────────────────────────
   Every stack on the page has to answer with the same treatment, and there is
   one stack per prospect row, so the choice lives outside React and the rows
   subscribe to it. */

const KEY = "stack-count-treatment";
/** Variation 1 — the preferred direction. */
const DEFAULT_ID = 1;

let current = (() => {
  try {
    const stored = Number(sessionStorage.getItem(KEY));
    return STACK_COUNT_TREATMENTS.some(t => t.id === stored) ? stored : DEFAULT_ID;
  } catch {
    return DEFAULT_ID;
  }
})();

const listeners = new Set<() => void>();

export function setStackCountTreatment(id: number) {
  if (id === current) return;
  current = id;
  try {
    sessionStorage.setItem(KEY, String(id));
  } catch {
    /* Storage unavailable — the choice still holds for this render. */
  }
  listeners.forEach(fn => fn());
}

export function useStackCountTreatment() {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
    () => DEFAULT_ID,
  );
}

/**
 * The count, drawn on the stack.
 *
 * Returns nothing below two cards. It is deliberately not `count > 0` — see
 * the note at the top of the file on why a "1" is not a count.
 */
export default function StackCount({ count, open }: { count: number; open: boolean }) {
  const id = useStackCountTreatment();
  if (count < 2) return null;

  const treatment = STACK_COUNT_TREATMENTS.find(t => t.id === id) ?? STACK_COUNT_TREATMENTS[0];

  return (
    /* Above every card in the deck — the cards run to z-index `count`, and the
       count has to clear the deepest layer it is sitting on. Not a pointer
       target: the stack underneath it is the control, and a dead patch over
       the edge of a card you are trying to press would be a bug that looks
       like a misclick. */
    <span
      className="pointer-events-none absolute inset-0 z-[20]"
      aria-hidden
      data-stack-count={count}
    >
      {treatment.render(geometryOf(count, open))}
    </span>
  );
}
