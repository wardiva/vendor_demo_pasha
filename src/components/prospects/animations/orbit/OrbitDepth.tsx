import { ContactStack, FONT, INK, IntentChip, LiveDot, MUTED, useCompanies } from "../shared";
import {
  CX,
  CompanyDisc,
  LIME,
  LIVE,
  ProfileGlyph,
  SIGNAL_TONE,
  W,
  WHITE_LO,
  WHITE_MID,
  clamp01,
  easeInOut,
  easeOut,
  lerp,
  pick,
  seg,
  thread,
  useLoopClock,
} from "./kit";

/**
 * Orbit Variation 4 — Depth.
 *
 * The orbit given a third dimension. The rings are tilted into perspective
 * and turn slowly, so the companies on them travel round your profile — small
 * and soft at the back, larger and nearer at the front, passing behind it and
 * in front of it. Nothing about them is legible: at every depth they are out
 * of focus.
 *
 * One of them, as it comes round, starts to research you, and its signals
 * run in to your profile. Then the camera racks focus. The field — the rings,
 * the other companies, your profile — falls soft and dims, and the company
 * that earned it is pulled out of the orbit to the front of the frame, sharp,
 * into a prospect card that assembles around it: name, intent, the signals
 * that did it, the contacts a reveal would name. It is filed into the list at
 * the foot, focus racks back, and the orbit carries on.
 *
 * Depth is the approved idea made literal — closer is known — and the rack
 * focus is the product's moment: of everything in the field, this is the one
 * to look at.
 */

const LOOP = 8000;
const REST = 5600;
const CY = 214;
const RINGS = [
  { rx: 164, ry: 70, speed: 0.008 },
  { rx: 112, ry: 46, speed: 0.011 },
];
const NODES = 9;
const PULSES = [
  { at: 700, label: "Category" as const, bend: -26 },
  { at: 1600, label: "Profile" as const, bend: 0 },
  { at: 2500, label: "Pricing" as const, bend: 26 },
];
const TRAVEL = 620;
const DETECT = [3500, 4700] as const;
const CARD = { left: 24, top: 300, width: W - 48 };
const LOGO = { x: CARD.left + 16 + 22, y: CARD.top + 16 + 22, size: 44 };
const LIST_TOP = 448;

function angleOf(i: number, now: number) {
  return i * (360 / NODES) + now * RINGS[i % 2].speed;
}

function project(i: number, now: number) {
  const ring = RINGS[i % 2];
  const theta = (angleOf(i, now) * Math.PI) / 180;
  const s = Math.sin(theta);
  return { x: CX + ring.rx * Math.cos(theta), y: CY + ring.ry * s, d: (s + 1) / 2 };
}

