import {
  AnonTile,
  BandBar,
  ContactStack,
  FAINT,
  FONT,
  HAIR,
  INK,
  LiveDot,
  MUTED,
  SIGNAL,
  Tick,
  maskDomain,
  useCompanies,
} from "../shared";
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
 * Orbit Variation 5 — Inspector.
 *
 * The orbit with its evidence laid open. The field keeps its place at the top
 * of the panel, tighter, and beneath it sits the thing a sales team actually
 * reads: an account record, the way the product would show it.
 *
 * When a company in the field starts to research you, it is selected — a
 * lime reticle settles round it, the rest of the field steps back, and a
 * leader line drops from it to the record below, so the reader always knows
 * which dot the record is about. Each research thread it sends to your
 * profile lands twice: as a line in the field and as a row in the record —
 * Viewed Category Page, Viewed Product Profile, Viewed Pricing, each with its
 * band — while the record's intent marker walks up the three bands. When the
 * last one lands, the dot comes into focus and the record resolves in the
 * same instant: "Unknown company" becomes a named account, its status turns
 * from Tracking to Prospect, and the contacts behind it appear, still
 * blurred, waiting for a reveal.
 *
 * Field and record are two views of one event, so the relationship between
 * company, activity, intent and prospect is shown rather than described.
 */

const LOOP = 8000;
const REST = 5200;
const CY = 150;
const SLOTS = [
  { a: -150, r: 122 },
  { a: -105, r: 94 },
  { a: -60, r: 122 },
  { a: -15, r: 94 },
  { a: 30, r: 122 },
  { a: 75, r: 94 },
  { a: 120, r: 122 },
  { a: 165, r: 94 },
];
const ORDER = [3, 6, 1, 4, 7, 2, 5, 0];
const PULSES = [
  { at: 900, label: "Category" as const, signal: SIGNAL.category, score: 38, bend: -30, when: "5d ago" },
  { at: 1900, label: "Profile" as const, signal: SIGNAL.profile, score: 61, bend: 0, when: "3d ago" },
  { at: 2900, label: "Pricing" as const, signal: SIGNAL.pricing, score: 0, bend: 30, when: "Today" },
];
const TRAVEL = 640;
const IDENTIFY = 3800;
const REC_TOP = 300;

