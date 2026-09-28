import { FONT, INK, IntentChip, LiveDot, MUTED, useCompanies } from "../shared";
import {
  CX,
  CompanyDisc,
  LIME,
  LIVE,
  ProfileGlyph,
  RingGauge,
  SIGNAL_TONE,
  W,
  WHITE_LO,
  WHITE_MID,
  easeInOut,
  easeOut,
  easeOutBack,
  lerp,
  pick,
  polar,
  seg,
  thread,
  useLoopClock,
} from "./kit";

/**
 * Orbit Variation 3 — Intent field.
 *
 * The same field, with the data turned on. Every company around your profile
 * wears its intent as a gauge — a ring filled to its score, dim for the ones
 * only browsing, lime for the ones close to buying — and every one of them is
 * sending you signals: small points of light streaming in along their threads,
 * more of them from the companies that are more engaged. The field stops
 * being a picture of "some companies" and becomes a live read of a market.
 *
 * Against that, one company does what the others have not. Its signals land
 * one after another — Category, Profile, Pricing — and its gauge climbs band
 * by band. As it crosses 71% it ignites: it swells, comes into focus, its
 * ring turns solid lime, and a card names it with the evidence. Then it is
 * entered at the top of the "In market now" list at the foot of the panel,
 * which is what a sales team would open first.
 *
 * Intent is no longer implied by distance; it is measured, on every company,
 * all the time — and the prospect is the one that crosses the line.
 */

const LOOP = 7800;
const REST = 5200;
const CY = 196;
const SLOTS = [
  { a: -150, r: 138 },
  { a: -105, r: 108 },
  { a: -60, r: 138 },
  { a: -15, r: 108 },
  { a: 30, r: 138 },
  { a: 75, r: 108 },
  { a: 120, r: 138 },
  { a: 165, r: 108 },
];
const ORDER = [3, 6, 1, 4, 7, 2, 5, 0];
/* The field's resting intent, one per slot: most browsing, a few warming. */
const BASE = [34, 46, 58, 41, 52, 37, 63, 44];

const PULSES = [
  { at: 700, label: "Category" as const, score: 38, bend: -40 },
  { at: 1800, label: "Profile" as const, score: 61, bend: 0 },
  { at: 2900, label: "Pricing" as const, score: 0, bend: 40 },
];
const TRAVEL = 700;
const IGNITE = 3700;
const LIST_TOP = 404;

const tone = (score: number) => (score >= 71 ? LIME : score >= 51 ? "rgba(177,250,99,0.62)" : "rgba(255,255,255,0.4)");

