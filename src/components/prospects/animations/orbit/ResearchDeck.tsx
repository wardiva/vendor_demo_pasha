import { FONT, useCompanies } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, pick, seg, useLoopClock } from "./kit";
import { AnonBody, Cursor, INK, shadowFor } from "./ProspectCards";

/**
 * Variation 10 — Researching deck.
 *
 * Variation 1, reduced to its one idea. The status is the headline —
 * "Researching your category", centred, with its live dot — and beneath it
 * the deck of companies doing the researching, each still locked: no name, a
 * masked domain, and the signal that surfaced it.
 *
 * The cursor keeps Variation 1's physical language: it comes to the top
 * card, which lifts under it; presses; and draws it down, the card lagging
 * the hand and tilting with its speed. Without a second section to carry it
 * to, the card is let go and slides to the back of the deck, and the next
 * researching company comes forward with its own signal — a hand leafing
 * through everyone researching your category, none of them yet revealed.
 */

const PW = 389;
const CARD_W = 316;
const CARD_H = 86;
const CARD_X = (PW - CARD_W) / 2;
const STATUS_Y = 214;
const DECK_Y = 252;
const PEEK = 10;

const T = {
  travel: [0, 1000] as const,
  press: [1200, 1350] as const,
  drag: [1350, 2050] as const,
  back: [2050, 2800] as const,
  forward: [2100, 2700] as const,
  rest: [2800, 4400] as const,
};
const LOOP = 4400;
const REST = 900;
const LAG = 70;

type Pt = { x: number; y: number };
const GRAB: Pt = { x: CARD_X + CARD_W - 64, y: DECK_Y + 52 };
const PULLED: Pt = { x: GRAB.x + 34, y: GRAB.y + 66 };
const REST_AT: Pt = { x: CARD_X + CARD_W - 20, y: DECK_Y + CARD_H + 62 };

const SIGNALS = ["Viewed Profile", "Viewed Pricing", "Viewed Demo", "Viewed Reviews"];

/** Where the cursor is at time t (ms into the loop). */
function cursorAt(t: number): Pt {
  const tt = ((t % LOOP) + LOOP) % LOOP;
  if (tt < T.travel[1]) {
    const p = easeInOut(seg(tt, T.travel[0], T.travel[1]));
    return {
      x: lerp(REST_AT.x, GRAB.x, p) + Math.sin(p * Math.PI) * 22,
      y: lerp(REST_AT.y, GRAB.y, p),
    };
  }
  if (tt < T.drag[0]) {
    const w = Math.sin(seg(tt, T.travel[1], T.drag[0]) * Math.PI) * 1.5;
    return { x: GRAB.x + w, y: GRAB.y + w * 0.5 };
  }
  if (tt < T.drag[1]) {
    const p = easeInOut(seg(tt, T.drag[0], T.drag[1]));
    return { x: lerp(GRAB.x, PULLED.x, p), y: lerp(GRAB.y, PULLED.y, p) + Math.sin(p * Math.PI) * 6 };
  }
  const p = easeInOut(seg(tt, T.rest[0], T.rest[1]));
  const from = PULLED;
  return { x: lerp(from.x, REST_AT.x, p), y: lerp(from.y, REST_AT.y, p) };
}

/** A card at rest in the deck: layer 0 on top, deeper layers peek below and
    recede. Cards are opaque — depth is a slight cool tint, not transparency —
    so nothing behind the top card ever shows through it. */
function layer(depth: number) {
  const d = Math.max(0, depth);
  const k = Math.min(d, 2) / 2;
  const tint = `rgb(${Math.round(255 - 15 * k)},${Math.round(255 - 13 * k)},${Math.round(255 - 13 * k)})`;
  return {
    y: DECK_Y + d * PEEK,
    scale: 1 - d * 0.05,
    bg: tint,
    /* Only the card at the front shows its content. */
    content: clamp01((1 - d) * 1.8),
    visible: d > 2.6 ? 0 : 1,
  };
}

