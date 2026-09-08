import { useEffect, useRef, useState } from "react";
import type { Slice } from "@/data/signals";

/**
 * The Signals cards' figures, on their way to wherever the data has moved.
 *
 * One animation drives both arrivals. On the first render every slice starts
 * at zero, so the card draws itself in; afterwards each slice starts from
 * whatever is on screen, so a filter takes 486 to 182 rather than back through
 * zero. Retargeting mid-flight picks up from the values showing at that moment.
 *
 * Slices are matched by label, not by position: the tech stack reorders itself
 * by count, and a row must animate to its own new figure rather than to
 * whichever row happens to have taken its place. A label the data has not
 * shown before starts at zero, which is the same thing the first render does.
 *
 * Bar widths and arc lengths are derived from these counts by the callers, so
 * the geometry and the numbers move on one clock. Callers should take `max`
 * and `total` from the target slices rather than these, or every bar would be
 * measured against a scale moving with it and never appear to grow.
 */

const DURATION = 700;
/* Ease-out cubic — the curve the headline metrics count on. */
const ease = (t: number) => 1 - (1 - t) ** 3;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Figures = { count: number; pct: number };

export function useAnimatedSlices(target: Slice[], duration = DURATION): [Slice[], boolean] {
  /* What is on screen right now, by label — where the next run starts from. */
  const shown = useRef(new Map<string, Figures>());
  const [, tick] = useState(0);
  const [animating, setAnimating] = useState(false);

  /* Re-run whenever the figures themselves change, not on every render. */
  const signature = target.map(s => `${s.label}:${s.count}:${s.pct}`).join("|");

  useEffect(() => {
    const from = new Map(shown.current);
    const settle = () => {
      shown.current = new Map(target.map(s => [s.label, { count: s.count, pct: s.pct }]));
      setAnimating(false);
      tick(n => n + 1);
    };
    if (prefersReducedMotion()) {
      settle();
      return;
    }
    const unchanged = target.every(s => {
      const now = from.get(s.label);
      return now && now.count === s.count && now.pct === s.pct;
    });
    if (unchanged) return;

    setAnimating(true);
    let frame = 0;
    let began = 0;
    const step = (now: number) => {
      if (!began) began = now;
      const progress = Math.min((now - began) / duration, 1);
      const eased = ease(progress);
      const next = new Map<string, Figures>();
      for (const slice of target) {
        const start = from.get(slice.label) ?? { count: 0, pct: 0 };
        next.set(slice.label, {
          count: start.count + (slice.count - start.count) * eased,
          pct: start.pct + (slice.pct - start.pct) * eased,
        });
      }
      shown.current = next;
      tick(n => n + 1);
      if (progress < 1) frame = requestAnimationFrame(step);
      else settle();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [signature, duration]);

  /* The target's order and labels, carrying the figures currently on screen. */
  const current = target.map(slice => {
    const now = shown.current.get(slice.label);
    return now ? { ...slice, count: now.count, pct: now.pct } : { ...slice, count: 0, pct: 0 };
  });

  return [current, animating];
}

/** A figure mid-flight, rounded for display. */
export const shownValue = (value: number) => Math.round(value);
