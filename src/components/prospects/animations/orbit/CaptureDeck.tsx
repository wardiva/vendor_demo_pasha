import IntentTag from "@/components/IntentTag";
import { FONT, useCompanies, type Company } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, pick, seg, useLoopClock } from "./kit";
import { AnonBody, Cursor, INK, shadowFor } from "./ProspectCards";

/**
 * Variation 15 — Reveal and capture.
 *
 * Variation 14's researching deck, Variation 1's reveal, and a capture — set
 * off by the product's own hand. The viewer does nothing.
 *
 * The cursor comes in on a curve and slows onto the top card, which rises a
 * touch under it. It clicks — the cursor presses, a small ring spreads from
 * its tip, the card gives — and Variation 1's lime line sweeps across the card
 * where it lies. Behind the line Buyer Intelligence identifies the company:
 * logo, name, category, the Intent tag counting up through its bands, and a
 * lime check on the logo. The hand has already drawn back, out of the way.
 *
 * Then the capture, after Arc's download toss: the card folds away into its
 * logo; the logo gathers itself and is thrown — up a little, then down under
 * its own weight, turning as it goes — to just above its place in the
 * collection gathered along the foot of the panel. There it opens out into a
 * chip, logo and name on a white pill with a lime edge, and drops into place:
 * a short fall, a small give as it lands, the chips around it settling. The
 * collection is five overlapping chips along the bottom edge — left,
 * centre, right — each at its own slight tilt, newest on top. A new capture
 * takes the place of the oldest, which sinks away as it comes in. The next
 * researching company is on top of the deck, and the hand comes back for it.
 *
 * Researching, detected, clicked, revealed, captured, collected — one
 * prospect at a time. Every position is a function of time, so each loop is
 * seamless and the collection is the same at every visit.
 */

const LIME = "#B1FA63";
const MUTE = "rgba(47,43,61,0.62)";

const PW = 389;
const CARD_W = 316;
const CARD_H = 86;
const CARD_X = (PW - CARD_W) / 2;
/** The status line: centred at the top of the panel, 50px down. */
const STATUS_Y = 50;
const DECK_Y = 252;
const PEEK = 10;

/** The logo inside the card. */
const IN_LOGO = { x: 16, y: 24, s: 38 };

/** A captured company, kept as a chip: logo and name on a white pill. */
const CHIP = { w: 168, h: 32, pad: 6, logo: 20, gap: 8, padR: 14 };
const PH = 590;
/** The collection along the foot of the panel, the bottom row resting on the panel's
    edge. Weighted to the right: on the left, one chip on the edge and one a row up, left
    of centre; on the right, a short column of three strips, each a row above the last.
    Rows step up by about 25px, so every chip's name stays clear of the one in front;
    side by side, chips overlap by no more than about 28px. */
const ROW = 25;
const EDGE = PH - CHIP.h;
const SPOTS = [
  { cx: 150, top: EDGE - ROW + 1, r: -1.5 },
  { cx: 100, top: EDGE, r: -2 },
  { cx: 288, top: EDGE, r: 1.5 },
  { cx: 290, top: EDGE - ROW, r: 2.5 },
  { cx: 284, top: EDGE - 2 * ROW, r: -1.5 },
] as const;
const N = SPOTS.length;
/** Capture k takes spot k mod N — the place of the capture N before it. */
const spotOf = (k: number) => SPOTS[((k % N) + N) % N];
/** How far above its spot the thrown logo opens into a chip, before it drops. */
const HOVER = 30;
/** Where the thrown logo lands: where the new chip's logo is while it hangs above its spot. */
const destOf = (k: number) => ({ x: spotOf(k).cx - CHIP.w / 2 + CHIP.pad + CHIP.logo / 2, y: spotOf(k).top + CHIP.h / 2 - HOVER });

