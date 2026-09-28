import {
  EASE,
  EASE_OUT,
  FONT,
  INK,
  IntentChip,
  LIME,
  LIVE,
  LiveDot,
  tr,
  useBeats,
  useCompanies,
  type Company,
} from "./shared";

/**
 * Animation Variation 5 — Into your orbit.
 *
 * A different metaphor for the same sentence: companies researching your
 * profile become visible prospects. Your profile sits at the centre of a dark
 * field. Around it, at a distance, companies drift — out of focus, grey,
 * unnamed. They are there; you cannot see who they are.
 *
 * One of them starts to research you. Each piece of research is a thread
 * drawn from it to your profile — Category, then Profile, then Pricing — and
 * each thread closes a third of a ring around it. Elsewhere a company pulls a
 * single thread and drifts off again: interest, not intent. When the ring
 * closes, the company is drawn in towards you, and as it comes closer it
 * comes into focus — its logo sharpens, its name and intent score appear.
 * Then it is collected into the tray of identified prospects at the foot, and
 * the field is quiet again, until the next one.
 *
 * Distance is the idea: the closer a company comes, the more you know, and
 * attention — research threads — is what pulls it in.
 */

/* 0 quiet · 1 first thread · 2 second thread (and a stray one elsewhere) ·
   3 third thread · 4 drawn in · 5 named · 6 collected · 7 counted. */
const BEATS = [0, 700, 1600, 2500, 3300, 3900, 5800, 6500] as const;
const LOOP = 7600;
const REST = 5;

const W = 357;
const CX = W / 2;
const CY = 226;
const TRAY_TOP = 452;

/* Eight places on two orbits, as angle (degrees, 0 = right, clockwise) and radius. */
const SLOTS = [
  { a: -150, r: 150 },
  { a: -105, r: 122 },
  { a: -60, r: 150 },
  { a: -15, r: 122 },
  { a: 30, r: 150 },
  { a: 75, r: 122 },
  { a: 120, r: 150 },
  { a: 165, r: 122 },
];
/* Which slot researches in each loop — spread round the field. */
const ORDER = [3, 6, 1, 4, 7, 2, 5, 0];

const pos = (a: number, r: number) => ({ x: CX + r * Math.cos((a * Math.PI) / 180), y: CY + r * Math.sin((a * Math.PI) / 180) });