export default function ResearchDeck() {
  const companies = useCompanies(80);
  const { t, cycle, reduced } = useLoopClock(LOOP, REST);
  if (companies.length < 4) return null;

  const c = (k: number) => pick(companies, k + 1);
  const sig = (k: number) => pick(SIGNALS, k);
  const cursor = cursorAt(t);
  const pressed = seg(t, T.press[0], T.press[1]) * (1 - seg(t, T.drag[1], T.drag[1] + 120));
  const hover = easeOut(seg(t, T.travel[1] - 250, T.travel[1] + 150));

  /* The card in hand. */
  const grabOffset = { x: GRAB.x - CARD_X, y: GRAB.y - DECK_Y };
  let pos = { x: CARD_X, y: DECK_Y - 2 * hover };
  let tilt = 0;
  let scale = 1 + 0.01 * hover;
  let content = 1;
  let bg = "#ffffff";
  let z = 30;
  let lift = hover * 0.3;
  if (t >= T.drag[0] && t < T.drag[1]) {
    const lagged = cursorAt(Math.max(t - LAG, T.drag[0]));
    pos = { x: lagged.x - grabOffset.x, y: lagged.y - grabOffset.y };
    const v = cursorAt(t).x - cursorAt(t - 60).x;
    tilt = Math.max(-5, Math.min(5, v * 0.9)) + 2 * Math.sin(seg(t, T.drag[0], T.drag[1]) * Math.PI);
    scale = 1.03;
    lift = 1;
  } else if (t >= T.back[0]) {
    /* Let go: it swings under the deck and settles at the back. */
    const from = { x: PULLED.x - grabOffset.x, y: PULLED.y - grabOffset.y };
    const p = easeInOut(seg(t, T.back[0], T.back[1]));
    const L = layer(2);
    pos = { x: lerp(from.x, CARD_X, p), y: lerp(from.y, L.y, p) + Math.sin(p * Math.PI) * 22 };
    tilt = 2 * (1 - p);
    scale = lerp(1.03, L.scale, p);
    content = 1 - seg(p, 0, 0.3);
    bg = p > 0.5 ? L.bg : "#ffffff";
    lift = 1 - p;
    /* It goes under the deck at once, so the next card takes the front cleanly. */
    z = p < 0.08 ? 30 : 5;
  }

  /* The deck steps forward as the top card leaves it. */
  const forward = easeInOut(seg(t, T.forward[0], T.forward[1]));
  const deck = [1, 2].map(i => ({ k: cycle + i, depth: i - forward }));

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Researching deck">
      {/* The status: what is happening, centred over the deck. */}
      <span className="absolute left-0 right-0 flex items-center justify-center gap-[8px]" style={{ top: STATUS_Y }}>
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Researching your category
        </span>
      </span>

      {/* The deck behind the top card. */}
      {deck
        .slice()
        .reverse()
        .map(({ k, depth }) => {
          const L = layer(depth);
          return (
            <div
              key={`deck-${k}`}
              className="absolute overflow-hidden rounded-[14px] bg-white"
              style={{
                left: CARD_X,
                top: L.y,
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${L.scale.toFixed(4)})`,
                transformOrigin: "50% 100%",
                background: L.bg,
                opacity: L.visible,
                zIndex: 20 - Math.round(depth * 2),
                boxShadow: shadowFor(0),
              }}
            >
              <span className="block size-full" style={{ opacity: L.content }}>
                <AnonBody company={c(k)} signal={sig(k)} />
              </span>
            </div>
          );
        })}

      {/* The top card. */}
      <div
        className="absolute overflow-hidden rounded-[14px] bg-white"
        style={{
          left: pos.x,
          top: pos.y,
          width: CARD_W,
          height: CARD_H,
          zIndex: z,
          background: bg,
          transform: `rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
          transformOrigin: t >= T.back[0] ? "50% 100%" : `${grabOffset.x}px ${grabOffset.y}px`,
          boxShadow: shadowFor(clamp01(lift)),
        }}
      >
        <span className="block size-full" style={{ opacity: content }}>
          <AnonBody company={c(cycle)} signal={sig(cycle)} />
        </span>
      </div>

      {!reduced && <Cursor at={cursor} pressed={pressed} />}
    </div>
  );
}
