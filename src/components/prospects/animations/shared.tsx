import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { PROSPECTS } from "@/data/prospects";
import { intentTagColor } from "@/components/IntentTag";

/**
 * What the five Locked V2 animation concepts share: the product's own tokens,
 * the companies they show, the pieces of product UI they are built from, and
 * the clock that drives them.
 *
 * Every concept is a sequence of beats on a loop. The clock only says which
 * beat has been reached; the concepts turn that into styles, and CSS
 * transitions do the moving. So each concept reads as a list of states rather
 * than a pile of timers, and a beat can be retimed without touching the look.
 */

export const INK = "#2f2b3d";
export const MUTED = "rgba(47,43,61,0.7)";
export const FAINT = "rgba(47,43,61,0.45)";
export const HAIR = "rgba(47,43,61,0.08)";
export const LIVE = "#072929";
export const LIME = "#B1FA63";
export const SKELETON = "#eeedf0";
export const FONT = "font-['Inter',sans-serif]";

export const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
/** For things arriving: fast out of the gate, a long settle. */
export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

export const CARD_SHADOW = "0px 4px 18px 0px rgba(47,43,61,0.08)";

/** The signals as the product names them — see data/intentSignals. */
export const SIGNAL = {
  category: { label: "Viewed Category Page", short: "Category", range: "30–50%" },
  profile: { label: "Viewed Product Profile", short: "Profile", range: "51–70%" },
  pricing: { label: "Viewed Pricing", short: "Pricing", range: "71%+" },
  reviews: { label: "Viewed Reviews", short: "Reviews", range: "51–70%" },
  alternatives: { label: "Viewed Alternatives", short: "Alternatives", range: "51–70%" },
  demo: { label: "Viewed Demo", short: "Demo", range: "71%+" },
} as const;

export type Company = {
  id: string;
  name: string;
  industry: string;
  logo: string;
  domain: string;
  score: number;
  avatars: string[];
};

/** The app's own prospects, so every name and logo is one the page holds. */
export function useCompanies(min = 80): Company[] {
  return useMemo(
    () =>
      PROSPECTS.filter(p => p.intentPct >= min && p.logo).map(p => ({
        id: p.id,
        name: p.name,
        industry: p.industry,
        logo: p.logo,
        domain: p.domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        score: p.intentPct,
        avatars: p.contacts.map(c => c.avatar),
      })),
    [min],
  );
}

/** Every prospect with a logo, whatever its score — for lists that need range. */
export function useAllCompanies(): Company[] {
  return useCompanies(0);
}

export function usePrefersReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
}

/**
 * The clock. `beats` are the times, in ms from the start of a loop, at which
 * each beat begins; `loop` is the loop's length. Returns the beat reached and
 * which loop this is. With reduced motion it parks on `restBeat` — the
 * concept's finished state — and never ticks.
 */