/** A curved thread from a company to the centre, bowed by `bend`. */
function thread(from: { x: number; y: number }, bend: number) {
  const mx = (from.x + CX) / 2;
  const my = (from.y + CY) / 2;
  const dx = CX - from.x;
  const dy = CY - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const qx = mx + nx * bend;
  const qy = my + ny * bend;
  return {
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${CX} ${CY}`,
    /* The curve's own midpoint, for the label. */
    mid: { x: 0.25 * from.x + 0.5 * qx + 0.25 * CX, y: 0.25 * from.y + 0.5 * qy + 0.25 * CY },
  };
}

const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

/**
 * Every colour the scene draws, in one place, so the same composition and
 * timing can be art-directed for a different ground. DARK is the approved
 * treatment exactly as it shipped; LIGHT re-grounds it on the panel's own
 * #f5f6f6 and re-weights each colour for that ground rather than swapping
 * the background under it — see OrbitLight.
 */
export type OrbitTheme = {
  stage: string;
  ring: string;
  header: string;
  liveDark: boolean;
  thread: string;
  threadOpacity: number;
  labelBg: string;
  labelText: string;
  coreBg: string;
  coreShadow: string;
  corePulse: string;
  glyph: string;
  coreLabel: string;
  discBg: string;
  discShadow: string;
  discOpacity: number;
  discOpacityStray: number;
  stray: string;
  gaugeTrack: string;
  gauge: string;
  cardShadow: string;
  trayBg: string;
  trayShadow: string;
  trayLabel: string;
  trayCount: string;
  trayRing: string;
  /* Optional roles a ground may need; the dark treatment leaves them unset. */
  /** How grey the unidentified companies are, 0–1 (dark: 1). */
  discGray?: number;
  /** The ring round a company once it is identified (dark: the gauge colour). */
  gaugeDone?: string;
  /** The live dot beside the heading (dark: the brand lime). */
  live?: string;
  /** The heading's weight (dark: regular). */
  headerWeight?: number;
  /**
   * How an unidentified company's logo sits on its disc. `luminosity` keeps
   * the logo's shape and tone but takes the disc's hue, so every unknown
   * company wears the activity colour until it is identified (dark: normal).
   */
  discBlend?: "normal" | "luminosity";
  /* Per-state company styling, so logos can take the system's colours in
     every state instead of bringing their own (dark: unset — logos as they are). */
  /** The company doing the research, before it is identified. */
  activeBg?: string;
  activeShadow?: string;
  /** The company once identified: its disc, how its logo sits on it, its rim. */
  doneBg?: string;
  doneBlend?: "normal" | "luminosity" | "multiply";
  doneGray?: number;
  /** A full filter for the identified logo, when a grey level is not enough. */
  doneFilter?: string;
  doneShadow?: string;
  /** Logos in the tray of identified prospects. */
  trayLogoBg?: string;
  trayLogoBlend?: "normal" | "luminosity" | "multiply";
  trayLogoGray?: number;
  trayLogoFilter?: string;
  /** A small mark before "Prospects identified". */
  trayMark?: string;
  /** Threads run from `thread` at the company to this colour at your profile. */
  threadTo?: string;
  /** The signal label's dot and edge. */
  labelDot?: string;
  labelShadow?: string;
};

export const DARK: OrbitTheme = {
  stage: LIVE,
  ring: "rgba(255,255,255,0.07)",
  header: "rgba(255,255,255,0.72)",
  liveDark: true,
  thread: LIME,
  threadOpacity: 0.85,
  labelBg: "rgba(177,250,99,0.16)",
  labelText: LIME,
  coreBg: "#0e3b3b",
  coreShadow: `0 0 0 2px ${LIME}`,
  corePulse: LIME,
  glyph: LIME,
  coreLabel: "rgba(255,255,255,0.85)",
  discBg: "rgba(255,255,255,0.1)",
  discShadow: "none",
  discOpacity: 0.35,
  discOpacityStray: 0.55,
  stray: "rgba(255,255,255,0.5)",
  gaugeTrack: "rgba(255,255,255,0.12)",
  gauge: LIME,
  cardShadow: "0px 8px 20px 0px rgba(0,0,0,0.25)",
  trayBg: "rgba(255,255,255,0.07)",
  trayShadow: "none",
  trayLabel: "rgba(255,255,255,0.6)",
  trayCount: "#ffffff",
  trayRing: LIVE,
};

export default function AnimOrbit() {
  return <OrbitScene theme={DARK} />;
}

export function OrbitScene({ theme: T }: { theme: OrbitTheme }) {
  const companies = useCompanies(80);
  const { beat, cycle } = useBeats(BEATS, LOOP, REST);
  if (companies.length < SLOTS.length) return null;

  const targetSlot = ORDER[cycle % ORDER.length];
  const strayIndex = ORDER[(cycle + 3) % ORDER.length];
  const strayOn = beat === 2 || beat === 3;
  /* Each slot shows whoever last moved into it, so a slot that has just given
     up its company to the tray comes back with someone new. */
  const occupantAt = (slot: number, at: number) => {
    /* How many turns this slot finished before loop `at`. */
    const first = ORDER.indexOf(slot);
    const done = at > first ? Math.floor((at - first - 1) / ORDER.length) + 1 : 0;
    return { company: pick(companies, slot + ORDER.length * done), key: `${slot}-${done}` };
  };
  const occupant = (slot: number) => occupantAt(slot, cycle);

  const target = occupant(targetSlot);
  const t = SLOTS[targetSlot];
  const home = pos(t.a, t.r);
  const near = pos(t.a, 92);
  const threads = [-48, 0, 48].map(b => thread(home, b));
  const labels = ["Category", "Profile", "Pricing"];
  const drawn = beat >= 3 ? 3 : beat >= 2 ? 2 : beat >= 1 ? 1 : 0;
  const pulled = beat >= 4;
  const named = beat === 5;
  const collected = beat >= 6;
  const counted = beat >= 7;

  /* The tray: what earlier loops collected, and this one once it lands. */
  const trayList: Company[] = [...(counted ? [target.company] : []), ...[1, 2, 3].map(k => occupantAt(pick(ORDER, cycle - k), cycle - k).company)];
  const trayCount = 11 + (cycle % 20) + (counted ? 1 : 0);
  /* Where the newest logo sits: the row is right-aligned inside the tray's
     16px inset and 14px padding, four 26px logos overlapping by 8. */
  const traySlot = { x: W - 16 - 14 - (26 + 3 * 18) + 13, y: TRAY_TOP + 29 };

  const targetPos = collected ? traySlot : pulled ? near : home;
  const targetSize = collected ? 26 : pulled ? 48 : 30;
  /* The name card sits on the far side of the company from your profile —
     above it in the top half of the field, below it in the bottom — and is
     held inside the stage. */
  const CARD_W = 172;
  const cardLeft = Math.min(Math.max(near.x - CARD_W / 2, 14), W - 14 - CARD_W);
  const cardAbove = near.y < CY;

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: T.stage }} aria-hidden data-name="Animation / Orbit">
      {/* The field. */}
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden>
        {[72, 122, 152].map(r => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={T.ring} strokeWidth="1" strokeDasharray={r === 72 ? "none" : "2 5"} />
        ))}
        {T.threadTo && (
          <defs>
            <linearGradient id={`orbit-flow-${cycle}`} gradientUnits="userSpaceOnUse" x1={home.x} y1={home.y} x2={CX} y2={CY}>
              <stop offset="0" stopColor={T.thread} />
              <stop offset="1" stopColor={T.threadTo} />
            </linearGradient>
          </defs>
        )}
        {threads.map((th, i) => {
          const on = drawn > i && !pulled;
          return (
            <path
              key={i}
              d={th.d}
              fill="none"
              stroke={T.threadTo ? `url(#orbit-flow-${cycle})` : T.thread}
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              style={{
                strokeDashoffset: drawn > i ? 0 : 1,
                opacity: on ? T.threadOpacity : 0,
                transition: `stroke-dashoffset ${drawn > i ? 620 : 0}ms ${EASE}, opacity 360ms ${EASE}`,
              }}
            />
          );
        })}
        {(() => {
          const s = SLOTS[strayIndex];
          const th = thread(pos(s.a, s.r), -20);
          return (
            <path
              d={th.d}
              fill="none"
              stroke={T.stray}
              strokeWidth="1"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.35 1"
              style={{
                strokeDashoffset: strayOn ? 0 : 0.35,
                opacity: strayOn ? 0.6 : 0,
                transition: `stroke-dashoffset 700ms ${EASE}, opacity 400ms ${EASE}`,
              }}
            />
          );
        })()}
      </svg>

      {threads.map((th, i) => (
        <span
          key={labels[i]}
          className={`${FONT} absolute flex h-[20px] -translate-x-1/2 -translate-y-1/2 items-center rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
          style={{
            left: th.mid.x,
            top: th.mid.y,
            background: T.labelBg,
            color: T.labelText,
            boxShadow: T.labelShadow,
            gap: T.labelDot ? 5 : undefined,
            /* One label at a time — the newest thread names itself; the lines stay. */
            opacity: drawn - 1 === i && !pulled ? 1 : 0,
            transition: tr(["opacity"], 300, drawn - 1 === i ? 300 : 0),
          }}
        >
          {T.labelDot && <span className="block size-[5px] shrink-0 rounded-[100px]" style={{ background: T.labelDot }} />}
          {labels[i]}
        </span>
      ))}

      {/* What the field is. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]">
        {T.live ? (
          <span className="relative block size-[6px] shrink-0">
            <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: T.live }} />
            <span className="absolute inset-0 rounded-[100px]" style={{ background: T.live }} />
          </span>
        ) : (
          <LiveDot dark={T.liveDark} />
        )}
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: T.header, fontWeight: T.headerWeight ?? 400 }}>
          {`${SLOTS.length} companies researching you`}
        </span>
      </span>

      {/* Your profile. */}
      <span
        className="absolute flex size-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[100px]"
        style={{ left: CX, top: CY, background: T.coreBg, boxShadow: T.coreShadow }}
      >
        <span key={drawn} className={drawn ? "bi-ring absolute inset-0 rounded-[100px]" : "hidden"} style={{ boxShadow: `0 0 0 2px ${T.corePulse}` }} />
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="1" y="1" width="5" height="5" rx="1.2" fill={T.glyph} />
          <rect x="8" y="1" width="5" height="5" rx="1.2" fill={T.glyph} opacity="0.55" />
          <rect x="1" y="8" width="5" height="5" rx="1.2" fill={T.glyph} opacity="0.55" />
          <rect x="8" y="8" width="5" height="5" rx="1.2" fill={T.glyph} />
        </svg>
      </span>
      <span
        className={`${FONT} absolute -translate-x-1/2 font-medium leading-[16px] text-[12px] whitespace-nowrap`}
        style={{ left: CX, top: CY + 42, color: T.coreLabel }}
      >
        Your profile
      </span>

      {/* The companies out in the field. */}
      {SLOTS.map((s, i) => {
        if (i === targetSlot) return null;
        const p = pos(s.a, s.r);
        const o = occupant(i);
        return (
          <span
            key={o.key}
            className="bi-float absolute block size-[30px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[100px] isolate"
            style={{ left: p.x, top: p.y, background: T.discBg, boxShadow: T.discShadow, animationDelay: `${-i * 0.7}s` }}
          >
            <img
              alt=""
              src={o.company.logo}
              className="block size-full object-cover"
              style={{ mixBlendMode: T.discBlend ?? "normal", filter: `blur(3px) grayscale(${T.discGray ?? 1})`, opacity: i === strayIndex && strayOn ? T.discOpacityStray : T.discOpacity, transition: tr(["opacity"], 400) }}
            />
          </span>
        );
      })}

      {/* The one researching you. */}
      <span
        key={target.key}
        className="absolute block -translate-x-1/2 -translate-y-1/2"
        style={{
          left: targetPos.x,
          top: targetPos.y,
          width: targetSize,
          height: targetSize,
          zIndex: 3,
          transition: collected
            ? tr(["left", "top", "width", "height"], 700, 0, EASE)
            : tr(["left", "top", "width", "height"], 820, 0, EASE_OUT),
        }}
      >
        <svg
          className="absolute"
          style={{ left: -6, top: -6, width: "calc(100% + 12px)", height: "calc(100% + 12px)" }}
          viewBox="0 0 40 40"
          overflow="visible"
          aria-hidden
        >
          <circle cx="20" cy="20" r="19" fill="none" stroke={T.gaugeTrack} strokeWidth="1.5" style={{ opacity: pulled ? 0 : 1, transition: tr(["opacity"], 300) }} />
          <circle
            cx="20"
            cy="20"
            r="19"
            fill="none"
            stroke={pulled ? (T.gaugeDone ?? T.gauge) : T.gauge}
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            transform="rotate(-90 20 20)"
            style={{
              strokeDashoffset: 1 - drawn / 3,
              opacity: collected ? 0 : 1,
              transition: `stroke-dashoffset 520ms ${EASE} 300ms, opacity 300ms ${EASE}`,
            }}
          />
        </svg>
        <span
          className="absolute inset-0 isolate overflow-hidden rounded-[100px]"
          style={{
            background: pulled ? (T.doneBg ?? T.discBg) : drawn > 0 ? (T.activeBg ?? T.discBg) : T.discBg,
            boxShadow: pulled ? (T.doneShadow ?? T.discShadow) : drawn > 0 ? (T.activeShadow ?? T.discShadow) : T.discShadow,
            transition: tr(["background", "box-shadow"], 500),
          }}
        >
          <img
            alt=""
            src={target.company.logo}
            className="block size-full object-cover"
            style={{
              filter: pulled ? (T.doneFilter ?? `grayscale(${T.doneGray ?? 0})`) : `blur(3px) grayscale(${T.discGray ?? 1})`,
              mixBlendMode: pulled ? (T.doneBlend ?? "normal") : (T.discBlend ?? "normal"),
              opacity: pulled ? 1 : 0.4 + drawn * 0.1,
              transition: tr(["filter", "opacity"], 700),
            }}
          />
        </span>
      </span>

      {/* Its name, once it is close enough to read. */}
      <span
        className="absolute flex flex-col gap-[4px] rounded-[10px] bg-white px-[10px] py-[8px]"
        style={{
          left: cardLeft,
          width: CARD_W,
          ...(cardAbove ? { top: near.y - 40 - 52 } : { top: near.y + 40 }),
          zIndex: 4,
          boxShadow: T.cardShadow,
          opacity: named ? 1 : 0,
          transform: named ? "none" : `translateY(${cardAbove ? 6 : -6}px)`,
          transition: tr(["opacity"], 300) + ", " + tr(["transform"], 480, 0, EASE_OUT),
        }}
      >
        <span className={`${FONT} truncate font-medium leading-[16px] text-[12px]`} style={{ color: INK }}>
          {target.company.name}
        </span>
        <span className="flex">
          <IntentChip score={target.company.score} size="sm" />
        </span>
      </span>

      {/* The tray. */}
      <div
        className="absolute left-[16px] right-[16px] flex h-[58px] items-center justify-between rounded-[12px] px-[14px]"
        style={{ top: TRAY_TOP, background: T.trayBg, boxShadow: T.trayShadow }}
      >
        <span className="flex flex-col">
          <span className={`${FONT} flex items-center gap-[6px] leading-[14px] text-[11px]`} style={{ color: T.trayLabel }}>
            {T.trayMark && <span className="block size-[6px] rounded-[100px]" style={{ background: T.trayMark }} />}
            Prospects identified
          </span>
          <span key={trayCount} className={`${FONT} bi-count font-semibold leading-[24px] text-[20px] tabular-nums`} style={{ color: T.trayCount }}>
            {trayCount}
          </span>
        </span>
        <span className="flex items-center">
          {trayList.slice(0, 4).map((c, i) => (
            <span
              key={`${c.id}-${i === 0 && counted ? "new" : "old"}`}
              className={`isolate block size-[26px] shrink-0 overflow-hidden rounded-[100px] ${i === 0 && counted ? "bi-pop" : ""}`}
              style={{ marginLeft: i ? -8 : 0, boxShadow: `0 0 0 2px ${T.trayRing}`, zIndex: 4 - i, background: T.trayLogoBg }}
            >
              <img
                alt=""
                src={c.logo}
                className="block size-full object-cover"
                style={{ mixBlendMode: T.trayLogoBlend ?? "normal", filter: T.trayLogoFilter ?? (T.trayLogoGray ? `grayscale(${T.trayLogoGray})` : undefined) }}
              />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
