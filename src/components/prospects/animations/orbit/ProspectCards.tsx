import { AnonTile, FONT, IntentChip, maskDomain, useCompanies, type Company } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, pick, seg, useLoopClock } from "./kit";

/**
 * Variation 1 — Original Background: prospect cards and a cursor.
 *
 * Buyer Intelligence at work, shown as a hand at work. At the top, a small
 * deck of companies the product has detected researching your category —
 * still anonymous: a masked domain and the signal that surfaced them. At the
 * foot, the prospects it has identified, stacked.
 *
 * A cursor comes to the deck and rests on the top card, which lifts under it.
 * It presses, and draws the card down — the card tilts with the motion, lifted
 * off the page — and as it travels a thin lime line sweeps across it and the
 * company is revealed: logo, name, intent. It is set down on the prospects
 * stack, settles with a small overshoot, and the cards beneath it step back.
 * Meanwhile the deck closes up and a new detection arrives at its back.
 *
 * The motion is physical rather than decorative — the card lags the cursor,
 * tilts with its speed, lifts when held and settles when let go — the tactile
 * language of drag-to-dismiss cards, used here to mean "detected, then
 * identified". Every position is a pure function of time, so the loop is
 * seamless and the lag and tilt are exact.
 */

export const INK = "#072929";
const MUTE = "rgba(47,43,61,0.62)";
const FAINT = "rgba(47,43,61,0.4)";
const LIME = "#B1FA63";

const PW = 389;
const CARD_W = 316;
const CARD_H = 86;
const CARD_X = (PW - CARD_W) / 2;
const DECK_Y = 124;
const STACK_Y = 372;
const PEEK = 10;

/* The beats of one loop, in ms. */
const T = {
  travel: [0, 1100] as const,
  press: [1350, 1500] as const,
  drag: [1500, 2900] as const,
  reveal: [2000, 2550] as const,
  settle: [2900, 3450] as const,
  arrive: [3100, 3700] as const,
  rest: [3450, 4800] as const,
};
const LOOP = 4800;
const REST = 4200;
const LAG = 70;

type Pt = { x: number; y: number };

const GRAB: Pt = { x: CARD_X + CARD_W - 64, y: DECK_Y + 52 };
const DROP: Pt = { x: CARD_X + CARD_W - 64, y: STACK_Y + 52 };
const REST_AT: Pt = { x: CARD_X + CARD_W - 30, y: STACK_Y + CARD_H + 22 };

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt => {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
};

/** Where the cursor is at time t (ms into the loop). */
function cursorAt(t: number, mode: "carry" | "flick"): Pt {
  const tt = ((t % LOOP) + LOOP) % LOOP;
  if (tt < T.travel[1]) {
    /* Up from where it last set a card down, to the top of the deck. */
    const p = easeInOut(seg(tt, T.travel[0], T.travel[1]));
    return bez(REST_AT, { x: REST_AT.x + 30, y: REST_AT.y - 180 }, { x: GRAB.x + 40, y: GRAB.y + 70 }, GRAB, p);
  }
  if (tt < T.drag[0]) {
    /* Resting on the card, a small settle as it takes hold. */
    const w = Math.sin(seg(tt, T.travel[1], T.drag[0]) * Math.PI) * 1.5;
    return { x: GRAB.x + w, y: GRAB.y + w * 0.5 };
  }
  if (mode === "flick") {
    /* A short, decisive pull, then the hand lets go and drifts off. */
    const pull = easeInOut(seg(tt, T.drag[0], T.drag[0] + 520));
    const pulled = { x: GRAB.x + 26, y: GRAB.y + 92 };
    if (tt < T.drag[0] + 520) return { x: lerp(GRAB.x, pulled.x, pull), y: lerp(GRAB.y, pulled.y, pull) };
    const after = easeInOut(seg(tt, T.drag[0] + 520, LOOP));
    return bez(pulled, { x: pulled.x + 40, y: pulled.y + 60 }, { x: REST_AT.x + 10, y: REST_AT.y - 60 }, REST_AT, after);
  }
  if (tt < T.drag[1]) {
    const p = easeInOut(seg(tt, T.drag[0], T.drag[1]));
    return bez(GRAB, { x: GRAB.x + 46, y: GRAB.y + 90 }, { x: DROP.x + 46, y: DROP.y - 90 }, DROP, p);
  }
  const p = easeInOut(seg(tt, T.rest[0], T.rest[1]));
  return { x: lerp(DROP.x, REST_AT.x, p), y: lerp(DROP.y, REST_AT.y, p) };
}

