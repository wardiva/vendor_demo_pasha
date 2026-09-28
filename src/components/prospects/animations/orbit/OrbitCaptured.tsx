import { FONT, INK, IntentChip, LiveDot, MUTED, useCompanies, type Company } from "../shared";
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
  lerp,
  pick,
  polar,
  seg,
  thread,
  useLoopClock,
} from "./kit";

/**
 * Orbit Variation 2 — Captured.
 *
 * The orbit read as gravity. Your profile holds a ring of the prospects it
 * has already identified — sharp, named by their logos, each carrying its
 * intent — turning slowly around it. Out beyond, anonymous companies drift.
 *
 * One comes in from outside the frame. It swings into the outer field and
 * starts to research you: three signals fire from it into your profile —
 * Category, Profile, Pricing — each brighter than the last because each is
 * worth more, and each closes a third of the ring around it. With the ring
 * closed it is captured: it falls inward on a spiral into the prospect ring,
 * coming into focus as it goes, and takes the place of the oldest prospect,
 * which gives way. A card confirms who it is. The ring keeps turning.
 *
 * The treatment adds what the approved orbit only implied: that identified
 * prospects accumulate around you, and that the pull is earned by signals.
 */

const LOOP = 8200;
const REST = 6400;
const CY = 232;
const R_FIELD = 150;
const R_RING = 86;
const SLOTS = 5;
const SPIN = 0.0055; // degrees per ms — one turn a little under 70s

const PULSES = [
  { at: 1500, label: "Category" as const, bend: -34 },
  { at: 2500, label: "Profile" as const, bend: 30 },
  { at: 3500, label: "Pricing" as const, bend: -12 },
];
const TRAVEL = 650;
const CAPTURE = [4300, 5500] as const;

/* Anonymous companies drifting on the outer field, as starting angles. */
const DRIFT = [-150, -95, -20, 40, 110, 165];

