import { useMemo } from "react";
import { FONT, useCompanies } from "../shared";
import { clamp01, easeInOut, easeOut, pick, seg, useLoopClock } from "./kit";
import { AnonBody, Cursor, INK, shadowFor } from "./ProspectCards";

/**
 * Variation 14 — Researching deck, refined.
 *
 * Variation 10's deck and cards, with the interaction rebuilt as physics.
 *
 * The stack is a real stack: every card in it is a complete card — its
 * locked company, its signal — opaque, one on another, depth shown only by
 * scale and offset. Nothing is ever a blank placeholder; when the top card
 * lifts, the card that was under it is simply there.
 *
 * The hand: the cursor comes in on a curve and slows onto the card, which
 * rises a touch under it. It presses — the card gives, then is picked up,
 * larger, its shadow deeper. The hand carries it a little, then throws it.
 * The card is a rigid body held at the grab point by a stiff spring: it
 * follows the hand closely, and because it is held off-centre it swings
 * about that point as the hand speeds up, its trailing end lagging as a real
 * card's does. Let go, it keeps its momentum and its spin and slides out of
 * the panel. The next card settles forward with a small overshoot, a new
 * detection arrives at the back, and the hand drifts back to rest. The body
 * is integrated once for the loop and read back by time, so every loop is
 * identical and seamless.
 */

const PW = 389;
const CARD_W = 316;
const CARD_H = 86;
const CARD_X = (PW - CARD_W) / 2;
const STATUS_Y = 214;
const DECK_Y = 252;
const PEEK = 10;

const LOOP = 4200;
/** Reduced motion: the deck at rest, before the hand arrives. */
const REST_T = 600;
const T = {
  approach: [0, 900] as const,
  hover: [650, 1100] as const,
  press: [1100, 1200] as const,
  lift: [1160, 1360] as const,
  carry: [1360, 1720] as const,
  throw: [1720, 2080] as const,
  follow: [2080, 2400] as const,
  back: [2850, LOOP] as const,
  forward: [2040, 2500] as const,
  arrive: [2350, 2850] as const,
};

type Pt = { x: number; y: number };
/** Where the card is held, in its own frame: right of centre and below it. */
const OFFSET: Pt = { x: 200, y: 64 };
const GRAB: Pt = { x: CARD_X + OFFSET.x, y: DECK_Y + OFFSET.y };
const FLICK: Pt = { x: 352, y: GRAB.y - 2 };
const FOLLOW: Pt = { x: FLICK.x + 12, y: FLICK.y - 2 };
const REST: Pt = { x: CARD_X + CARD_W - 20, y: DECK_Y + CARD_H + 64 };

const SIGNALS = ["Viewed Profile", "Viewed Pricing", "Viewed Demo", "Viewed Reviews"];

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
/** Settles past 1 and back — the give of something light being picked up. */
const easeOutBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt => {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
};
const liftAt = (t: number) => easeOutBack(seg(t, T.lift[0], T.lift[1]));

/** The hand, by time. */
function cursorAt(t: number): Pt {
  const tt = ((t % LOOP) + LOOP) % LOOP;
  if (tt < T.approach[1]) {
    /* In on a curve, slowing onto the card. */
    const p = easeOutCubic(seg(tt, T.approach[0], T.approach[1]));
    return bez(REST, { x: REST.x + 30, y: REST.y - 60 }, { x: GRAB.x + 30, y: GRAB.y + 34 }, GRAB, p);
  }
  /* Picked up: the hand rises with the card. */
  const held = { x: GRAB.x, y: GRAB.y - 3 * clamp01(liftAt(tt)) };
  if (tt < T.carry[0]) return held;
  /* Carried a little, down and away from the deck… */
  const carry = { x: held.x + 16, y: held.y + 14 };
  if (tt < T.carry[1]) {
    const p = easeInOut(seg(tt, T.carry[0], T.carry[1]));
    return { x: held.x + (carry.x - held.x) * p, y: held.y + (carry.y - held.y) * p + Math.sin(p * Math.PI) * 3 };
  }
  /* …then thrown: slow to start as the weight is taken, fastest at the release. */
  if (tt < T.throw[1]) {
    const p = Math.pow(seg(tt, T.throw[0], T.throw[1]), 3.2);
    /* Rising out of the carry, level at the release, so the card leaves flat and fast. */
    return { x: carry.x + (FLICK.x - carry.x) * p, y: carry.y + (FLICK.y - carry.y) * Math.sin((p * Math.PI) / 2) };
  }
  if (tt < T.follow[1]) {
    const p = easeOutCubic(seg(tt, T.follow[0], T.follow[1]));
    return { x: FLICK.x + (FOLLOW.x - FLICK.x) * p, y: FLICK.y + (FOLLOW.y - FLICK.y) * p };
  }
  if (tt < T.back[0]) return FOLLOW;
  const p = easeInOut(seg(tt, T.back[0], T.back[1]));
  return bez(FOLLOW, { x: FOLLOW.x - 6, y: FOLLOW.y + 50 }, { x: REST.x + 24, y: REST.y - 6 }, REST, p);
}

/** The held card: its centre, its angle (deg), its scale and how high it is lifted. */
type Frame = { x: number; y: number; rot: number; scale: number; lift: number };
const DT = 1000 / 240;

