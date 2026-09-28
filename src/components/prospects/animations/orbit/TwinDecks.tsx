import { FONT, useCompanies, type Company } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, pick, seg, useLoopClock } from "./kit";
import { AnonBody, Cursor, INK, shadowFor } from "./ProspectCards";

/**
 * Variation 12 — Twin research decks.
 *
 * Variation 10's design with Variation 1's two-stack structure. One status —
 * "Researching your category" — over two separate decks, each its own buyer
 * researching the category: its own locked companies, its own signals.
 *
 * One cursor tends both, in turn, with Variation 10's gesture: it comes to
 * deck A's top card, which lifts; presses; draws it down, the card lagging
 * the hand and tilting with its speed; lets go, and the card slides to the
 * back as the next company comes forward. Then it crosses to deck B and does
 * the same, while A holds still. Two signals, detected side by side, each
 * updating in its own moment — never both at once, never at random.
 */

const PW = 389;
const CARD_W = 316;
const CARD_H = 86;
const CARD_X = (PW - CARD_W) / 2;
const STATUS_Y = 128;
const DECK_Y = [162, 338] as const;
const PEEK = 10;

/* One deck's turn, in ms from the start of its half of the loop. */
const HALF = 3000;
const LOOP = HALF * 2;
const T = {
  travel: [0, 900] as const,
  hover: [650, 1050] as const,
  press: [1050, 1200] as const,
  drag: [1200, 1900] as const,
  back: [1900, 2650] as const,
  forward: [1950, 2550] as const,
  drift: [1900, 2900] as const,
};
const REST = 900;
const LAG = 70;

type Pt = { x: number; y: number };
const grabOf = (d: number): Pt => ({ x: CARD_X + CARD_W - 64, y: DECK_Y[d] + 52 });
const pulledOf = (d: number): Pt => ({ x: grabOf(d).x + 34, y: grabOf(d).y + 58 });
const restOf = (d: number): Pt => ({ x: pulledOf(d).x + 12, y: pulledOf(d).y + 16 });

const SIGNALS = [
  ["Viewed Profile", "Viewed Pricing", "Viewed Demo"],
  ["Viewed Reviews", "Viewed Demo", "Viewed Pricing"],
];

/** Where the cursor is at time t (ms into the loop). */
function cursorAt(t: number): Pt {
  const tt = ((t % LOOP) + LOOP) % LOOP;
  const d = tt < HALF ? 0 : 1;
  const u = tt - d * HALF;
  const other = 1 - d;
  const grab = grabOf(d);
  const pulled = pulledOf(d);
  if (u < T.travel[1]) {
    /* Across from where it left the other deck. */
    const from = restOf(other);
    const p = easeInOut(seg(u, T.travel[0], T.travel[1]));
    return { x: lerp(from.x, grab.x, p) + Math.sin(p * Math.PI) * 26, y: lerp(from.y, grab.y, p) };
  }
  if (u < T.drag[0]) {
    const w = Math.sin(seg(u, T.travel[1], T.drag[0]) * Math.PI) * 1.5;
    return { x: grab.x + w, y: grab.y + w * 0.5 };
  }
  if (u < T.drag[1]) {
    const p = easeInOut(seg(u, T.drag[0], T.drag[1]));
    return { x: lerp(grab.x, pulled.x, p), y: lerp(grab.y, pulled.y, p) + Math.sin(p * Math.PI) * 6 };
  }
  const p = easeOut(seg(u, T.drift[0], T.drift[1]));
  const rest = restOf(d);
  return { x: lerp(pulled.x, rest.x, p), y: lerp(pulled.y, rest.y, p) };
}

/** A card at rest in a deck: depth 0 at the front; deeper cards peek below, tinted, contentless. */
function layer(deckY: number, depth: number) {
  const d = Math.max(0, depth);
  const k = Math.min(d, 2) / 2;
  return {
    y: deckY + d * PEEK,
    scale: 1 - d * 0.05,
    bg: `rgb(${Math.round(255 - 15 * k)},${Math.round(255 - 13 * k)},${Math.round(255 - 13 * k)})`,
    content: clamp01((1 - d) * 1.8),
    visible: d > 2.6 ? 0 : 1,
  };
}

type CardView = {
  key: string;
  company: Company;
  signal: string;
  x: number;
  y: number;
  scale: number;
  tilt: number;
  bg: string;
  content: number;
  visible: number;
  z: number;
  lift: number;
  origin: string;
};

