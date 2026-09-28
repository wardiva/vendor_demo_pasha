import type { CSSProperties } from "react";
import { FONT, IntentChip, useCompanies, type Company } from "../shared";
import { easeInOut, easeOut, easeOutBack, lerp, pick, polar, seg, useLoopClock } from "./kit";

/**
 * Variation 1 — Original Background, minimal: the quiet field.
 *
 * The orbit concept with everything but its meaning taken away. No rings, no
 * glows, no gradients: a single ink disc for your category, a scatter of
 * hollow circles for the companies around it, and one colour — the brand
 * lime — held back for the moment a company becomes a prospect.
 *
 * One company at a time researches you. Each signal is a single ink point
 * travelling in to your category, named in small type as it leaves, and each
 * one fills a third of the company's circle, like a pie chart filling. When
 * the circle is full it turns lime, its initial appears, and its name and
 * intent are set beside it. Then it is filed at the foot of the panel, into a
 * quiet line of identified prospects, and a new circle takes its place.
 *
 * Ink is structure; lime is outcome; everything else is the ground.
 */

export const INK = "#072929";
export const INK_SOFT = "rgba(7,41,41,0.28)";
export const INK_FAINT = "rgba(7,41,41,0.12)";
export const MUTE = "rgba(47,43,61,0.6)";
export const LIME = "#B1FA63";

const PW = 389;
const CX = PW / 2;
const CY = 232;
const LOOP = 7800;
const REST = 4600;

/* Seven companies, loosely placed — balanced, not on a ring. */
const SPOTS = [
  { a: -150, r: 136 },
  { a: -102, r: 118 },
  { a: -48, r: 142 },
  { a: 6, r: 124 },
  { a: 58, r: 140 },
  { a: 124, r: 122 },
  { a: 176, r: 138 },
];
const ORDER = [3, 5, 1, 6, 2, 4, 0];
const SIGNALS = [
  { at: 600, label: "Viewed category" },
  { at: 1500, label: "Viewed profile" },
  { at: 2400, label: "Viewed pricing" },
];
const TRAVEL = 680;
const IDENTIFY = 3300;
const FILE = [5300, 6200] as const;
const TRAY_Y = 528;

export function initial(c: Company) {
  return c.name.replace(/^The /, "").trim().charAt(0).toUpperCase();
}

export function Monogram({ company, size, style }: { company: Company; size: number; style?: CSSProperties }) {
  return (
    <span
      className={`${FONT} absolute flex items-center justify-center rounded-[100px] font-semibold`}
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: LIME,
        color: INK,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
        ...style,
      }}
    >
      {initial(company)}
    </span>
  );
}