export default function OrbitInspector() {
  const prospects = useCompanies(85);
  const everyone = useCompanies(0);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < 2 || everyone.length < SLOTS.length) return null;

  const slot = ORDER[cycle % ORDER.length];
  const target = pick(prospects, cycle + 4);
  const home = polar(CX, CY, SLOTS[slot].a, SLOTS[slot].r);
  const core = { x: CX, y: CY };

  const select = easeOut(seg(t, 200, 700));
  const leader = easeInOut(seg(t, 450, 900));
  const landed = PULSES.filter(p => t >= p.at + TRAVEL).length;
  const identified = t >= IDENTIFY;
  const focus = easeOut(seg(t, IDENTIFY, IDENTIFY + 600));
  const contacts = seg(t, IDENTIFY + 500, IDENTIFY + 900);
  const fade = seg(t, 7200, 7700);
  const dim = select * (1 - fade);
  const score = landed === 3 ? target.score : landed === 2 ? 61 : landed === 1 ? 38 : 30;

  /* The leader drops from the company to the record's edge, then along to its logo. */
  const leaderX = Math.min(Math.max(home.x, 40), W - 40);
  const leaderFromY = home.y + 22;
  const leaderLen = Math.max(REC_TOP - leaderFromY, 0);

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: LIVE }} aria-hidden data-name="Animation / Orbit inspector">
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden>
        {[94, 122].map(r => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="2 5" opacity={1 - dim * 0.5} />
        ))}
        {PULSES.map(p => {
          const th = thread(home, core, p.bend);
          const go = seg(t, p.at, p.at + TRAVEL);
          const trace = t >= p.at ? 0.4 * (1 - fade) : 0;
          const dot = th.at(easeInOut(go));
          const live = t >= p.at && t < p.at + TRAVEL;
          return (
            <g key={p.label}>
              <path d={th.d} fill="none" stroke={SIGNAL_TONE[p.label]} strokeWidth="1.25" opacity={trace} />
              {live && (
                <>
                  <circle cx={dot.x} cy={dot.y} r="7" fill={SIGNAL_TONE[p.label]} opacity="0.2" />
                  <circle cx={dot.x} cy={dot.y} r="3.5" fill={SIGNAL_TONE[p.label]} />
                </>
              )}
            </g>
          );
        })}
        {/* The reticle: a dashed ring that turns and tightens as it selects. */}
        <g opacity={select * (1 - fade)}>
          <circle
            cx={home.x}
            cy={home.y}
            r={lerp(30, 21, select)}
            fill="none"
            stroke={LIME}
            strokeWidth="1.25"
            strokeDasharray="3 4"
            transform={`rotate(${(now * 0.03).toFixed(1)} ${home.x} ${home.y})`}
          />
        </g>
        <RingGauge x={home.x} y={home.y} r={16} p={landed / 3} opacity={(1 - focus) * (1 - fade)} />
        {/* The leader. */}
        <line
          x1={leaderX}
          y1={leaderFromY}
          x2={leaderX}
          y2={leaderFromY + leaderLen * leader}
          stroke={LIME}
          strokeWidth="1.25"
          strokeDasharray="2 3"
          opacity={1 - fade}
        />
        {leader >= 1 && <circle cx={leaderX} cy={REC_TOP} r="3.5" fill={LIME} opacity={1 - fade} />}
      </svg>

      {/* The field. */}
      {SLOTS.map((s, i) => {
        if (i === slot) return null;
        const p = polar(CX, CY, s.a, s.r);
        return (
          <span key={i} className="absolute" style={{ left: p.x, top: p.y, opacity: 1 - dim * 0.55 }}>
            <CompanyDisc company={pick(everyone, i * 3 + 2)} size={24} focus={0} style={{ left: 0, top: 0 }} />
          </span>
        );
      })}
      <span className="absolute" style={{ left: home.x, top: home.y, zIndex: 3 }}>
        <CompanyDisc company={target} size={lerp(24, 30, focus)} focus={focus} />
      </span>

      {/* Your profile. */}
      <span
        className="absolute flex size-[50px] items-center justify-center rounded-[100px]"
        style={{ left: CX - 25, top: CY - 25, background: "#0e3b3b", boxShadow: `0 0 0 2px ${LIME}, 0 0 0 9px rgba(177,250,99,0.05)` }}
      >
        {PULSES.map(p =>
          t >= p.at + TRAVEL && t < p.at + TRAVEL + 900 ? (
            <span key={p.label} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 2px ${LIME}`, animationDelay: "0ms" }} />
          ) : null,
        )}
        <ProfileGlyph size={17} />
      </span>

      {/* Heading. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]">
        <LiveDot dark />
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: WHITE_MID }}>
          Researching your profile
        </span>
      </span>

      {/* The record. */}
      <div
        className="absolute left-[16px] right-[16px] rounded-[14px] bg-white p-[14px]"
        style={{ top: REC_TOP, boxShadow: "0px 14px 32px 0px rgba(0,0,0,0.32)", opacity: 1 - fade * 0.15 }}
      >
        <div className="flex h-[36px] items-center gap-[10px]">
          <span className="relative block size-[36px] shrink-0">
            <span className="absolute inset-0" style={{ opacity: 1 - focus }}>
              <AnonTile size={36} radius={9} />
            </span>
            <img
              alt=""
              src={target.logo}
              className="absolute inset-0 block size-full rounded-[9px] object-cover"
              style={{ opacity: focus, filter: `blur(${((1 - focus) * 5).toFixed(2)}px)` }}
            />
          </span>
          <span className="relative block h-[36px] min-w-0 flex-1">
            <span className="absolute inset-0 flex flex-col justify-center" style={{ opacity: 1 - focus }}>
              <span className={`${FONT} font-medium leading-[18px] text-[13.5px]`} style={{ color: "rgba(47,43,61,0.55)" }}>
                Unknown company
              </span>
              <span className={`${FONT} leading-[16px] text-[11px] tracking-[0.5px]`} style={{ color: FAINT }}>
                {maskDomain(target.domain)}
              </span>
            </span>
            <span className="absolute inset-0 flex flex-col justify-center" style={{ opacity: focus, transform: `translateY(${((1 - focus) * 4).toFixed(1)}px)` }}>
              <span className={`${FONT} truncate font-medium leading-[18px] text-[13.5px]`} style={{ color: INK }}>
                {target.name}
              </span>
              <span className={`${FONT} truncate leading-[16px] text-[11px]`} style={{ color: MUTED }}>
                {target.industry}
              </span>
            </span>
          </span>
          <span
            className={`${FONT} flex h-[22px] items-center gap-[5px] rounded-[6px] px-[8px] font-medium leading-[14px] text-[11px]`}
            style={{
              background: identified ? LIME : "rgba(7,41,41,0.06)",
              color: identified ? LIVE : MUTED,
              transition: "background 300ms, color 300ms",
            }}
          >
            {!identified && <LiveDot />}
            {identified ? "Prospect" : "Tracking"}
          </span>
        </div>

        <div className="my-[12px] h-px" style={{ background: HAIR }} />

        <div className="flex flex-col gap-[6px]">
          {PULSES.map((p, i) => {
            const on = landed > i;
            const appear = seg(t, p.at + TRAVEL - 100, p.at + TRAVEL + 250);
            return (
              <div key={p.label} className="flex h-[22px] items-center gap-[8px]" style={{ opacity: 0.35 + 0.65 * appear }}>
                <Tick on={on} />
                <span className={`${FONT} flex-1 leading-[16px] text-[12px]`} style={{ color: on ? INK : FAINT, fontWeight: on ? 500 : 400 }}>
                  {p.signal.label}
                </span>
                <span className={`${FONT} leading-[14px] text-[10.5px]`} style={{ color: FAINT, opacity: appear }}>
                  {p.when}
                </span>
                <span
                  className={`${FONT} flex h-[18px] w-[48px] items-center justify-center rounded-[5px] font-medium leading-[14px] text-[10px] tabular-nums`}
                  style={{ background: on ? (i === 2 ? "#C3FFC9" : i === 1 ? "#E6FFC3" : "#FEFFCA") : "rgba(47,43,61,0.05)", color: on ? INK : FAINT }}
                >
                  {p.signal.range}
                </span>
              </div>
            );
          })}
        </div>

        <div className="my-[12px] h-px" style={{ background: HAIR }} />

        <div className="flex items-center gap-[12px]">
          <span className={`${FONT} font-medium leading-[16px] text-[11.5px]`} style={{ color: INK }}>
            Intent
          </span>
          <BandBar score={score} markerVisible={landed > 0} />
          <span className={`${FONT} w-[34px] text-right font-semibold leading-[16px] text-[12px] tabular-nums`} style={{ color: landed ? LIVE : FAINT }}>
            {landed ? `${score}%` : "—"}
          </span>
        </div>

        <div className="mt-[12px] flex h-[24px] items-center justify-between" style={{ opacity: contacts, transform: `translateY(${((1 - contacts) * 4).toFixed(1)}px)` }}>
          <span className="flex items-center gap-[8px]">
            <ContactStack avatars={target.avatars} size={22} />
            <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTED }}>
              {`${target.avatars.length} ${target.avatars.length === 1 ? "contact" : "contacts"} to reveal`}
            </span>
          </span>
          <span
            className={`${FONT} flex h-[24px] items-center rounded-[7px] px-[9px] font-medium leading-[14px] text-[11px]`}
            style={{ background: LIVE, color: "#ffffff" }}
          >
            Reveal contacts
          </span>
        </div>
      </div>
    </div>
  );
}