export default function OrbitDepth() {
  const prospects = useCompanies(85);
  const everyone = useCompanies(0);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < 3 || everyone.length < NODES) return null;

  /* The company that researches this loop is whichever is passing the front
     quarter of the orbit, off to one side, while it does — near enough to be
     the largest thing in the field, far enough from your profile that its
     threads have room to run. */
  const loopStart = now - t;
  let k = 0;
  let best = Infinity;
  for (let i = 0; i < NODES; i++) {
    const a = (((angleOf(i, loopStart + 1800) % 360) + 360) % 360);
    const miss = Math.min(Math.abs(a - 38), Math.abs(a - 142));
    if (miss < best) {
      best = miss;
      k = i;
    }
  }
  const target = pick(prospects, cycle + 2);
  const onOrbit = project(k, now);
  const pull = easeInOut(seg(t, DETECT[0], DETECT[1]));
  const pos = { x: lerp(onOrbit.x, LOGO.x, pull), y: lerp(onOrbit.y, LOGO.y, pull) };
  const orbitSize = 18 + 18 * onOrbit.d;
  const size = lerp(orbitSize, LOGO.size, pull);
  const landed = PULSES.filter(p => t >= p.at + TRAVEL).length;
  const focus = Math.max(landed * 0.12, pull);

  /* Rack focus: in as the company is pulled forward, out once it is filed. */
  const rack = easeOut(seg(t, DETECT[0], DETECT[0] + 700)) * (1 - easeInOut(seg(t, 6700, 7400)));
  const card = easeOut(seg(t, 4300, 4900)) * (1 - seg(t, 6600, 7000));
  const filed = t >= 6800;
  const gone = seg(t, 6600, 6950);

  const core = { x: CX, y: CY };
  const list = [...(filed ? [target] : []), pick(prospects, cycle + 1), pick(prospects, cycle)].slice(0, 2);

  const ellipse = (rx: number, ry: number, half: "back" | "front") =>
    half === "back"
      ? `M ${CX - rx} ${CY} A ${rx} ${ry} 0 0 1 ${CX + rx} ${CY}`
      : `M ${CX - rx} ${CY} A ${rx} ${ry} 0 0 0 ${CX + rx} ${CY}`;

  return (
    <div className="absolute inset-[16px] overflow-hidden rounded-[12px]" style={{ background: LIVE }} aria-hidden data-name="Animation / Orbit depth">
      {/* Depth: a floor of light under the orbit, darker toward the edges. */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 200px 110px at ${CX}px ${CY + 20}px, rgba(177,250,99,0.08), rgba(177,250,99,0) 100%)` }}
      />

      {/* The field — everything the camera racks away from. */}
      <div
        className="absolute inset-0"
        style={{ filter: `blur(${(rack * 2.6).toFixed(2)}px)`, opacity: 1 - rack * 0.45 }}
      >
        <svg className="absolute inset-0" width={W} height="100%" aria-hidden style={{ zIndex: 1 }}>
          {RINGS.map(r => (
            <path key={r.rx} d={ellipse(r.rx, r.ry, "back")} fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="2 5" />
          ))}
        </svg>
        {/* The profile's shadow on the floor, and the profile. */}
        <span
          className="absolute block rounded-[100%]"
          style={{ left: CX - 34, top: CY + 30, width: 68, height: 12, background: "rgba(0,0,0,0.35)", filter: "blur(4px)", zIndex: 6 }}
        />
        <span
          className="absolute flex size-[56px] items-center justify-center rounded-[100px]"
          style={{ left: CX - 28, top: CY - 34, background: "#0e3b3b", boxShadow: `0 0 0 2px ${LIME}, 0 0 0 9px rgba(177,250,99,0.06)`, zIndex: 7 }}
        >
          {PULSES.map(p =>
            t >= p.at + TRAVEL && t < p.at + TRAVEL + 900 ? (
              <span key={p.label} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 2px ${LIME}`, animationDelay: "0ms" }} />
            ) : null,
          )}
          <ProfileGlyph size={19} />
        </span>
        <svg className="absolute inset-0" width={W} height="100%" aria-hidden style={{ zIndex: 8, pointerEvents: "none" }}>
          {RINGS.map(r => (
            <path key={r.rx} d={ellipse(r.rx, r.ry, "front")} fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="2 5" />
          ))}
        </svg>
        {Array.from({ length: NODES }).map((_, i) => {
          if (i === k) return null;
          const p = project(i, now);
          return (
            <span key={i} className="absolute" style={{ left: p.x, top: p.y, zIndex: 2 + Math.round(p.d * 10), filter: `blur(${((1 - p.d) * 1.4).toFixed(2)}px)`, opacity: 0.45 + 0.55 * p.d }}>
              <CompanyDisc company={pick(everyone, i * 2 + 1)} size={18 + 18 * p.d} focus={0} style={{ left: 0, top: 0 }} />
            </span>
          );
        })}
      </div>

      {/* The signals, following the company as it travels. */}
      <svg className="absolute inset-0" width={W} height="100%" aria-hidden style={{ zIndex: 12 }}>
        {PULSES.map(p => {
          const th = thread(onOrbit, core, p.bend);
          const go = seg(t, p.at, p.at + TRAVEL);
          const trace = t >= p.at ? 0.3 * (1 - seg(t, DETECT[0], DETECT[0] + 300)) : 0;
          const dot = th.at(easeInOut(go));
          const live = t >= p.at && t < p.at + TRAVEL;
          return (
            <g key={p.label} opacity={1 - rack}>
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
        {pull < 1 && (
          <circle
            cx={onOrbit.x}
            cy={onOrbit.y}
            r={orbitSize / 2 + 6}
            fill="none"
            stroke={LIME}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${((2 * Math.PI * (orbitSize / 2 + 6) * landed) / 3).toFixed(1)} 400`}
            transform={`rotate(-90 ${onOrbit.x} ${onOrbit.y})`}
            opacity={(1 - pull) * clamp01(landed)}
          />
        )}
      </svg>

      {/* Its signal, named as it leaves. */}
      {PULSES.map(p => {
        const on = seg(t, p.at, p.at + 160) * (1 - seg(t, p.at + 820, p.at + 1000));
        if (on <= 0) return null;
        return (
          <span
            key={p.label}
            className={`${FONT} absolute flex h-[20px] -translate-x-1/2 items-center gap-[5px] whitespace-nowrap rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
            style={{
              left: Math.min(Math.max(onOrbit.x, 44), W - 44),
              top: onOrbit.y + orbitSize / 2 + 10,
              background: "rgba(4,28,28,0.92)",
              color: SIGNAL_TONE[p.label],
              boxShadow: "0 0 0 1px rgba(177,250,99,0.25)",
              opacity: on,
              zIndex: 14,
            }}
          >
            <span className="block size-[5px] rounded-[100px]" style={{ background: SIGNAL_TONE[p.label] }} />
            {p.label}
          </span>
        );
      })}

      {/* The prospect card, assembling round the company pulled forward. */}
      <div
        className="absolute rounded-[16px] bg-white"
        style={{
          left: CARD.left,
          top: CARD.top,
          width: CARD.width,
          padding: 16,
          zIndex: 15,
          boxShadow: "0px 18px 40px 0px rgba(0,0,0,0.38)",
          opacity: card,
          transform: `translateY(${((1 - card) * 10 + gone * 14).toFixed(2)}px) scale(${(0.97 + 0.03 * card).toFixed(3)})`,
        }}
      >
        <div className="flex items-center gap-[12px]" style={{ paddingLeft: LOGO.size + 12 }}>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
              {target.name}
            </span>
            <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTED }}>
              {target.industry}
            </span>
          </span>
          <IntentChip score={target.score} />
        </div>
        <div className="my-[12px] h-px" style={{ background: "rgba(47,43,61,0.08)" }} />
        <div className="flex items-center gap-[5px]">
          {(["Category", "Profile", "Pricing"] as const).map((s, i) => (
            <span
              key={s}
              className={`${FONT} flex h-[20px] items-center gap-[4px] rounded-[6px] px-[6px] leading-[14px] text-[10.5px]`}
              style={{ background: "rgba(7,41,41,0.06)", color: INK, opacity: seg(t, 4700 + i * 120, 4950 + i * 120) }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 5.2L4.1 7.2L8 3.2" stroke={LIVE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {s}
            </span>
          ))}
          <span className="ml-auto" style={{ opacity: seg(t, 5100, 5400) }}>
            <ContactStack avatars={target.avatars} size={20} />
          </span>
        </div>
      </div>

      {/* The company itself — sharp, in front of everything once pulled. */}
      <span className="absolute" style={{ left: pos.x, top: pos.y, zIndex: pull > 0 ? 16 : 2 + Math.round(onOrbit.d * 10), opacity: 1 - gone }}>
        <CompanyDisc
          company={target}
          size={size}
          focus={focus}
          style={{
            left: 0,
            top: 0,
            borderRadius: lerp(100, 11, pull),
            boxShadow: pull > 0.05 ? `0px ${(8 * pull).toFixed(1)}px ${(18 * pull).toFixed(1)}px 0px rgba(0,0,0,${(0.3 * pull).toFixed(2)})` : "none",
          }}
        />
      </span>

      {/* Heading. */}
      <span className="absolute left-[18px] top-[18px] flex items-center gap-[8px]" style={{ zIndex: 20 }}>
        <LiveDot dark />
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: WHITE_MID }}>
          Researching your profile
        </span>
      </span>

      {/* Identified. */}
      <div className="absolute left-[16px] right-[16px] rounded-[12px] px-[12px] pb-[4px] pt-[10px]" style={{ top: LIST_TOP, background: "rgba(255,255,255,0.06)", zIndex: 2 }}>
        <div className="mb-[2px] flex items-center justify-between">
          <span className={`${FONT} font-medium leading-[16px] text-[11.5px] text-white`}>Identified prospects</span>
          <span className={`${FONT} leading-[14px] text-[10.5px] tabular-nums`} style={{ color: WHITE_LO }}>
            {`${14 + (cycle % 30) + (filed ? 1 : 0)} this week`}
          </span>
        </div>
        {list.map((c, i) => (
          <div
            key={`${c.id}-${i === 0 && filed ? "new" : i}`}
            className={`flex h-[34px] items-center gap-[10px] ${i === 0 && filed ? "bi-feed-in" : ""}`}
            style={{ borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <img alt="" src={c.logo} className="block size-[22px] shrink-0 rounded-[6px] object-cover" />
            <span className={`${FONT} min-w-0 flex-1 truncate leading-[16px] text-[12px]`} style={{ color: "rgba(255,255,255,0.9)" }}>
              {c.name}
            </span>
            <IntentChip score={c.score} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