export default function MinimalField() {
  const prospects = useCompanies(80);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < 6) return null;

  const slot = ORDER[cycle % ORDER.length];
  const target = pick(prospects, cycle + 2);
  const home = polar(CX, CY, SPOTS[slot].a, SPOTS[slot].r);
  const landed = SIGNALS.filter(s => t >= s.at + TRAVEL).length;
  const fill = SIGNALS.reduce((p, s, i) => Math.max(p, (i + easeOut(seg(t, s.at + TRAVEL - 80, s.at + TRAVEL + 320))) / 3), 0);
  const known = easeOutBack(seg(t, IDENTIFY, IDENTIFY + 520));
  const file = easeInOut(seg(t, FILE[0], FILE[1]));
  const filed = t >= FILE[1];

  /* The tray: a quiet line of the prospects identified so far. */
  const tray = [...(filed ? [target] : []), ...[1, 2, 3].map(k => pick(prospects, cycle + 2 - k))].slice(0, 4);
  const count = 11 + (cycle % 30) + (filed ? 1 : 0);
  const traySlot = { x: 40 + 12, y: TRAY_Y };

  const size = lerp(22, 34, known) * (1 - 0.3 * file);
  const pos = { x: lerp(home.x, traySlot.x, file), y: lerp(home.y, traySlot.y, file) };
  const outward = home.x >= CX ? 1 : -1;
  const label = seg(t, IDENTIFY + 250, IDENTIFY + 650) * (1 - seg(t, FILE[0] - 300, FILE[0]));

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Minimal field">
      {/* What this is. */}
      <span className="absolute left-[32px] top-[30px] flex items-center gap-[8px]">
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: MUTE }}>
          {`${SPOTS.length} companies researching your category`}
        </span>
      </span>

      {/* The signals: one ink point at a time, a hairline behind it that fades. */}
      <svg className="absolute inset-0" width={PW} height="100%" aria-hidden>
        {SIGNALS.map(s => {
          const go = seg(t, s.at, s.at + TRAVEL);
          if (t < s.at || t > s.at + TRAVEL + 700) return null;
          const dx = CX - home.x;
          const dy = CY - home.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const from = { x: home.x + ux * 14, y: home.y + uy * 14 };
          const to = { x: CX - ux * 32, y: CY - uy * 32 };
          const p = easeInOut(go);
          const at = { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) };
          const fade = 1 - seg(t, s.at + TRAVEL, s.at + TRAVEL + 700);
          return (
            <g key={s.label}>
              <line x1={from.x} y1={from.y} x2={at.x} y2={at.y} stroke={INK} strokeWidth="1" opacity={0.22 * fade} />
              {go < 1 && <circle cx={at.x} cy={at.y} r="3" fill={INK} />}
            </g>
          );
        })}
      </svg>

      {/* The companies. */}
      {SPOTS.map((s, i) => {
        if (i === slot) return null;
        const p = polar(CX, CY, s.a, s.r);
        const drift = Math.sin(now / 1900 + i * 1.7) * 2;
        return (
          <span
            key={`${i}-${i === ORDER[(cycle - 1 + ORDER.length) % ORDER.length] ? cycle : "base"}`}
            className="bi-pop absolute block size-[22px] rounded-[100px]"
            style={{ left: p.x - 11, top: p.y - 11 + drift, boxShadow: `inset 0 0 0 1.5px ${INK_SOFT}` }}
          />
        );
      })}

      {/* The one researching you: a circle filling with its signals. */}
      <span className="absolute" style={{ left: pos.x, top: pos.y, zIndex: 3 }}>
        <span
          className="absolute block rounded-[100px]"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            background: `conic-gradient(${INK} 0turn ${fill.toFixed(3)}turn, transparent ${fill.toFixed(3)}turn 1turn)`,
            boxShadow: `inset 0 0 0 1.5px ${INK}`,
            opacity: 1 - known,
          }}
        />
        {known > 0 && <Monogram company={target} size={size} style={{ left: 0, top: 0, opacity: Math.min(known * 1.4, 1) }} />}
      </span>

      {/* The signal naming itself as it leaves. */}
      {SIGNALS.map(s => {
        const on = seg(t, s.at, s.at + 200) * (1 - seg(t, s.at + 800, s.at + 1000));
        if (on <= 0) return null;
        return (
          <span
            key={s.label}
            className={`${FONT} absolute whitespace-nowrap leading-[14px] text-[11px]`}
            style={{
              top: home.y - 7,
              ...(outward > 0 ? { left: home.x + 20 } : { right: PW - home.x + 20 }),
              color: MUTE,
              opacity: on,
              transform: `translateX(${((1 - on) * 4 * outward).toFixed(1)}px)`,
            }}
          >
            {s.label}
          </span>
        );
      })}

      {/* Its name and intent, set beside it once known. */}
      {label > 0 && (
        <span
          className="absolute flex flex-col gap-[4px]"
          style={{
            top: home.y - 20,
            ...(outward > 0 ? { left: Math.min(home.x + 26, PW - 150) } : { right: Math.min(PW - home.x + 26, PW - 150) }),
            alignItems: outward > 0 ? "flex-start" : "flex-end",
            opacity: label,
            transform: `translateX(${((1 - label) * 6 * outward).toFixed(1)}px)`,
          }}
        >
          <span className={`${FONT} whitespace-nowrap font-medium leading-[16px] text-[12.5px]`} style={{ color: INK }}>
            {target.name}
          </span>
          <IntentChip score={target.score} size="sm" />
        </span>
      )}

      {/* Your category — the anchor. */}
      <span className="absolute flex size-[60px] items-center justify-center rounded-[100px]" style={{ left: CX - 30, top: CY - 30, background: INK }}>
        {SIGNALS.map(s =>
          t >= s.at + TRAVEL && t < s.at + TRAVEL + 900 ? (
            <span key={s.label} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 1px ${INK}`, animationDelay: "0ms" }} />
          ) : null,
        )}
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="1" y="1" width="5" height="5" rx="1.2" fill={LIME} />
          <rect x="8" y="1" width="5" height="5" rx="1.2" fill="#f5f6f6" opacity="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="1.2" fill="#f5f6f6" opacity="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="1.2" fill={LIME} />
        </svg>
      </span>
      <span className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: CX, top: CY + 42 }}>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTE }}>
          Your category
        </span>
        <span className={`${FONT} whitespace-nowrap font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
          Project Management
        </span>
      </span>

      {/* Identified — a hairline, a line of initials, a count. */}
      <span className="absolute left-[32px] right-[32px] h-px" style={{ top: TRAY_Y - 34, background: INK_FAINT }} />
      <span className="absolute" style={{ left: 0, top: 0 }}>
        {tray.map((c, i) => (
          <Monogram
            key={`${c.id}-${i === 0 && filed ? "new" : i}`}
            company={c}
            size={24}
            style={{ left: traySlot.x + (i + (filed ? 0 : file)) * 18, top: TRAY_Y, boxShadow: "0 0 0 2px #f5f6f6", zIndex: 10 - i }}
          />
        ))}
      </span>
      <span className="absolute right-[32px] flex items-baseline gap-[6px]" style={{ top: TRAY_Y - 12 }}>
        <span key={count} className={`${FONT} bi-count font-medium leading-[24px] text-[20px] tabular-nums`} style={{ color: INK }}>
          {count}
        </span>
        <span className={`${FONT} leading-[14px] text-[11.5px]`} style={{ color: MUTE }}>
          prospects identified
        </span>
      </span>
    </div>
  );
}
