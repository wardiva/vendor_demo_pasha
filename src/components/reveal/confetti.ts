import confetti from "canvas-confetti";
import type { CreateTypes, Options } from "canvas-confetti";

/**
 * Magic UI's ConfettiButton behaviour, shared by every Reveal Contact control.
 *
 * Magic UI measures the button, converts its centre to viewport-normalised
 * coordinates and hands them to canvas-confetti as the origin. That is exactly
 * what happens here, so the burst carries canvas-confetti's own defaults and
 * launches from the button rather than the card or the page centre.
 *
 * The one addition is the canvas: the library's default canvas sits at
 * z-index 100 and would be hidden behind the Company Info modal, so one shared
 * canvas is created above it instead. Physics and defaults are untouched.
 */
let instance: CreateTypes | null = null;

function confettiInstance(): CreateTypes {
  if (instance) return instance;
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10000";
  document.body.appendChild(canvas);
  instance = confetti.create(canvas, { resize: true, useWorker: true });
  return instance;
}

/**
 * Fires the burst from an element's centre. Measure the button before it is
 * hidden by the reveal, then pass the rect in.
 */
/**
 * Burst shape. canvas-confetti's own defaults — 45 start velocity, 45 spread,
 * 200 ticks — fire a narrow column that overshoots well above the card and
 * hangs around. These keep the pieces near the button, fan them out around it
 * and finish sooner, without touching the colours, count or particle size.
 */
const BURST: Options = {
  startVelocity: 30, // was 45 — keeps the arc close to the button
  spread: 110, // was 45 — fans around the card instead of straight up
  gravity: 1.15, // was 1 — pulls back down sooner, lowering the peak
  ticks: 140, // was 200 — shorter life, so it clears quicker
};

export function fireConfettiFrom(
  rect: { top: number; left: number; width: number; height: number },
  options?: Options,
) {
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  /* Normalised against the viewport the canvas actually spans. Magic UI uses
     window.innerWidth, which includes the scrollbar the canvas does not cover
     and drifts the burst a few pixels off the button on scrolling pages. */
  const { clientWidth, clientHeight } = document.documentElement;
  void confettiInstance()({
    ...BURST,
    ...options,
    origin: { x: x / clientWidth, y: y / clientHeight },
  });
}
