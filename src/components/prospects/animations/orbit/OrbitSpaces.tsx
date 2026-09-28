import { FONT, IntentChip, LiveDot, useCompanies } from "../shared";
import {
  CX,
  CompanyDisc,
  LIME,
  LIVE,
  ProfileGlyph,
  RingGauge,
  SIGNAL_TONE,
  W,
  WHITE_MID,
  easeInOut,
  easeOut,
  lerp,
  pick,
  polar,
  seg,
  thread,
  useLoopClock,
} from "./kit";

/**
 * Orbit Variation 6 — Spaces.
 *
 * The orbit read as a live room. Inspired by the way a live audio space
 * gathers people round a subject — concentric rings, participants riding
 * them, names surfacing as people speak — and rebuilt for what Buyer
 * Intelligence shows: companies gathering round your category.
 *
 * Your category is the host, at the centre. Companies are the participants,
 * turning slowly on the rings round it, each ring at its own pace, so the room
 * is always in motion. When a company starts to research you it "speaks":
 * waves ripple out from it, and its signals — Category, Profile, Pricing —
 * run in to your category, each closing a third of a ring round it. With the
 * ring closed it is identified: it comes into focus, a name pill surfaces
 * beside it carrying its intent score, and it stays connected to your
 * category by a thread while it rides round. Several can be in the room,
 * named, at once. After a while it steps back and someone new takes its
 * place. A ticker at the foot narrates the room as it happens.
 *
 * Nothing here is borrowed from the product that inspired it but the idea of
 * a gathering — the rings, the host and the surfacing names are drawn in the
 * product's own teal, lime and intent colours.
 */

const CY = 250;
const RINGS = [
  { r: 92, speed: 0.01, size: 26 },
  { r: 132, speed: -0.0068, size: 28 },
  { r: 172, speed: 0.0048, size: 24 },
];
const PER_RING = 4;
const SLOTS = RINGS.length * PER_RING;
const STEP = 2600; // a new company starts to research every 2.6s
const SIGNALS = [
  { at: 0, label: "Category" as const, text: "viewed Category Page" },
  { at: 700, label: "Profile" as const, text: "viewed Product Profile" },
  { at: 1400, label: "Pricing" as const, text: "viewed Pricing" },
];
const TRAVEL = 600;
const IDENTIFY = 2100;
const NAMED_FOR = 4000; // two names in the room at most
const LEAVE = 600;
const LIFETIME = IDENTIFY + NAMED_FOR + LEAVE;
const REST = 9800;
const PILL_W = 204;
/* Where names surface: the four diagonals, taken in turn so consecutive names
   land on opposite sides of the room — never level with the host, where a
   name would cover your category. */
const STAGE = [-45, 135, -135, 45];
const OUTER = [4, 5, 6, 7, 8, 9, 10, 11];

const angleAt = (slot: number, t: number) => {
  const ring = RINGS[Math.floor(slot / PER_RING)];
  return (slot % PER_RING) * (360 / PER_RING) + Math.floor(slot / PER_RING) * 30 + ring.speed * t;
};
const gap = (a: number, b: number) => {
  const d = (((a - b) % 360) + 540) % 360 - 180;
  return Math.abs(d);
};

/* Which participant researches in the k-th turn: whichever outer company will
   be passing this turn's stage position when it is identified, skipping the
   ones still named from the turns before. Deterministic in k, so memoised. */
const chosen = new Map<number, number>();
function slotFor(k: number): number {
  const hit = chosen.get(k);
  if (hit !== undefined) return hit;
  const busy = new Set<number>();
  for (let j = 1; j * STEP < LIFETIME; j++) if (k - j >= 0) busy.add(slotFor(k - j));
  const when = k * STEP + IDENTIFY;
  const want = STAGE[k % STAGE.length];
  let best = OUTER[0];
  let bestGap = Infinity;
  for (const slot of OUTER) {
    if (busy.has(slot)) continue;
    const g = gap(angleAt(slot, when), want);
    if (g < bestGap) {
      bestGap = g;
      best = slot;
    }
  }
  chosen.set(k, best);
  return best;
}