export function Cursor({ at, pressed }: { at: Pt; pressed: number }) {
  const s = 1 - 0.1 * pressed;
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="absolute"
      style={{
        left: at.x - 3,
        top: at.y - 2,
        zIndex: 40,
        transform: `scale(${s.toFixed(3)})`,
        transformOrigin: "3px 2px",
        filter: "drop-shadow(0px 3px 5px rgba(7,41,41,0.28))",
      }}
    >
      <path d="M3.5 2.5L3.5 17.2L7.4 13.6L10.1 19.6L12.9 18.4L10.3 12.5L15.6 12.3L3.5 2.5Z" fill={INK} stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function AnonBody({ company, signal, lineGap = 0 }: { company: Company; signal: string; /** Space between the title and the masked domain, px. */ lineGap?: number }) {
  return (
    <span className="flex h-full items-center gap-[12px] px-[16px]">
      <AnonTile size={38} radius={10} />
      <span className="flex min-w-0 flex-1 flex-col" style={lineGap ? { gap: lineGap } : undefined}>
        <span className={`${FONT} whitespace-nowrap font-medium leading-[18px] text-[13px]`} style={{ color: "rgba(47,43,61,0.55)" }}>
          Unknown company
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11px] tracking-[0.4px]`} style={{ color: FAINT }}>
          {maskDomain(company.domain)}
        </span>
      </span>
      <span
        className={`${FONT} flex h-[22px] items-center gap-[6px] whitespace-nowrap rounded-[7px] px-[8px] font-medium leading-[14px] text-[10.5px]`}
        style={{ background: "rgba(7,41,41,0.06)", color: INK }}
      >
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        {signal}
      </span>
    </span>
  );
}

function KnownBody({ company }: { company: Company }) {
  return (
    <span className="flex h-full items-center gap-[12px] px-[16px]">
      <span className="relative block size-[38px] shrink-0">
        <img alt="" src={company.logo} className="block size-full rounded-[10px] object-cover" />
        <span className="absolute -bottom-[3px] -right-[3px] flex size-[15px] items-center justify-center rounded-[100px]" style={{ background: LIME, boxShadow: "0 0 0 2px #ffffff" }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 5.2L4.1 7.2L8 3.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`${FONT} truncate font-medium leading-[18px] text-[13.5px]`} style={{ color: INK }}>
          {company.name}
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTE }}>
          {company.industry}
        </span>
      </span>
      <IntentChip score={company.score} />
    </span>
  );
}

const SIGNALS = ["Viewed Pricing", "Viewed Profile", "Viewed Demo", "Viewed Reviews"];

/** A card at rest in a stack: layer 0 on top, deeper layers peek below and recede. */
function layer(y0: number, depth: number) {
  return { y: y0 + depth * PEEK, scale: 1 - depth * 0.05, opacity: depth > 2 ? 0 : 1 - depth * 0.28 };
}

export const shadowFor = (lift: number) =>
  `0 1px 2px 0 rgba(7,41,41,0.06), 0px ${(6 + 16 * lift).toFixed(1)}px ${(18 + 26 * lift).toFixed(1)}px 0px rgba(7,41,41,${(0.08 + 0.1 * lift).toFixed(3)})`;

export default function ProspectCards({ mode = "carry" }: { mode?: "carry" | "flick" }) {
  const companies = useCompanies(80);
  const { t, cycle } = useLoopClock(LOOP, REST);
  if (companies.length < 6) return null;

  const c = (k: number) => pick(companies, k + 1);
  const sig = (k: number) => pick(SIGNALS, k);

  const cursor = cursorAt(t, mode);
  const pressed = mode === "flick"
    ? seg(t, T.press[0], T.press[1]) * (1 - seg(t, T.drag[0] + 480, T.drag[0] + 560))
    : seg(t, T.press[0], T.press[1]) * (1 - seg(t, T.drag[1], T.drag[1] + 120));
  const hover = easeOut(seg(t, T.travel[1] - 250, T.travel[1] + 150));

  /* The card in hand: it follows the cursor a beat late, tilts with the
     cursor's horizontal speed, and is lifted while held. */
  const held = t >= T.drag[0] && t < T.settle[1];
  const grabOffset = { x: GRAB.x - CARD_X, y: GRAB.y - DECK_Y };
  let cardPos = { x: CARD_X, y: DECK_Y };
  let tilt = 0;
  let lift = hover * 0.25;
  if (t >= T.drag[0]) {
    if (mode === "carry" && t < T.drag[1]) {
      const lagged = cursorAt(Math.max(t - LAG, T.drag[0]), mode);
      cardPos = { x: lagged.x - grabOffset.x, y: lagged.y - grabOffset.y };
      const v = cursorAt(t, mode).x - cursorAt(t - 60, mode).x;
      tilt = Math.max(-5, Math.min(5, v * 0.9)) + 1.5 * Math.sin(seg(t, T.drag[0], T.drag[1]) * Math.PI);
      lift = 1;
    } else if (mode === "flick" && t < T.drag[0] + 520) {
      const lagged = cursorAt(Math.max(t - LAG, T.drag[0]), mode);
      cardPos = { x: lagged.x - grabOffset.x, y: lagged.y - grabOffset.y };
      tilt = 3 * seg(t, T.drag[0], T.drag[0] + 520);
      lift = 1;
    } else {
      /* Let go: it travels on to the stack and settles with a small overshoot. */
      const from =
        mode === "carry"
          ? { x: DROP.x - grabOffset.x, y: DROP.y - grabOffset.y - 6 }
          : (() => {
              const r = cursorAt(T.drag[0] + 520 - LAG, mode);
              return { x: r.x - grabOffset.x, y: r.y - grabOffset.y };
            })();
      const start = mode === "carry" ? T.drag[1] : T.drag[0] + 520;
      const end = mode === "carry" ? T.settle[1] : T.settle[1];
      const p = clamp01((t - start) / (end - start));
      const k = mode === "carry" ? 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2) : easeOut(p);
      cardPos = { x: lerp(from.x, CARD_X, k), y: lerp(from.y, STACK_Y, k) };
      tilt = (mode === "carry" ? 1.2 : 3) * (1 - easeOut(p));
      lift = 1 - easeOut(p);
    }
  }
  const revealP = mode === "flick" ? seg(t, T.drag[0] + 200, T.drag[0] + 900) : seg(t, T.reveal[0], T.reveal[1]);
  const settled = t >= T.settle[1];

  /* The deck closes up once the top card is taken, and a new detection
     arrives at its back. */
  const close = easeInOut(seg(t, T.drag[0] + 150, T.drag[0] + 650));
  const arrive = easeOut(seg(t, T.arrive[0], T.arrive[1]));
  /* The stack steps back as the new prospect lands on it. */
  const stepBack = easeInOut(seg(t, (mode === "carry" ? T.drag[1] : T.drag[0] + 700) - 100, T.settle[1]));
  const count = 11 + (cycle % 30) + (t >= T.settle[0] + 200 ? 1 : 0);

  const deck = [1, 2, 3].map(i => ({ k: cycle + i, depth: i - close }));
  const stack = [1, 2, 3].map(i => ({ k: cycle - i, depth: i - 1 + stepBack }));

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Prospect cards">
      {/* Headings. */}
      <span className="absolute flex items-center gap-[8px]" style={{ left: CARD_X, top: DECK_Y - 36 }}>
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} font-medium leading-[16px] text-[12px]`} style={{ color: INK }}>
          Researching your category
        </span>
      </span>
      <span className={`${FONT} absolute leading-[14px] text-[11px]`} style={{ right: CARD_X, top: DECK_Y - 35, color: MUTE }}>
        Detected now
      </span>
      <span className={`${FONT} absolute font-medium leading-[16px] text-[12px]`} style={{ left: CARD_X, top: STACK_Y - 36, color: INK }}>
        Prospects identified
      </span>
      <span className="absolute flex items-baseline gap-[5px]" style={{ right: CARD_X, top: STACK_Y - 40 }}>
        <span key={count} className={`${FONT} bi-count font-medium leading-[20px] text-[16px] tabular-nums`} style={{ color: INK }}>
          {count}
        </span>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTE }}>
          this week
        </span>
      </span>

      {/* The deck of detections: the ones behind the top card. */}
      {deck
        .slice()
        .reverse()
        .map(({ k, depth }) => {
          const L = layer(DECK_Y, depth);
          const isNewest = k === cycle + 3;
          const o = isNewest ? L.opacity * arrive : L.opacity;
          return (
            <div
              key={`deck-${k}`}
              className="absolute overflow-hidden rounded-[14px] bg-white"
              style={{
                left: CARD_X,
                top: L.y + (isNewest ? (1 - arrive) * 10 : 0),
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${L.scale.toFixed(4)})`,
                transformOrigin: "50% 100%",
                opacity: o,
                zIndex: 10 - Math.round(depth * 2),
                boxShadow: shadowFor(0),
              }}
            >
              <AnonBody company={c(k)} signal={sig(k)} />
            </div>
          );
        })}

      {/* The identified stack. */}
      {stack
        .slice()
        .reverse()
        .map(({ k, depth }) => {
          const L = layer(STACK_Y, depth);
          return (
            <div
              key={`stack-${k}`}
              className="absolute overflow-hidden rounded-[14px] bg-white"
              style={{
                left: CARD_X,
                top: L.y,
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${L.scale.toFixed(4)})`,
                transformOrigin: "50% 100%",
                opacity: L.opacity,
                zIndex: 10 - Math.round(depth * 2),
                boxShadow: shadowFor(0),
              }}
            >
              <KnownBody company={c(k)} />
            </div>
          );
        })}

      {/* The card in hand. */}
      <div
        className="absolute overflow-hidden rounded-[14px] bg-white"
        style={{
          left: cardPos.x,
          top: cardPos.y - 2 * hover * (t < T.drag[0] ? 1 : 0),
          width: CARD_W,
          height: CARD_H,
          zIndex: 30,
          transform: `rotate(${tilt.toFixed(2)}deg) scale(${(1 + 0.03 * lift).toFixed(4)})`,
          transformOrigin: `${GRAB.x - CARD_X}px ${GRAB.y - DECK_Y}px`,
          boxShadow: settled ? shadowFor(0) : shadowFor(lift),
        }}
      >
        {/* Anonymous until the scan passes; the company behind it. */}
        <span className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${(revealP * 100).toFixed(2)}%)` }}>
          <AnonBody company={c(cycle)} signal={sig(cycle)} />
        </span>
        <span className="absolute inset-0" style={{ clipPath: `inset(0 ${(100 - revealP * 100).toFixed(2)}% 0 0)` }}>
          <KnownBody company={c(cycle)} />
        </span>
        {revealP > 0 && revealP < 1 && (
          <span className="absolute bottom-0 top-0 w-[2px]" style={{ left: `calc(${(revealP * 100).toFixed(2)}% - 1px)`, background: LIME, boxShadow: `0 0 6px 1px rgba(177,250,99,0.6)` }} />
        )}
      </div>

      <Cursor at={cursor} pressed={pressed} />
    </div>
  );
}
