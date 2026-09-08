import { useEffect, useRef, useState } from "react";

/**
 * A metric's headline number, counted up to its value.
 *
 * On first render it runs from zero; after that it runs from whatever is on
 * screen to whatever the filters have just produced, so a filtered figure
 * travels from the old number rather than dropping back to zero. Retargeting
 * mid-count picks up from the value showing at that moment.
 *
 * The number is the only thing that moves — nothing fades, slides or scales,
 * and the text keeps the type it is given. The count is eased out, so it opens
 * quickly and settles rather than ticking along at a constant rate.
 *
 * Layout is held still while the digits run: an invisible twin holds the box
 * open at the width of the longest string the count will pass through, and the
 * live number is drawn over it. Whatever sits beside the number therefore stays
 * put instead of being pushed about on every frame.
 */

const DURATION = 600;
/* Ease-out cubic: most of the distance is covered early, then it settles. */
const ease = (t: number) => 1 - (1 - t) ** 3;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function AnimatedMetric({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  /* What is on screen right now — the next count starts from here. */
  const displayed = useRef(0);
  const [from, setFrom] = useState(0);
  const running = shown !== value;

  useEffect(() => {
    const start = displayed.current;
    if (start === value) return;
    if (prefersReducedMotion()) {
      displayed.current = value;
      setShown(value);
      return;
    }
    setFrom(start);

    let frame = 0;
    let began = 0;
    const step = (now: number) => {
      if (!began) began = now;
      const progress = Math.min((now - began) / DURATION, 1);
      const next = start + (value - start) * ease(progress);
      displayed.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(step);
      else displayed.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const text = Math.round(shown).toLocaleString();
  /* While counting, the box is held at the longer of where it started and
     where it is going; settled, it is the number's own width. */
  const ends = [from.toLocaleString(), value.toLocaleString()];
  const sizing = running ? (ends[0].length >= ends[1].length ? ends[0] : ends[1]) : text;

  return (
    <span className="inline-block relative">
      <span aria-hidden className="invisible">
        {sizing}
      </span>
      <span className="absolute left-0 top-0">{text}</span>
    </span>
  );
}