export default function OrbitIntentField() {
  const prospects = useCompanies(85);
  const everyone = useCompanies(0);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < 4 || everyone.length < SLOTS.length) return null;

  const targetSlot = ORDER[cycle % ORDER.length];
  const target = pick(prospects, cycle + 1);
  const core = { x: CX, y: CY };
  const home = polar(CX, CY, SLOTS[targetSlot].a, SLOTS[targetSlot].r);

  /* The target's intent climbs as each signal lands; each step eases in. */
  const scores = [22, 38, 61, target.score];
  let score = scores[0];
  PULSES.forEach((p, i) => {
    const k = easeOut(seg(t, p.at + TRAVEL, p.at + TRAVEL + 500));
    score = lerp(score, scores[i + 1], k);
  });
  const ignite = easeOutBack(seg(t, IGNITE, IGNITE + 600));
  const size = lerp(30, 46, ignite);
  const card = seg(t, IGNITE + 300, IGNITE + 700) * (1 - seg(t, 6500, 6900));
  const entered = t >= 6600;

  /* Signals received today — ticking on as the field streams in. */
  const today = 128 + Math.floor(now / 460);

  /* The list: this loop's prospect enters at the top once it has been named. */
  const list = [...(entered ? [target] : []), pick(prospects, cycle), pick(prospects, cycle - 1), pick(prospects, cycle - 2)].slice(0, 3);

  /* The name card sits in the band between the field and the list, joined
     to the company by a leader, and hands over to the list when it goes. */
  const CARD_TOP = 330;
  const leaderX = Math.min(Math.max(home.x, 40), W - 40);

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: LIVE }} aria-hidden data-name="Animation / Orbit intent field">
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden>
        {[108, 138].map(r => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 5" />
        ))}
        {/* Every company's thread, faint; the target's brightens as it works. */}
        {SLOTS.map((s, i) => {
          const p = polar(CX, CY, s.a, s.r);
          const th = thread(p, core, i % 2 ? 22 : -22);
          const mine = i === targetSlot;
          return <path key={i} d={th.d} fill="none" stroke={mine ? "rgba(177,250,99,0.35)" : "rgba(255,255,255,0.07)"} strokeWidth={mine ? 1.25 : 1} />;
        })}
        {/* The target's signals, each a bright point with a halo. */}
        {PULSES.map(p => {
          const go = seg(t, p.at, p.at + TRAVEL);
          if (t < p.at || t >= p.at + TRAVEL) return null;
          const th = thread(home, core, targetSlot % 2 ? 22 : -22);
          const d = th.at(easeInOut(go));
          return (
            <g key={p.label}>
              <circle cx={d.x} cy={d.y} r="8" fill={SIGNAL_TONE[p.label]} opacity="0.2" />
              <circle cx={d.x} cy={d.y} r="3.5" fill={SIGNAL_TONE[p.label]} />
            </g>
          );
        })}
        {/* Intent gauges round every company. */}
        {SLOTS.map((s, i) => {
          const p = polar(CX, CY, s.a, s.r);
          const mine = i === targetSlot;
          const v = mine ? score : BASE[i];
          const r = mine ? size / 2 + 5 : 20;
          return <RingGauge key={i} x={p.x} y={p.y} r={r} p={v / 100} color={tone(v)} track="rgba(255,255,255,0.08)" width={mine ? 2.5 : 2} />;
        })}
      </svg>

      {/* The ambient stream: points of light running in along every thread,
          more of them from the companies that are more engaged. */}
      {SLOTS.map((s, i) => {
        if (i === targetSlot) return null;
        const p = polar(CX, CY, s.a, s.r);
        const th = thread(p, core, i % 2 ? 22 : -22);
        const n = BASE[i] >= 55 ? 3 : BASE[i] >= 42 ? 2 : 1;
        return Array.from({ length: n }).map((_, j) => (
          <span
            key={`${i}-${j}`}
            className="bi-stream absolute left-0 top-0 block size-[4px] rounded-[100px]"
            style={{
              offsetPath: `path('${th.d}')`,
              background: tone(BASE[i]),
              animationDuration: `${2600 + i * 170}ms`,
              animationDelay: `${-((i * 530 + j * (2600 / n)) % 2600)}ms`,
            }}
          />
        ));
      })}

      {/* Your profile, and what it has taken in today. */}
      <span
        className="absolute flex size-[58px] items-center justify-center rounded-[100px]"
        style={{ left: CX - 29, top: CY - 29, background: "#0e3b3b", boxShadow: `0 0 0 2px ${LIME}, 0 0 0 10px rgba(177,250,99,0.05)` }}
      >
        {PULSES.map(p =>
          t >= p.at + TRAVEL && t < p.at + TRAVEL + 900 ? (
            <span key={p.label} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 2px ${LIME}`, animationDelay: "0ms" }} />
          ) : null,
        )}
        <ProfileGlyph size={20} />
      </span>
      <span className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: CX, top: CY + 36 }}>
        <span className={`${FONT} font-medium leading-[14px] text-[11px] whitespace-nowrap`} style={{ color: WHITE_MID }}>
          Your profile
        </span>
        <span className={`${FONT} leading-[14px] text-[10px] tabular-nums whitespace-nowrap`} style={{ color: WHITE_LO }}>
          {`${today} signals today`}
        </span>
      </span>

      {/* The field. */}
      {SLOTS.map((s, i) => {
        if (i === targetSlot) return null;
        const p = polar(CX, CY, s.a, s.r);
        return <CompanyDisc key={i} company={pick(everyone, i * 3 + cycle)} size={28} focus={0} style={{ left: p.x, top: p.y }} />;
      })}
      <span className="absolute" style={{ left: home.x, top: home.y, zIndex: 3 }}>
        <CompanyDisc
          company={target}
          size={size}
          focus={ignite}
          style={{
            left: 0,
            top: 0,
            boxShadow: ignite > 0 ? `0 0 0 ${(6 * ignite).toFixed(1)}px rgba(177,250,99,0.16)` : "none",
          }}
        />
      </span>

      {/* The signal naming itself. */}
      {PULSES.map((p, i) => {
        const on = seg(t, p.at, p.at + 160) * (1 - seg(t, p.at + 900, p.at + 1080));
        if (on <= 0) return null;
        return (
          <span
            key={p.label}
            className={`${FONT} absolute flex h-[20px] -translate-x-1/2 items-center gap-[5px] whitespace-nowrap rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
            style={{
              left: Math.min(Math.max(home.x, 46), W - 46),
              top: home.y < CY ? home.y - 44 : home.y + 26,
              background: "rgba(4,28,28,0.92)",
              color: SIGNAL_TONE[p.label],
              boxShadow: "0 0 0 1px rgba(177,250,99,0.25)",
              opacity: on,
              zIndex: 4,
            }}
          >
            {p.label}
            <span className="tabular-nums" style={{ color: WHITE_MID }}>
              {`→ ${scores[i + 1]}%`}
            </span>
          </span>
        );
      })}

      {/* The leader from the company to its card. */}
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden style={{ zIndex: 4, pointerEvents: "none" }}>
        <line
          x1={home.x}
          y1={home.y + size / 2 + 6}
          x2={leaderX}
          y2={lerp(home.y + size / 2 + 6, CARD_TOP, easeOut(seg(t, IGNITE + 100, IGNITE + 450)))}
          stroke={LIME}
          strokeWidth="1.25"
          strokeDasharray="2 3"
          opacity={card}
        />
      </svg>

      {/* Named, with the evidence. */}
      <div
        className="absolute left-[16px] right-[16px] flex items-center gap-[10px] rounded-[12px] bg-white px-[12px] py-[10px]"
        style={{
          top: CARD_TOP,
          zIndex: 5,
          boxShadow: "0px 12px 28px 0px rgba(0,0,0,0.32)",
          opacity: card,
          transform: `translateY(${((1 - easeOut(card)) * -8 + seg(t, 6500, 6900) * 16).toFixed(2)}px)`,
        }}
      >
        <img alt="" src={target.logo} className="block size-[34px] shrink-0 rounded-[9px] object-cover" />
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className={`${FONT} truncate font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
            {target.name}
          </span>
          <span className={`${FONT} truncate leading-[14px] text-[10.5px]`} style={{ color: MUTED }}>
            Category · Profile · Pricing
          </span>
        </span>
        <span className="flex flex-col items-end gap-[4px]">
          <IntentChip score={target.score} size="sm" />
          <span className={`${FONT} rounded-[5px] px-[6px] font-medium leading-[16px] text-[10px]`} style={{ background: LIVE, color: LIME }}>
            In market
          </span>
        </span>
      </div>

      {/* Heading. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]">
        <LiveDot dark />
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: WHITE_MID }}>
          Intent across your field
        </span>
      </span>

      {/* In market now. */}
      <div className="absolute left-[16px] right-[16px] rounded-[12px] px-[12px] pb-[6px] pt-[10px]" style={{ top: LIST_TOP, background: "rgba(255,255,255,0.06)" }}>
        <div className="mb-[4px] flex items-center justify-between">
          <span className={`${FONT} font-medium leading-[16px] text-[11.5px]`} style={{ color: "#ffffff" }}>
            In market now
          </span>
          <span className={`${FONT} leading-[14px] text-[10.5px]`} style={{ color: WHITE_LO }}>
            Intent 71%+
          </span>
        </div>
        {list.map((c, i) => (
          <div
            key={`${c.id}-${i === 0 && entered ? "new" : i}`}
            className={`flex h-[34px] items-center gap-[10px] ${i === 0 && entered ? "bi-feed-in" : ""}`}
            style={{ borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <img alt="" src={c.logo} className="block size-[22px] shrink-0 rounded-[6px] object-cover" />
            <span className={`${FONT} min-w-0 flex-1 truncate leading-[16px] text-[12px]`} style={{ color: "rgba(255,255,255,0.9)" }}>
              {c.name}
            </span>
            <span className="relative block h-[4px] w-[64px] overflow-hidden rounded-[100px]" style={{ background: "rgba(255,255,255,0.1)" }}>
              <span className="absolute inset-y-0 left-0 rounded-[100px]" style={{ width: `${c.score}%`, background: LIME }} />
            </span>
            <span className={`${FONT} w-[30px] text-right font-semibold leading-[16px] text-[11.5px] tabular-nums`} style={{ color: LIME }}>
              {`${c.score}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