/** The card in hand, integrated once across the loop at 240 Hz as a rigid body on a spring. */
function simulate(): Frame[] {
  const s = DT / 1000;
  const n = Math.ceil(LOOP / DT) + 1;
  const out: Frame[] = [];
  const K = 4000; // the hold: stiff, so the card stays under the hand
  const C = 2 * Math.sqrt(K) * 0.85;
  const I = ((CARD_W * CARD_W + CARD_H * CARD_H) / 12) * 1.1; // a flat card's inertia, per unit mass
  const r0 = { x: OFFSET.x - CARD_W / 2, y: OFFSET.y - CARD_H / 2 };
  const home = { x: CARD_X + CARD_W / 2, y: DECK_Y + CARD_H / 2 };
  let x = home.x;
  let y = home.y;
  let vx = 0;
  let vy = 0;
  let th = 0;
  let w = 0;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    const hover = easeOut(seg(t, T.hover[0], T.hover[1]));
    const dip = Math.sin(seg(t, T.press[0], T.press[1]) * Math.PI);
    const lift = liftAt(t);
    if (t < T.carry[0]) {
      /* In the deck: rising under the hand, giving as it is pressed, picked up. */
      x = home.x;
      y = home.y - 2 * hover - 3 * clamp01(lift);
      out.push({ x, y, rot: 0, scale: 1 + 0.006 * hover - 0.014 * dip + 0.036 * lift, lift: 0.25 * hover + 0.75 * clamp01(lift) });
      continue;
    }
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const r = { x: r0.x * c - r0.y * sn, y: r0.x * sn + r0.y * c };
    let fx: number;
    let fy: number;
    if (t < T.throw[1]) {
      /* Held: the grab point sprung to the hand; the pull turns the card about its centre. */
      const hand = cursorAt(t);
      const gvx = vx - w * r.y;
      const gvy = vy + w * r.x;
      fx = K * (hand.x - x - r.x) - C * gvx;
      fy = K * (hand.y - y - r.y) - C * gvy;
      w += ((r.x * fy - r.y * fx) / I - 6 * w) * s;
    } else {
      /* Let go: momentum and spin, slowly bled off. */
      fx = -0.7 * vx;
      fy = -0.7 * vy;
      w -= 4 * w * s;
    }
    vx += fx * s;
    vy += fy * s;
    x += vx * s;
    y += vy * s;
    th += w * s;
    out.push({ x, y, rot: (th * 180) / Math.PI, scale: 1.036, lift: 1 });
  }
  return out;
}

/** A card at rest in the deck — a complete card; depth is only scale and offset. */
function layer(depth: number) {
  /* Slightly below 0 during the settle's overshoot: the card comes a touch too far, then back. */
  const d = Math.max(-0.1, depth);
  return { y: DECK_Y + d * PEEK, scale: 1 - d * 0.05 };
}

export default function ResearchDeckRefined() {
  const companies = useCompanies(80);
  const { t, cycle, reduced } = useLoopClock(LOOP, REST_T);
  const frames = useMemo(simulate, []);
  if (companies.length < 4) return null;

  const card = (k: number) => ({ company: pick(companies, k + 1), signal: pick(SIGNALS, k) });
  const f = frames[Math.min(frames.length - 1, Math.round(t / DT))];
  const cursor = cursorAt(t);
  const pressed = seg(t, T.press[0], T.press[0] + 60) * (1 - seg(t, T.throw[1] - 10, T.throw[1] + 90));
  /* Gone once it is wholly past the panel's edge. */
  const inHand = f.x - CARD_W / 2 < PW + 12;

  /* The stack advances as the thrown card clears it: a settle with a little
     overshoot, and a new detection arriving at the back. */
  const fp = seg(t, T.forward[0], T.forward[1]);
  const forward = fp <= 0 ? 0 : fp >= 1 ? 1 : easeOutBack(fp);
  const arrive = easeOutCubic(seg(t, T.arrive[0], T.arrive[1]));
  const deck = [
    { k: cycle + 3, depth: 2, arriving: true },
    { k: cycle + 2, depth: 2 - forward, arriving: false },
    { k: cycle + 1, depth: 1 - forward, arriving: false },
  ];

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Researching deck, refined">
      <span className="absolute left-0 right-0 flex items-center justify-center gap-[8px]" style={{ top: STATUS_Y }}>
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Researching your category
        </span>
      </span>

      {/* The stack beneath: whole cards, every one. */}
      {deck.map(({ k, depth, arriving }) => {
        const L = layer(depth);
        const show = arriving ? (t >= T.arrive[0] ? arrive : 0) : 1;
        if (show <= 0) return null;
        return (
          <div
            key={`deck-${k}`}
            className="absolute overflow-hidden rounded-[14px] bg-white"
            style={{
              left: CARD_X,
              top: L.y + (arriving ? (1 - arrive) * 10 : 0),
              width: CARD_W,
              height: CARD_H,
              transform: `scale(${L.scale.toFixed(4)})`,
              transformOrigin: "50% 100%",
              opacity: show,
              zIndex: 20 - Math.round(depth * 4),
              boxShadow: shadowFor(0),
            }}
          >
            <AnonBody {...card(k)} />
          </div>
        );
      })}

      {/* The card in hand. */}
      {inHand && (
        <div
          className="absolute overflow-hidden rounded-[14px] bg-white"
          style={{
            left: f.x - CARD_W / 2,
            top: f.y - CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
            zIndex: 30,
            transform: `rotate(${f.rot.toFixed(2)}deg) scale(${f.scale.toFixed(4)})`,
            boxShadow: shadowFor(clamp01(f.lift)),
          }}
        >
          <AnonBody {...card(cycle)} />
        </div>
      )}

      {!reduced && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 200 }}>
          <Cursor at={cursor} pressed={pressed} />
        </div>
      )}
    </div>
  );
}