export function useBeats(beats: readonly number[], loop: number, restBeat: number) {
  const reduced = usePrefersReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [beat, setBeat] = useState(reduced ? restBeat : 0);

  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    setBeat(0);
    beats.forEach((ms, i) => {
      if (i > 0) timers.push(window.setTimeout(() => setBeat(i), ms));
    });
    timers.push(window.setTimeout(() => setCycle(c => c + 1), loop));
    return () => timers.forEach(t => window.clearTimeout(t));
    /* The beats are constants of each concept. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, reduced, loop]);

  return { beat, cycle, reduced };
}

/** A transition list in the house easing. */
export const tr = (props: string[], ms = 420, delay = 0, ease = EASE) =>
  props.map(p => `${p} ${ms}ms ${ease} ${delay}ms`).join(", ");

export function Logo({ src, size, radius = 8, style }: { src: string; size: number; radius?: number; style?: CSSProperties }) {
  return (
    <img
      alt=""
      src={src}
      className="block shrink-0 object-cover"
      style={{ width: size, height: size, borderRadius: radius, ...style }}
    />
  );
}

/** The product's Intent tag, at the sizes these compositions need. */
export function IntentChip({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  return (
    <span
      className={`${FONT} inline-flex shrink-0 items-center justify-center rounded-[6px] font-medium whitespace-nowrap ${
        size === "sm" ? "px-[6px] text-[10.5px] leading-[16px]" : "px-[8px] text-[11px] leading-[18px]"
      }`}
      style={{ background: intentTagColor(score), color: INK }}
    >
      {`Intent ${score}%`}
    </span>
  );
}

/** The lime tick, drawn as a ring until `on`, then filling. */
export function Tick({ on, size = 12 }: { on: boolean; size?: number }) {
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-[100px]"
        style={{ border: "1px solid rgba(47,43,61,0.22)", opacity: on ? 0 : 1, transition: tr(["opacity"], 260) }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        className="absolute inset-0 block"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "scale(1)" : "scale(0.5)",
          transition: tr(["opacity"], 260) + ", " + tr(["transform"], 420, 0, EASE_OUT),
        }}
      >
        <circle cx="6" cy="6" r="5.5" fill={LIME} stroke={LIME} />
        <path d="M3.33 6.2L5 7.88L8.36 4.53" stroke={LIVE} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** A score's place on the product's three equal intent bands. */
export function bandLeft(score: number) {
  const bands = [
    { min: 30, max: 50 },
    { min: 51, max: 70 },
    { min: 71, max: 100 },
  ];
  if (score < 30) return "0px";
  const i = Math.max(0, bands.findIndex(b => score >= b.min && score <= b.max));
  const b = bands[i];
  const within = (Math.min(Math.max(score, b.min), b.max) - b.min) / (b.max - b.min);
  return `calc((100% - 6px) / 3 * ${(i + within).toFixed(4)} + ${3 * i}px)`;
}

/** The Activity tab's three-band intent bar, with its marker at `score`. */
export function BandBar({ score, height = 6, markerVisible = true }: { score: number; height?: number; markerVisible?: boolean }) {
  return (
    <span className="relative block flex-1" style={{ height }}>
      <span className="flex h-full w-full gap-[3px]">
        {[30, 51, 71].map(min => (
          <span key={min} className="h-full flex-1 rounded-[100px]" style={{ background: intentTagColor(min) }} />
        ))}
      </span>
      <span
        className="absolute rounded-[2px]"
        style={{
          left: bandLeft(score),
          marginLeft: -1,
          top: -3,
          bottom: -3,
          width: 2,
          background: LIVE,
          opacity: markerVisible ? 1 : 0,
          transition: tr(["left"], 620) + ", " + tr(["opacity"], 300),
        }}
      />
    </span>
  );
}

/** Unknown company: a building in a quiet tile. */
export function AnonTile({ size = 32, radius = 8, dark = false }: { size?: number; radius?: number; dark?: boolean }) {
  const s = Math.round(size * 0.5);
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius, background: dark ? "rgba(255,255,255,0.08)" : SKELETON }}
    >
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3 14V3.5C3 2.95 3.45 2.5 4 2.5H9C9.55 2.5 10 2.95 10 3.5V14M10 6.5H12C12.55 6.5 13 6.95 13 7.5V14M1.75 14H14.25M5.5 5.5H7.5M5.5 8H7.5M5.5 10.5H7.5"
          stroke={dark ? "rgba(255,255,255,0.45)" : FAINT}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** A company's domain with its name part withheld: "●●●●●●.com". */
export function maskDomain(domain: string) {
  const parts = domain.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "com";
  const n = Math.min(Math.max((parts[0] || "company").length, 6), 11);
  return `${"●".repeat(n)}.${tld}`;
}

/** Blurred, overlapping contact portraits — the people a reveal would name. */
export function ContactStack({ avatars, size = 22, blurred = true }: { avatars: string[]; size?: number; blurred?: boolean }) {
  return (
    <span className="flex items-center">
      {avatars.slice(0, 3).map((a, i) => (
        <span
          key={i}
          className="relative block shrink-0 overflow-hidden rounded-[100px]"
          style={{
            width: size,
            height: size,
            marginLeft: i ? -7 : 0,
            boxShadow: "0 0 0 2px #ffffff",
            zIndex: 3 - i,
          }}
        >
          <img
            alt=""
            src={a}
            className="block size-full object-cover"
            style={{ filter: blurred ? "blur(3px)" : "none", transform: "scale(1.15)" }}
          />
        </span>
      ))}
    </span>
  );
}

/** The lime "live" dot, breathing. */
export function LiveDot({ size = 6, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: dark ? LIME : "#6bbf1e" }} />
      <span className="absolute inset-0 rounded-[100px]" style={{ background: dark ? LIME : "#6bbf1e" }} />
    </span>
  );
}