export default function OrbitCaptured() {
  const prospects = useCompanies(85);
  const everyone = useCompanies(0);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < SLOTS + 1 || everyone.length < DRIFT.length) return null;

  const captured = (c: number) => pick(prospects, c + 3);
  const slot = ((cycle % SLOTS) + SLOTS) % SLOTS;
  const spin = now * SPIN;
  const slotAngle = (k: number) => spin + k * (360 / SLOTS) - 90;
  const occupant = (k: number): Company => {
    const back = (((cycle - k) % SLOTS) + SLOTS) % SLOTS || SLOTS;
    return captured(cycle - back);
  };

  /* The newcomer's path: in from outside, a slow drift while it researches,
     then the fall into its slot. */
  const c = captured(cycle);
  const a0 = -30 + ((cycle * 97) % 360);
  const enter = easeOut(seg(t, 0, 1300));
  const drift = seg(t, 1300, CAPTURE[0]);
  const fall = easeInOut(seg(t, CAPTURE[0], CAPTURE[1]));
  const orbitA = a0 + 40 * enter + 26 * drift;
  const orbitR = lerp(250, R_FIELD - 4, enter);
  let target = slotAngle(slot);
  while (target - orbitA > 180) target -= 360;
  while (target - orbitA < -180) target += 360;
  const ang = lerp(orbitA, target, fall);
  const rad = lerp(orbitR, R_RING, fall);
  const pos = polar(CX, CY, ang, rad);
  const landed = PULSES.filter(p => t >= p.at + TRAVEL).length;
  const focus = easeOut(seg(t, 4500, 5400));
  const capturedNow = t >= CAPTURE[1];
  const size = lerp(30, 34, focus);
  const count = 11 + (cycle % 30) + (t >= CAPTURE[1] ? 1 : 0);

  /* The prospect it replaces steps out as it arrives. */
  const retire = 1 - seg(t, 3800, 4400);
  /* The card below always names the latest prospect: the last loop's until
     this one's is captured, then this one, with a flash of lime to mark it. */
  const fresh = t >= CAPTURE[1];
  const shown = fresh ? c : captured(cycle - 1);
  const flash = fresh ? 1 - seg(t, 5700, 6900) : 0;

  const core = { x: CX, y: CY };

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: LIVE }} aria-hidden data-name="Animation / Orbit captured">
      {/* A faint lift at the centre of the field — depth, not decoration. */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at ${CX}px ${CY}px, rgba(177,250,99,0.07) 0px, rgba(177,250,99,0) 190px)` }}
      />

      <svg className="absolute inset-0" width={W} height="100%" aria-hidden>
        <circle cx={CX} cy={CY} r={R_FIELD} fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="2 5" />
        <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke="rgba(177,250,99,0.16)" />

        {/* The signals: each thread appears as its pulse leaves and stays as a trace until capture. */}
        {PULSES.map((p, i) => {
          const th = thread(pos, core, p.bend);
          const go = seg(t, p.at, p.at + TRAVEL);
          const trace = t >= p.at && t < CAPTURE[0] + 300 ? (t < CAPTURE[0] ? 0.28 : 0.28 * (1 - seg(t, CAPTURE[0], CAPTURE[0] + 300))) : 0;
          const dot = th.at(easeInOut(go));
          const live = t >= p.at && t < p.at + TRAVEL;
          return (
            <g key={i}>
              <path d={th.d} fill="none" stroke={SIGNAL_TONE[p.label]} strokeWidth="1.25" opacity={trace} />
              {live && (
                <>
                  <circle cx={dot.x} cy={dot.y} r="7" fill={SIGNAL_TONE[p.label]} opacity="0.18" />
                  <circle cx={dot.x} cy={dot.y} r="3.5" fill={SIGNAL_TONE[p.label]} />
                </>
              )}
            </g>
          );
        })}

        {!capturedNow && <RingGauge x={pos.x} y={pos.y} r={size / 2 + 6} p={landed / 3} opacity={1 - focus} />}
      </svg>

      {/* The field's anonymous drifters. */}
      {DRIFT.map((a, i) => {
        const p = polar(CX, CY, a - now * 0.003 + i * 3, R_FIELD + (i % 2 ? -10 : 8));
        return <CompanyDisc key={i} company={pick(everyone, i * 3 + 1)} size={26} focus={0} style={{ left: p.x, top: p.y, opacity: 0.8 }} />;
      })}

      {/* Your profile. */}
      <span
        className="absolute flex size-[60px] items-center justify-center rounded-[100px]"
        style={{ left: CX - 30, top: CY - 30, background: "#0e3b3b", boxShadow: `0 0 0 2px ${LIME}, 0 0 0 10px rgba(177,250,99,0.06)` }}
      >
        {PULSES.map((p, i) =>
          t >= p.at + TRAVEL && t < p.at + TRAVEL + 900 ? (
            <span key={i} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 2px ${LIME}`, animationDelay: "0ms" }} />
          ) : null,
        )}
        <ProfileGlyph size={20} />
      </span>
      <span
        className={`${FONT} absolute -translate-x-1/2 font-medium leading-[14px] text-[11px] whitespace-nowrap`}
        style={{ left: CX, top: CY + 38, color: WHITE_MID }}
      >
        Your profile
      </span>

      {/* The prospect ring. */}
      {Array.from({ length: SLOTS }).map((_, k) => {
        const p = polar(CX, CY, slotAngle(k), R_RING);
        const who = occupant(k);
        const leaving = k === slot && !capturedNow;
        if (leaving && retire <= 0) return null;
        const s = leaving ? retire : 1;
        return (
          <span key={`${k}-${who.id}`} className="absolute" style={{ left: p.x, top: p.y, opacity: s, transform: `scale(${0.6 + 0.4 * s})` }}>
            <CompanyDisc company={who} size={32} focus={1} style={{ left: 0, top: 0, boxShadow: `0 0 0 1.5px ${LIVE}, 0 0 0 3px rgba(177,250,99,0.55)` }} />
            <span
              className={`${FONT} absolute -translate-x-1/2 rounded-[5px] px-[5px] font-semibold leading-[14px] text-[9.5px] tabular-nums`}
              style={{ top: 19, background: "rgba(4,28,28,0.85)", color: LIME }}
            >
              {`${who.score}%`}
            </span>
          </span>
        );
      })}

      {/* The newcomer. */}
      <span className="absolute" style={{ left: pos.x, top: pos.y, zIndex: 3, opacity: seg(t, 0, 500) }}>
        <CompanyDisc
          company={c}
          size={capturedNow ? 32 : size}
          focus={focus}
          style={{ left: 0, top: 0, boxShadow: focus > 0.5 ? `0 0 0 1.5px ${LIVE}, 0 0 0 3px rgba(177,250,99,${(0.55 * focus).toFixed(2)})` : "none" }}
        />
        {capturedNow && (
          <span
            className={`${FONT} bi-pop absolute -translate-x-1/2 rounded-[5px] px-[5px] font-semibold leading-[14px] text-[9.5px] tabular-nums`}
            style={{ top: 19, background: "rgba(4,28,28,0.85)", color: LIME }}
          >
            {`${c.score}%`}
          </span>
        )}
      </span>

      {/* The signal naming itself as it leaves the company. */}
      {PULSES.map(p => {
        const on = seg(t, p.at, p.at + 180) * (1 - seg(t, p.at + 800, p.at + 1000));
        if (on <= 0) return null;
        const above = pos.y > CY;
        return (
          <span
            key={p.label}
            className={`${FONT} absolute flex h-[20px] -translate-x-1/2 items-center gap-[5px] whitespace-nowrap rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
            style={{
              left: Math.min(Math.max(pos.x, 44), W - 44),
              top: above ? pos.y + 22 : pos.y - 42,
              background: "rgba(4,28,28,0.9)",
              color: SIGNAL_TONE[p.label],
              boxShadow: `0 0 0 1px rgba(177,250,99,0.25)`,
              opacity: on,
              zIndex: 4,
            }}
          >
            <span className="block size-[5px] rounded-[100px]" style={{ background: SIGNAL_TONE[p.label] }} />
            {p.label}
          </span>
        );
      })}

      {/* The field's heading and the running count. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]">
        <LiveDot dark />
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: WHITE_MID }}>
          Companies researching you
        </span>
      </span>
      <span className="absolute right-[18px] top-[14px] flex items-baseline gap-[6px]">
        <span key={count} className={`${FONT} bi-count font-semibold leading-[22px] text-[18px] tabular-nums`} style={{ color: LIME }}>
          {count}
        </span>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: WHITE_LO }}>
          prospects
        </span>
      </span>

      {/* The latest prospect. */}
      <div
        className="absolute left-[16px] right-[16px] rounded-[14px] bg-white px-[14px] py-[12px]"
        style={{
          bottom: 16,
          boxShadow: `0 0 0 ${(3 * flash).toFixed(2)}px rgba(177,250,99,${(0.9 * flash).toFixed(2)}), 0px 12px 28px 0px rgba(0,0,0,0.3)`,
          transform: `scale(${(1 + 0.015 * flash).toFixed(4)})`,
        }}
      >
        <div key={shown.id + (fresh ? "-new" : "-old")} className={`flex flex-col gap-[10px] ${fresh ? "bi-feed-in" : ""}`}>
        <span className="flex items-center gap-[10px]">
          <img alt="" src={shown.logo} className="block size-[36px] shrink-0 rounded-[9px] object-cover" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className={`${FONT} flex items-center gap-[5px] leading-[14px] text-[10.5px]`} style={{ color: MUTED }}>
              <span className="block size-[5px] rounded-[100px]" style={{ background: fresh ? "#6bbf1e" : "rgba(47,43,61,0.3)" }} />
              {fresh ? "New prospect identified" : "Latest prospect"}
            </span>
            <span className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
              {shown.name}
            </span>
          </span>
          <IntentChip score={shown.score} />
        </span>
        <span className="flex items-center gap-[5px]">
          {(["Category", "Profile", "Pricing"] as const).map(s => (
            <span
              key={s}
              className={`${FONT} flex h-[20px] items-center gap-[4px] rounded-[6px] px-[6px] leading-[14px] text-[10.5px]`}
              style={{ background: "rgba(7,41,41,0.06)", color: INK }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 5.2L4.1 7.2L8 3.2" stroke={LIVE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {s}
            </span>
          ))}
          <span className={`${FONT} ml-auto truncate leading-[14px] text-[10.5px]`} style={{ color: MUTED }}>
            {shown.industry}
          </span>
        </span>
        </div>
      </div>
    </div>
  );
}