export default function TwinDecks() {
  const companies = useCompanies(80);
  const { t, cycle, reduced } = useLoopClock(LOOP, REST);
  if (companies.length < 6) return null;

  /* Each deck has its own companies and its own signals. */
  const seq = (d: number, i: number) => ({ company: pick(companies, 2 * i + d + 1), signal: pick(SIGNALS[d], i) });
  const cursor = cursorAt(t);
  const active = t < HALF ? 0 : 1;
  const u = t - active * HALF;
  const pressed = seg(u, T.press[0], T.press[1]) * (1 - seg(u, T.drag[1], T.drag[1] + 120));

  const views: CardView[] = [];
  for (const d of [0, 1] as const) {
    const deckY = DECK_Y[d];
    const zBase = d === 0 ? 40 : 10;
    const flat = (key: string, i: number, depth: number) => {
      const L = layer(deckY, depth);
      const s = seq(d, i);
      views.push({ key, ...s, x: CARD_X, y: L.y, scale: L.scale, tilt: 0, bg: L.bg, content: L.content, visible: L.visible, z: zBase + 20 - Math.round(depth * 2), lift: 0, origin: "50% 100%" });
    };
    const local = t - d * HALF;
    if (local < 0) {
      /* Deck B before its turn: as the last loop left it. */
      flat(`d${d}-${cycle - 1}`, cycle - 1, 2);
      flat(`d${d}-${cycle + 1}`, cycle + 1, 1);
      flat(`d${d}-${cycle}`, cycle, 0);
    } else if (local >= HALF) {
      /* Deck A after its turn: the sent card at the back, the next at the front. */
      flat(`d${d}-${cycle}`, cycle, 2);
      flat(`d${d}-${cycle + 2}`, cycle + 2, 1);
      flat(`d${d}-${cycle + 1}`, cycle + 1, 0);
    } else {
      /* This deck's turn. */
      const forward = easeInOut(seg(local, T.forward[0], T.forward[1]));
      flat(`d${d}-${cycle + 2}`, cycle + 2, 2 - forward);
      flat(`d${d}-${cycle + 1}`, cycle + 1, 1 - forward);
      const grab = grabOf(d);
      const pulled = pulledOf(d);
      const offset = { x: grab.x - CARD_X, y: grab.y - deckY };
      const hover = easeOut(seg(local, T.hover[0], T.hover[1]));
      let x = CARD_X;
      let y = deckY - 2 * hover;
      let tilt = 0;
      let scale = 1 + 0.01 * hover;
      let content = 1;
      let bg = "#ffffff";
      let z = zBase + 30;
      let lift = hover * 0.3;
      let origin = `${offset.x}px ${offset.y}px`;
      if (local >= T.drag[0] && local < T.drag[1]) {
        const lagged = cursorAt(d * HALF + Math.max(local - LAG, T.drag[0]));
        x = lagged.x - offset.x;
        y = lagged.y - offset.y;
        const v = cursorAt(t).x - cursorAt(t - 60).x;
        tilt = Math.max(-5, Math.min(5, v * 0.9)) + 2 * Math.sin(seg(local, T.drag[0], T.drag[1]) * Math.PI);
        scale = 1.03;
        lift = 1;
      } else if (local >= T.back[0]) {
        const p = easeInOut(seg(local, T.back[0], T.back[1]));
        const L = layer(deckY, 2);
        x = lerp(pulled.x - offset.x, CARD_X, p);
        y = lerp(pulled.y - offset.y, L.y, p) + Math.sin(p * Math.PI) * 18;
        tilt = 2 * (1 - p);
        scale = lerp(1.03, L.scale, p);
        content = 1 - seg(p, 0, 0.3);
        bg = p > 0.5 ? L.bg : "#ffffff";
        lift = 1 - p;
        z = p < 0.08 ? zBase + 30 : zBase + 5;
        origin = "50% 100%";
      }
      views.push({ key: `d${d}-${cycle}`, ...seq(d, cycle), x, y, scale, tilt, bg, content, visible: 1, z, lift, origin });
    }
  }

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Twin research decks">
      {/* The status: what is happening, centred over both decks. */}
      <span className="absolute left-0 right-0 flex items-center justify-center gap-[8px]" style={{ top: STATUS_Y }}>
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Researching your category
        </span>
      </span>

      {views.map(v => (
        <div
          key={v.key}
          className="absolute overflow-hidden rounded-[14px]"
          style={{
            left: v.x,
            top: v.y,
            width: CARD_W,
            height: CARD_H,
            zIndex: v.z,
            background: v.bg,
            opacity: v.visible,
            transform: `rotate(${v.tilt.toFixed(2)}deg) scale(${v.scale.toFixed(4)})`,
            transformOrigin: v.origin,
            boxShadow: shadowFor(clamp01(v.lift)),
          }}
        >
          <span className="block size-full" style={{ opacity: v.content }}>
            <AnonBody company={v.company} signal={v.signal} />
          </span>
        </div>
      ))}

      {/* Above both decks, whatever their stacking. */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 200 }}>
          <Cursor at={cursor} pressed={pressed} />
        </div>
      )}
    </div>
  );
}