/** The click, in ms into the loop; every later beat is measured from it. */
const K = 950;
const at = (a: number, b: number) => [K + a, K + b] as const;
const T = {
  approach: [0, 850] as const,
  hover: [600, K] as const,
  retreat: at(220, 760),
  press: at(0, 110),
  ripple: at(0, 440),
  lift: at(60, 320),
  scan: at(140, 860),
  badge: at(860, 1100),
  collapse: at(1650, 1930),
  fade: at(1650, 1790),
  gather: at(1900, 1990),
  toss: at(1990, 2390),
  morph: at(2390, 2650),
  drop: at(2610, 2880),
  leave: at(2090, 2390),
  settle: at(2780, 3000),
  forward: at(1750, 2250),
  arrive: at(2150, 2650),
};
const LOOP = K + 3050;
/** Reduced motion: a prospect, identified, still in the deck. */
const REST_T = K + 1300;
/** The throw: gravity (px/s²), and the turn it takes in flight (deg). */
const G = 2600;
const SPIN_FROM = -8;

type Pt = { x: number; y: number };
/** Where the hand clicks: on the card's body, right of centre. */
const CLICK: Pt = { x: CARD_X + 196, y: DECK_Y + 54 };
/** Where the hand waits, clear of the card and of the throw. */
const REST: Pt = { x: CLICK.x + 70, y: CLICK.y + 60 };

const SIGNALS = ["Viewed Pricing", "Viewed Profile", "Viewed Demo", "Viewed Reviews"];

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
/** Past 1 and back: something light settling. */
const easeOutBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt => {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
};

/** The hand, by time: in to the card, a click, then back out of the way. */
function cursorAt(t: number): Pt {
  if (t < T.approach[1]) {
    const p = easeOutCubic(seg(t, T.approach[0], T.approach[1]));
    return bez(REST, { x: REST.x + 16, y: REST.y - 70 }, { x: CLICK.x + 40, y: CLICK.y + 34 }, CLICK, p);
  }
  if (t < T.retreat[0]) {
    /* Settling onto the card, then still for the click. */
    const w = Math.sin(seg(t, T.approach[1], K) * Math.PI) * 1.2;
    return { x: CLICK.x + w * 0.4, y: CLICK.y + w };
  }
  const p = easeInOut(seg(t, T.retreat[0], T.retreat[1]));
  return bez(CLICK, { x: CLICK.x + 20, y: CLICK.y + 10 }, { x: REST.x - 6, y: REST.y - 30 }, REST, p);
}

/** A card at rest in the deck — a complete card; depth is only scale and offset. */
function layer(depth: number) {
  const d = Math.max(-0.1, depth);
  return { y: DECK_Y + d * PEEK, scale: 1 - d * 0.05 };
}