export default function OrbitSpaces() {
  const prospects = useCompanies(80);
  const { now } = useLoopClock(1e12, REST);
  if (prospects.length < 6) return null;

  /* Turns are a pure function of time: the k-th starts at k·STEP. */
  const kNow = Math.floor(now / STEP);
  const byslot = new Map<number, number>();
  const active: number[] = [];
  for (let k = Math.max(0, kNow - Math.ceil(LIFETIME / STEP)); k <= kNow; k++) if (now >= k * STEP && now < k * STEP + LIFETIME) active.push(k);
  const lifetime = LIFETIME;
  const slotOf = slotFor;
  active.forEach(k => byslot.set(slotOf(k), k));

  /* Who is where: the company of a turn while it is on, a quiet participant otherwise. */
  const occupant = (slot: number, k?: number) =>
    k === undefined
      ? { company: pick(prospects, slot * 5 + 2), key: `idle-${slot}` }
      : { company: pick(prospects, k * 3 + 1), key: `turn-${k}` };

  /* A company that is researching glides along its ring to its turn's stage
     position — stepping forward to speak — so its name always surfaces on a
     diagonal, clear of your category. */
  const posOf = (slot: number) => {
    const k = byslot.get(slot);
    let a = angleAt(slot, now);
    if (k !== undefined) {
      const s0 = k * STEP;
      const want = STAGE[k % STAGE.length];
      const delta = ((((want - angleAt(slot, s0 + IDENTIFY)) % 360) + 540) % 360) - 180;
      a += delta * easeInOut(seg(now, s0, s0 + IDENTIFY));
    }
    return polar(CX, CY, a, RINGS[Math.floor(slot / PER_RING)].r);
  };
  const core = { x: CX, y: CY };


  /* The ticker: the most recent thing that happened in the room. */
  type Tick = { key: string; at: number; k: number; kind: "signal" | "named"; i: number };
  const events: Tick[] = active.flatMap(k => [
    ...SIGNALS.map((sg, i): Tick => ({ key: `${k}-s${i}`, at: k * STEP + sg.at, k, kind: "signal", i })),
    { key: `${k}-n`, at: k * STEP + IDENTIFY, k, kind: "named" as const, i: 0 },
  ]);
  /* A name holds the ticker for a moment before the next visit displaces it. */
  const past = events.filter(e => now >= e.at).sort((a, b) => b.at - a.at);
  const tick = past.find(e => e.kind === "named" && now - e.at < 1800) ?? past[0] ?? null;
  const tickCompany = tick ? occupant(slotOf(tick.k), tick.k).company : null;
  const researching = 21 + (kNow % 7);

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: LIVE }} aria-hidden data-name="Animation / Orbit spaces">
      {/* The room. */}
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden>
        {[56, 92, 132, 172, 212].map((r, i) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={i % 2 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"} />
        ))}
        {active.map(k => {
          const slot = slotOf(k);
          const s = k * STEP;
          const p = posOf(slot);
          const named = now >= s + IDENTIFY;
          const leaving = seg(now, s + IDENTIFY + NAMED_FOR, s + lifetime);
          return (
            <g key={k}>
              {SIGNALS.map((sg, i) => {
                const th = thread(p, core, i === 1 ? 0 : i === 0 ? -26 : 26);
                const go = seg(now, s + sg.at, s + sg.at + TRAVEL);
                if (now < s + sg.at || now >= s + sg.at + TRAVEL) return null;
                const d = th.at(easeInOut(go));
                return (
                  <g key={i}>
                    <path d={th.d} fill="none" stroke={SIGNAL_TONE[sg.label]} strokeWidth="1" opacity={0.3} />
                    <circle cx={d.x} cy={d.y} r="7" fill={SIGNAL_TONE[sg.label]} opacity="0.2" />
                    <circle cx={d.x} cy={d.y} r="3.2" fill={SIGNAL_TONE[sg.label]} />
                  </g>
                );
              })}
              {/* Once named, it stays connected to your category. */}
              {named && (
                <line x1={p.x} y1={p.y} x2={CX} y2={CY} stroke={LIME} strokeWidth="1" opacity={0.28 * easeOut(seg(now, s + IDENTIFY, s + IDENTIFY + 500)) * (1 - leaving)} />
              )}
              {!named && (
                <RingGauge
                  x={p.x}
                  y={p.y}
                  r={RINGS[Math.floor(slot / PER_RING)].size / 2 + 5}
                  p={SIGNALS.filter(sg => now >= s + sg.at + TRAVEL).length / 3}
                  track="rgba(255,255,255,0.1)"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* The participants. */}
      {Array.from({ length: SLOTS }).map((_, slot) => {
        const k = byslot.get(slot);
        const s = k === undefined ? 0 : k * STEP;
        const who = occupant(slot, k);
        const p = posOf(slot);
        const ring = RINGS[Math.floor(slot / PER_RING)];
        const researching = k !== undefined && now < s + IDENTIFY;
        const focus = k === undefined ? 0 : easeOut(seg(now, s + IDENTIFY, s + IDENTIFY + 500));
        const leaving = k === undefined ? 0 : seg(now, s + IDENTIFY + NAMED_FOR, s + lifetime);
        const size = lerp(ring.size, 32, focus * (1 - leaving));
        return (
          <span key={who.key} className="bi-pop absolute" style={{ left: p.x, top: p.y, zIndex: focus > 0 ? 4 : researching ? 3 : 1, opacity: 1 - leaving }}>
            {researching && (
              <>
                <span className="bi-wave absolute block rounded-[100px]" style={{ width: size, height: size, left: -size / 2, top: -size / 2, boxShadow: `0 0 0 1.5px ${LIME}` }} />
                <span
                  className="bi-wave absolute block rounded-[100px]"
                  style={{ width: size, height: size, left: -size / 2, top: -size / 2, boxShadow: `0 0 0 1.5px ${LIME}`, animationDelay: "700ms" }}
                />
              </>
            )}
            <CompanyDisc
              company={who.company}
              size={size}
              focus={focus}
              style={{
                left: 0,
                top: 0,
                boxShadow: focus > 0 ? `0 0 0 2px ${LIVE}, 0 0 0 ${(2 + 1.5 * focus).toFixed(1)}px ${LIME}` : researching ? `0 0 0 1.5px rgba(177,250,99,0.6)` : undefined,
              }}
            />
          </span>
        );
      })}

      {/* Names surfacing beside the companies that have been identified. */}
      {active.map(k => {
        const s = k * STEP;
        if (now < s + IDENTIFY) return null;
        const slot = slotOf(k);
        const p = posOf(slot);
        const who = occupant(slot, k).company;
        const show = easeOut(seg(now, s + IDENTIFY + 150, s + IDENTIFY + 550)) * (1 - seg(now, s + IDENTIFY + NAMED_FOR - 300, s + IDENTIFY + NAMED_FOR));
        if (show <= 0) return null;
        /* Above a company in the top half of the room, below one in the bottom —
           always on the far side from your category — and held in the frame. */
        const above = p.y < CY;
        const half = 16; // the named company's disc is 32px
        const left = Math.min(Math.max(p.x - PILL_W / 2, 8), W - 8 - PILL_W);
        return (
          <span
            key={`pill-${k}`}
            className="absolute flex h-[28px] items-center justify-between gap-[7px] whitespace-nowrap rounded-[100px] bg-white pl-[11px] pr-[4px]"
            style={{
              top: above ? p.y - half - 10 - 28 : p.y + half + 10,
              left,
              width: PILL_W,
              zIndex: 8,
              opacity: show,
              transform: `translateY(${((1 - show) * (above ? 6 : -6)).toFixed(1)}px) scale(${(0.92 + 0.08 * show).toFixed(3)})`,
              transformOrigin: above ? "center bottom" : "center top",
              boxShadow: "0px 8px 18px 0px rgba(0,0,0,0.32)",
            }}
          >
            <span className={`${FONT} min-w-0 truncate font-medium leading-[16px] text-[11.5px]`} style={{ color: "#2f2b3d" }}>
              {who.name}
            </span>
            <IntentChip score={who.score} size="sm" />
          </span>
        );
      })}

      {/* The signal naming itself as it leaves a company. */}
      {active.map(k => {
        const s = k * STEP;
        const slot = slotOf(k);
        const p = posOf(slot);
        return SIGNALS.map(sg => {
          const on = seg(now, s + sg.at, s + sg.at + 150) * (1 - seg(now, s + sg.at + 620, s + sg.at + 760));
          if (on <= 0) return null;
          return (
            <span
              key={`${k}-${sg.label}`}
              className={`${FONT} absolute flex h-[18px] -translate-x-1/2 items-center whitespace-nowrap rounded-[5px] px-[6px] font-medium leading-[12px] text-[10px]`}
              style={{
                left: Math.min(Math.max(p.x, 36), W - 36),
                top: p.y < CY ? p.y - 38 : p.y + 22,
                background: "rgba(4,28,28,0.92)",
                color: SIGNAL_TONE[sg.label],
                boxShadow: "0 0 0 1px rgba(177,250,99,0.25)",
                opacity: on,
                zIndex: 5,
              }}
            >
              {sg.label}
            </span>
          );
        });
      })}

      {/* The host: your category. */}
      <span
        className="absolute flex size-[72px] items-center justify-center rounded-[100px]"
        style={{ left: CX - 36, top: CY - 36, background: "#0e3b3b", boxShadow: `0 0 0 2px ${LIME}, 0 0 0 12px rgba(177,250,99,0.07), 0 0 0 24px rgba(177,250,99,0.03)`, zIndex: 7 }}
      >
        {active.flatMap(k =>
          SIGNALS.map(sg => {
            const at = k * STEP + sg.at + TRAVEL;
            return now >= at && now < at + 900 ? (
              <span key={`${k}-${sg.label}`} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 2px ${LIME}`, animationDelay: "0ms" }} />
            ) : null;
          }),
        )}
        <ProfileGlyph size={24} />
      </span>
      <span
        className="absolute flex -translate-x-1/2 flex-col items-center rounded-[10px] px-[10px] py-[5px]"
        style={{ left: CX, top: CY + 46, background: "rgba(4,28,28,0.85)", boxShadow: "0 0 0 1px rgba(177,250,99,0.18)", zIndex: 7 }}
      >
        <span className={`${FONT} leading-[12px] text-[10px]`} style={{ color: "rgba(177,250,99,0.85)" }}>
          Your category
        </span>
        <span className={`${FONT} font-medium leading-[16px] text-[12.5px] whitespace-nowrap text-white`}>Project Management</span>
      </span>

      {/* The room's heading and who is in it. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]" style={{ zIndex: 8 }}>
        <LiveDot dark />
        <span className={`${FONT} font-medium leading-[16px] text-[11.5px]`} style={{ color: "rgba(255,255,255,0.85)" }}>
          Live in your category
        </span>
      </span>
      <span className="absolute right-[18px] top-[14px] flex items-center gap-[7px]" style={{ zIndex: 8 }}>
        <span className="flex">
          {[0, 1, 2].map(i => (
            <span key={i} className="relative block size-[18px] overflow-hidden rounded-[100px]" style={{ marginLeft: i ? -6 : 0, boxShadow: `0 0 0 1.5px ${LIVE}` }}>
              <img alt="" src={pick(prospects, i * 5 + 2).logo} className="block size-full object-cover" style={{ filter: "blur(2px) grayscale(1)", opacity: 0.6 }} />
            </span>
          ))}
        </span>
        <span className={`${FONT} leading-[14px] text-[11px] tabular-nums`} style={{ color: WHITE_MID }}>
          {`${researching} researching`}
        </span>
      </span>

      {/* The ticker. */}
      <div
        className="absolute bottom-[16px] left-[16px] right-[16px] flex h-[48px] items-center gap-[10px] overflow-hidden rounded-[12px] px-[12px]"
        style={{ background: "rgba(255,255,255,0.07)", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)", zIndex: 8 }}
      >
        {tick && tickCompany && (
          <div key={tick.key} className="bi-feed-in flex min-w-0 flex-1 items-center gap-[10px]">
            {tick.kind === "named" ? (
              <>
                <img alt="" src={tickCompany.logo} className="block size-[26px] shrink-0 rounded-[100px] object-cover" style={{ boxShadow: `0 0 0 1.5px ${LIME}` }} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`${FONT} leading-[12px] text-[10px]`} style={{ color: LIME }}>
                    Prospect identified
                  </span>
                  <span className={`${FONT} truncate font-medium leading-[16px] text-[12px] text-white`}>{tickCompany.name}</span>
                </span>
                <IntentChip score={tickCompany.score} size="sm" />
              </>
            ) : (
              <>
                <span className="block size-[26px] shrink-0 overflow-hidden rounded-[100px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <img alt="" src={tickCompany.logo} className="block size-full object-cover" style={{ filter: "blur(3px) grayscale(1)", opacity: 0.45 }} />
                </span>
                <span className={`${FONT} min-w-0 flex-1 truncate leading-[16px] text-[12px]`} style={{ color: WHITE_MID }}>
                  <span className="font-medium text-white">Unknown company</span>
                  {` ${SIGNALS[tick.i].text}`}
                </span>
                <span className="block size-[6px] shrink-0 rounded-[100px]" style={{ background: SIGNAL_TONE[SIGNALS[tick.i].label] }} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
