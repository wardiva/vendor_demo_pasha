import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LIME, LIVE, usePrefersReducedMotion, type Company } from "../shared";

/**
 * The orbit concept's shared kit — the geometry, the clock and the few
 * pieces every treatment of it draws.
 *
 * The treatments are driven by time rather than by beats: each frame asks
 * "where is everything at t?", so a company can be followed continuously as
 * it drifts, is threaded, pulled in and filed, and nothing has to be chained
 * through transitions. `t` is milliseconds into the current loop; `now` is
 * milliseconds since mount, for motion that runs across loops (a slow
 * rotation) without jumping at the seam.
 */

export const W = 357;
export const H = 558;
export const CX = W / 2;

export const DEEP = "#041c1c";
export const SURFACE = "rgba(255,255,255,0.06)";
export const WHITE_HI = "rgba(255,255,255,0.92)";
export const WHITE_MID = "rgba(255,255,255,0.68)";
export const WHITE_LO = "rgba(255,255,255,0.45)";

/** How bright a signal is drawn, by the band it evidences: brighter is closer to buying. */
export const SIGNAL_TONE = {
  Category: "rgba(177,250,99,0.5)",
  Profile: "rgba(177,250,99,0.75)",
  Pricing: LIME,
} as const;

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Progress through [a, b] of the loop, 0 before and 1 after. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOutBack = (p: number) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};

export const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

export const polar = (cx: number, cy: number, a: number, r: number) => ({
  x: cx + r * Math.cos((a * Math.PI) / 180),
  y: cy + r * Math.sin((a * Math.PI) / 180),
});

/** A thread bowed by `bend` from a point to a centre, with its own midpoint. */
export function thread(from: { x: number; y: number }, to: { x: number; y: number }, bend: number) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const qx = mx + (-dy / len) * bend;
  const qy = my + (dx / len) * bend;
  const at = (p: number) => ({
    x: (1 - p) * (1 - p) * from.x + 2 * (1 - p) * p * qx + p * p * to.x,
    y: (1 - p) * (1 - p) * from.y + 2 * (1 - p) * p * qy + p * p * to.y,
  });
  return {
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    at,
  };
}

/**
 * The clock. Re-renders every animation frame with the time into the loop.
 * With reduced motion it holds at `rest` — the treatment's finished state.
 */
export function useLoopClock(loop: number, rest: number) {
  const reduced = usePrefersReducedMotion();
  const [now, setNow] = useState(reduced ? rest : 0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = (ts: number) => {
      if (start.current === null) start.current = ts;
      setNow(ts - start.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  return { t: reduced ? rest : now % loop, cycle: reduced ? 0 : Math.floor(now / loop), now, reduced };
}

/** The four-square mark that stands for the vendor's own profile. */
export function ProfileGlyph({ size = 22, color = LIME }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1.2" fill={color} />
      <rect x="8" y="1" width="5" height="5" rx="1.2" fill={color} opacity="0.55" />
      <rect x="1" y="8" width="5" height="5" rx="1.2" fill={color} opacity="0.55" />
      <rect x="8" y="8" width="5" height="5" rx="1.2" fill={color} />
    </svg>
  );
}

/** A company as the field draws it: a disc, out of focus until `focus` reaches 1. */
export function CompanyDisc({
  company,
  size,
  focus,
  dark = true,
  style,
}: {
  company: Company;
  size: number;
  focus: number;
  dark?: boolean;
  style?: CSSProperties;
}) {
  const blur = (1 - focus) * 3.2;
  return (
    <span
      className="absolute block overflow-hidden rounded-[100px]"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: dark ? "rgba(255,255,255,0.1)" : "#ffffff",
        boxShadow: dark ? "0 0 0 1px rgba(255,255,255,0.08)" : "0px 2px 8px 0px rgba(47,43,61,0.12)",
        ...style,
      }}
    >
      <img
        alt=""
        src={company.logo}
        className="block size-full object-cover"
        style={{
          filter: `blur(${blur.toFixed(2)}px) grayscale(${(1 - focus).toFixed(2)})`,
          opacity: 0.38 + 0.62 * focus,
        }}
      />
    </span>
  );
}

/** A ring gauge drawn around a point, `p` of the way round. */
export function RingGauge({
  x,
  y,
  r,
  p,
  color = LIME,
  track = "rgba(255,255,255,0.12)",
  width = 2,
  opacity = 1,
}: {
  x: number;
  y: number;
  r: number;
  p: number;
  color?: string;
  track?: string;
  width?: number;
  opacity?: number;
}) {
  const c = 2 * Math.PI * r;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={track} strokeWidth={width * 0.75} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${(c * clamp01(p)).toFixed(2)} ${c.toFixed(2)}`}
        transform={`rotate(-90 ${x} ${y})`}
      />
    </g>
  );
}

export { LIME, LIVE };