/** The prospect, identified: logo, name, category and intent. */
function RevealBody({ company, score, badge, fade }: { company: Company; score: number; badge: number; fade: number }) {
  return (
    <span className="flex h-full items-center gap-[12px] px-[16px]">
      <span className="relative block size-[38px] shrink-0">
        <img alt="" src={company.logo} className="block size-full rounded-[10px] object-cover" />
        {badge > 0 && (
          <span
            className="absolute -bottom-[3px] -right-[3px] flex size-[15px] items-center justify-center rounded-[100px]"
            style={{ background: LIME, boxShadow: "0 0 0 2px #ffffff", transform: `scale(${badge.toFixed(3)})`, opacity: fade }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 5.2L4.1 7.2L8 3.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[1px]" style={{ opacity: fade }}>
        <span className={`${FONT} truncate font-medium leading-[18px] text-[13.5px]`} style={{ color: INK }}>
          {company.name}
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTE }}>
          {company.industry}
        </span>
      </span>
      {/* Intent only: the product's own tag, no activity label. */}
      <span className="flex shrink-0 items-center" style={{ opacity: fade }}>
        <IntentTag score={score} />
      </span>
    </span>
  );
}

/** Mix two rgba colours. */
const mix = (a: readonly number[], b: readonly number[], p: number) => `rgba(${a.map((v, i) => (i < 3 ? Math.round(lerp(v, b[i], p)) : +lerp(v, b[i], p).toFixed(3))).join(",")})`;
const HAIRLINE = [7, 41, 41, 0.08] as const;
const LIME_RGBA = [177, 250, 99, 1] as const;

/**
 * A captured company: its logo and name on a white pill. `grow` opens it out of the
 * logo; `fresh` is the lime edge it lands with; `air` how high it is held; `sink`
 * takes it away when its place is needed.
 */
function Chip({ company, k, grow, turn, fresh, air, sink, dy, z }: { company: Company; k: number; grow: number; turn: number; fresh: number; air: number; sink: number; dy: number; z: number }) {
  const spot = spotOf(k);
  return (
    <span
      className="absolute flex items-center overflow-hidden rounded-[100px] bg-white"
      style={{
        left: spot.cx - CHIP.w / 2,
        top: spot.top + dy + 10 * sink,
        width: lerp(CHIP.h, CHIP.w, grow),
        height: CHIP.h,
        paddingLeft: CHIP.pad,
        paddingRight: lerp(CHIP.pad, CHIP.padR, grow),
        gap: CHIP.gap * grow,
        zIndex: z,
        opacity: 1 - sink,
        border: `1px solid ${mix(HAIRLINE, LIME_RGBA, fresh)}`,
        boxShadow: `0 1px 2px 0 rgba(7,41,41,0.06), 0 ${(4 + 8 * air).toFixed(1)}px ${(12 + 14 * air).toFixed(1)}px -4px rgba(7,41,41,${(0.12 + 0.08 * air).toFixed(3)})`,
        transform: `rotate(${turn.toFixed(2)}deg) scale(${(1 - 0.08 * sink).toFixed(4)})`,
      }}
    >
      <img alt="" src={company.logo} className="block shrink-0 rounded-[100px] object-cover" style={{ width: CHIP.logo, height: CHIP.logo }} />
      <span
        className={`${FONT} min-w-0 truncate whitespace-nowrap font-medium leading-[16px] text-[12px]`}
        style={{ color: INK, opacity: seg(grow, 0.35, 1) }}
      >
        {company.name}
      </span>
    </span>
  );
}

export default function CaptureDeck() {
  const companies = useCompanies(80);
  const { t, cycle, reduced } = useLoopClock(LOOP, REST_T);
  if (companies.length < 4) return null;

  const company = (k: number) => pick(companies, k + 1);
  const signal = (k: number) => pick(SIGNALS, k);
  const cur = company(cycle);
  const cursor = cursorAt(t);
  const pressed = seg(t, K - 40, K + 20) * (1 - seg(t, K + 110, K + 200));
  const ripple = seg(t, T.ripple[0], T.ripple[1]);

  /* Under the hand, the card rises; clicked, it gives, then lifts where it lies. */
  const hover = easeOut(seg(t, T.hover[0], T.hover[1]));
  const dip = Math.sin(seg(t, T.press[0], T.press[1]) * Math.PI);
  const lift = t < T.lift[0] ? 0 : easeOutBack(seg(t, T.lift[0], T.lift[1]));

  /* The reveal: Variation 1's lime line, and what Buyer Intelligence finds behind it. */
  const scan = easeInOut(seg(t, T.scan[0], T.scan[1]));
  const counted = easeOut(seg(t, lerp(T.scan[0], T.scan[1], 0.62), T.scan[1] + 320));
  const score = Math.round(lerp(30, cur.score, counted));
  const badge = t < T.badge[0] ? 0 : easeOutBack(seg(t, T.badge[0], T.badge[1]));

  /* The capture: the card folds into its logo, the logo is thrown, and is taken at the foot. */
  const fold = easeInOutCubic(seg(t, T.collapse[0], T.collapse[1]));
  const fade = 1 - easeOut(seg(t, T.fade[0], T.fade[1]));
  const landed = t >= T.toss[1];
  const dest = destOf(cycle);
  /* The flight ends turned a little past the chip's tilt; the chip settles back to it. */
  const flightTurn = spotOf(cycle).r + 6;

  /* The collection: five chips along the foot, newest on top. The oldest sinks away as
     the new logo is thrown to its place; as the new chip lands, the rest give a little. */
  const settle = Math.sin(seg(t, T.settle[0], T.settle[1]) * Math.PI) * 1.5;
  const chips: { k: number; grow: number; turn: number; fresh: number; air: number; sink: number; dy: number; z: number }[] = [];
  for (let i = N; i >= 1; i--) {
    const k = cycle - i;
    const sink = i === N ? easeInOut(seg(t, T.leave[0], T.leave[1])) : 0;
    if (sink >= 1) continue;
    chips.push({ k, grow: 1, turn: spotOf(k).r, fresh: 0, air: 0, sink, dy: settle, z: 40 + N - i });
  }
  if (landed) {
    /* Opens out of the logo above its spot, then drops into place: a short fall, a small give. */
    const m = seg(t, T.morph[0], T.morph[1]);
    const d = seg(t, T.drop[0], T.drop[1]);
    const height = d < 0.7 ? 1 - Math.pow(d / 0.7, 2) : -0.1 * Math.sin(((d - 0.7) / 0.3) * Math.PI);
    chips.push({
      k: cycle,
      grow: easeOutCubic(m),
      turn: lerp(flightTurn, spotOf(cycle).r, easeOutBack(m)),
      fresh: 1 - easeInOut(seg(t, T.drop[0] + 150, T.drop[1] + 250)),
      air: clamp01(height),
      sink: 0,
      dy: -HOVER * height + settle,
      z: 40 + N,
    });
  }

  /* The deck moves up as the card folds away, and a new detection arrives at the back. */
  const fp = seg(t, T.forward[0], T.forward[1]);
  const forward = fp <= 0 ? 0 : fp >= 1 ? 1 : easeOutBack(fp);
  const arrive = easeOutCubic(seg(t, T.arrive[0], T.arrive[1]));
  const deck = [
    ...(t >= T.arrive[0] ? [{ k: cycle + 3, depth: 2, arriving: true }] : []),
    { k: cycle + 2, depth: 2 - forward, arriving: false },
    { k: cycle + 1, depth: 1 - forward, arriving: false },
  ];

  /* The card's box: the whole card, then folding onto its logo, then the logo in flight. */
  const liftY = -2 * hover - 3 * clamp01(lift);
  let box: { left: number; top: number; w: number; h: number; radius: number; rot: number; scale: number; lift: number; opacity: number; inner: Pt };
  if (t < T.collapse[0]) {
    box = {
      left: CARD_X,
      top: DECK_Y + liftY,
      w: CARD_W,
      h: CARD_H,
      radius: 14,
      rot: 0,
      scale: 1 + 0.006 * hover - 0.014 * dip + 0.02 * lift,
      lift: 0.25 * hover + 0.6 * clamp01(lift),
      opacity: 1,
      inner: { x: 0, y: 0 },
    };
  } else {
    const base = { x: CARD_X, y: DECK_Y + liftY };
    if (t < T.toss[0]) {
      /* Folding away into the logo, which then gathers itself for the throw. */
      const gather = Math.sin(seg(t, T.gather[0], T.gather[1]) * Math.PI * 0.5);
      box = {
        left: base.x + IN_LOGO.x * fold,
        top: base.y + IN_LOGO.y * fold,
        w: lerp(CARD_W, IN_LOGO.s, fold),
        h: lerp(CARD_H, IN_LOGO.s, fold),
        radius: lerp(14, 10, fold),
        rot: SPIN_FROM * gather,
        scale: lerp(1.02, 1, fold) - 0.1 * gather,
        lift: lerp(0.6, 0.2, fold),
        opacity: 1,
        inner: { x: -IN_LOGO.x * fold, y: -IN_LOGO.y * fold },
      };
    } else {
      /* Thrown: a ballistic arc to just above the pile — up a little, then down under
         gravity, turning as it flies — arriving at the size and shape of a chip's logo. */
      const dur = (T.toss[1] - T.toss[0]) / 1000;
      const s = Math.min(t - T.toss[0], T.toss[1] - T.toss[0]) / 1000;
      const p = clamp01(s / dur);
      const from = { x: base.x + IN_LOGO.x + IN_LOGO.s / 2, y: base.y + IN_LOGO.y + IN_LOGO.s / 2 };
      const vy = (dest.y - from.y - 0.5 * G * dur * dur) / dur;
      const x = lerp(from.x, dest.x, easeOut(p) * 0.35 + p * 0.65);
      const y = from.y + vy * s + 0.5 * G * s * s;
      /* Stretched by the launch, smaller as it goes. */
      const launch = 0.1 * Math.max(0, 1 - p * 4);
      const size = lerp(1, CHIP.logo / IN_LOGO.s, easeInOut(p)) * (1 + launch);
      box = {
        left: x - IN_LOGO.s / 2,
        top: y - IN_LOGO.s / 2,
        w: IN_LOGO.s,
        h: IN_LOGO.s,
        radius: lerp(10, IN_LOGO.s / 2, easeInOut(p)),
        rot: lerp(SPIN_FROM, flightTurn, easeOut(p)),
        scale: size,
        lift: 0.2 + 0.45 * Math.sin(p * Math.PI),
        opacity: 1,
        inner: { x: -IN_LOGO.x, y: -IN_LOGO.y },
      };
    }
  }

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Reveal and capture">
      <span className="absolute left-0 right-0 flex items-center justify-center gap-[8px]" style={{ top: STATUS_Y }}>
        <span className="relative block size-[6px]">
          {/* The modal's checkmark-circle green, #B1FA63. */}
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: LIME }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: LIME }} />
        </span>
        <span className={`${FONT} font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Researching your category
        </span>
      </span>

      {/* The researching deck: whole cards, every one. */}
      {deck.map(({ k, depth, arriving }) => {
        const L = layer(depth);
        const show = arriving ? arrive : 1;
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
            <AnonBody company={company(k)} signal={signal(k)} lineGap={1} />
          </div>
        );
      })}

      {/* The collection: captured companies, gathered along the foot of the panel. */}
      {chips.map(c => (
        <Chip key={`chip-${c.k}`} company={company(c.k)} k={c.k} grow={c.grow} turn={c.turn} fresh={c.fresh} air={c.air} sink={c.sink} dy={c.dy} z={c.z} />
      ))}

      {/* The top card: identified, folded to its logo, thrown and taken. */}
      {!landed && (
        <div
          className="absolute overflow-hidden bg-white"
          style={{
            left: box.left,
            top: box.top,
            width: box.w,
            height: box.h,
            borderRadius: box.radius,
            opacity: box.opacity,
            zIndex: t >= T.toss[0] ? 60 : 30,
            transform: `rotate(${box.rot.toFixed(2)}deg) scale(${box.scale.toFixed(4)})`,
            boxShadow: shadowFor(clamp01(box.lift)),
          }}
        >
          <span className="absolute block" style={{ left: box.inner.x, top: box.inner.y, width: CARD_W, height: CARD_H }}>
            {scan < 1 && (
              <span className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${(scan * 100).toFixed(2)}%)` }}>
                <AnonBody company={cur} signal={signal(cycle)} lineGap={1} />
              </span>
            )}
            {scan > 0 && (
              <span className="absolute inset-0" style={{ clipPath: scan < 1 ? `inset(0 ${(100 - scan * 100).toFixed(2)}% 0 0)` : undefined }}>
                <RevealBody company={cur} score={score} badge={badge} fade={fade} />
              </span>
            )}
            {scan > 0 && scan < 1 && (
              <>
                {/* A faint lime wash trailing the line: the part just identified. */}
                <span
                  className="absolute bottom-0 top-0 w-[56px]"
                  style={{ left: `calc(${(scan * 100).toFixed(2)}% - 56px)`, background: "linear-gradient(to right, rgba(177,250,99,0), rgba(177,250,99,0.2))" }}
                />
                <span
                  className="absolute bottom-0 top-0 w-[2px]"
                  style={{ left: `calc(${(scan * 100).toFixed(2)}% - 1px)`, background: LIME, boxShadow: "0 0 6px 1px rgba(177,250,99,0.6)" }}
                />
              </>
            )}
          </span>
        </div>
      )}

      {!reduced && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 200 }}>
          {/* The click: a small ring spreading from the cursor's tip. */}
          {ripple > 0 && ripple < 1 && (
            <span
              className="absolute block rounded-[100px]"
              style={{
                left: CLICK.x - 14,
                top: CLICK.y - 14,
                width: 28,
                height: 28,
                border: `1.5px solid ${INK}`,
                transform: `scale(${(0.3 + 0.9 * easeOut(ripple)).toFixed(3)})`,
                opacity: 0.55 * (1 - easeOut(ripple)),
              }}
            />
          )}
          <Cursor at={cursor} pressed={pressed} />
        </div>
      )}
    </div>
  );
}
