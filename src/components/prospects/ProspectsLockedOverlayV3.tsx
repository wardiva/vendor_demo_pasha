/**
 * The locked Prospects tab, third design — Figma 83:7790.
 *
 * Kept beside Locked V2 (64:7354) so the two can be compared; the review switch
 * picks which one draws. Same frost, same copy, same lock. What differs is the
 * dialog's height and its right-hand panel, which here is a still illustration
 * rather than an animation. Geometry, read off the node:
 *
 *   dialog  Dialog/Notes   880 x 576; white, radius 16, padding 24 all round,
 *                          drop shadow 0 4 18 #2f2b3d at 16% (shadow-lg).
 *   copy    83:7791        443 x 528, padding 24 24 32 24, space-between: the
 *                          copy packed to the top, the button to the foot.
 *   panel   83:7862        389 x 528, white, radius 12, with the faint hairline
 *                          Figma renders on its edge (measured from its render;
 *                          the node reports an 80% black stroke that the
 *                          render does not show).
 *   shapes  83:7863        Three blurred shapes, each turned 180°, clipped by
 *                          the group's mask, Rectangle 6380 (the panel plus a
 *                          1px ring), each vector at:
 *                            ink   83:7866  609.37 x 1267.25 at (-125.01, 468.86)
 *                            lime  83:7867  399.31 x  983.18 at ( -18.97, -184.88)
 *                            teal  83:7868  232.42 x  637.71 at (  64.71,  160.56)
 *                          — positions relative to the panel, from the canvas
 *                          coordinates of each vector (whose origins, being
 *                          turned 180°, sit at their bottom-right corners).
 *   button  83:7855        155 x 42, #072929, radius 12, 0 1 6 #131120 at 16%;
 *                          26px side padding, 15/26 medium, a 10px gap to a
 *                          20px arrow-right in a 14 x 22 slot.
 *
 * Every image is the node's own export (src/assets/locked-v3). The dialog keeps
 * its 880 x 576 on any column wide enough for it and scales down, whole, on
 * narrower ones — so its proportions never change.
 */

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import featureTick from "@/assets/locked-v3/feature-tick.svg";
import arrowRight from "@/assets/locked-v3/arrow-right.svg";
import panelSurface from "@/assets/locked-v3/panel-surface.svg";
import blobInk from "@/assets/locked-v3/blob-ink.svg";
import blobLime from "@/assets/locked-v3/blob-lime.svg";
import blobTeal from "@/assets/locked-v3/blob-teal.svg";
import { setLockedV3Look, useLockedV3Look, type LockedV3Look } from "@/lib/prospectsAccess";
import CaptureStage from "./animations/orbit/CaptureStage";
import ProspectSignal from "./animations/orbit/ProspectSignal";
import RevealContact from "./animations/orbit/RevealContact";
import VariationHistory from "./VariationHistory";

/** What the gradient panel can carry; the history lists them in this order. */
const LOOKS: ReadonlyArray<{ key: LockedV3Look; label: string; description: string; Scene: (() => ReactNode) | null }> = [
  {
    key: "staged",
    label: "Variation 1 — Final Animation, staged",
    description: "The approved Locked V2 animation, composed for the gradient",
    Scene: CaptureStage,
  },
  {
    key: "signal",
    label: "Variation 2 — Signal to prospect",
    description: "A visitor's intent on Software Finder, identified and delivered as a prospect",
    Scene: ProspectSignal,
  },
  {
    key: "reveal",
    label: "Variation 3 — Reveal the contact",
    description: "Your sales team opens a prospect; it turns into the two contacts behind it",
    Scene: RevealContact,
  },
  {
    key: "figma",
    label: "Figma — Gradient only",
    description: "Figma 83:7790 as delivered, without an animation",
    Scene: null,
  },
];

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";

const DIALOG = { w: 880, h: 576 };
const PANEL = { w: 389, h: 528 };
/** Rectangle 6380: the panel with its 1px outline outside it. */
const SURFACE = { w: 391, h: 530 };
/** The dialog's top edge in the page column, as Locked V2's; and the least room beside it. */
const TOP = 163;
const GUTTER = 24;

const FEATURES = [
  "Company-level buyer intent contacts*",
  "Contact reveal credits per month*",
  "Buyer intent score on every prospect",
  "Category and activity level signals",
  "Competitor signals*",
  "Company firmographics and technographics",
  "Activity history and AI prospect summary",
  "CSV export and API integration",
] as const;

/**
 * The three shapes: each vector's box relative to the panel, and its export,
 * which carries room for its blur — `pad` on every side.
 *
 * The exports blur each shape as the SVG spec does (a 25 or 15px deviation),
 * but Figma draws its layer blur a good deal wider and lighter than that. So
 * each shape takes a further CSS blur and an adjusted opacity, fitted against
 * Figma's own render of 83:7790 pixel by pixel (mean error about 1/255 per
 * channel across the panel), in place of the node's nominal 38%.
 */
const BLOBS = [
  { key: "ink", src: blobInk, x: -125.015, y: 468.86, w: 609.374, h: 1267.253, pad: 50, opacity: 0.25, soften: 140 },
  { key: "lime", src: blobLime, x: -18.971, y: -184.878, w: 399.314, h: 983.176, pad: 50, opacity: 0.38, soften: 80 },
  { key: "teal", src: blobTeal, x: 64.709, y: 160.563, w: 232.416, h: 637.707, pad: 30, opacity: 0.28, soften: 50 },
] as const;

/** Keeps the whole dialog, at its own proportions, inside the column. */
function useFit(ref: RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(1, (width - 2 * GUTTER) / DIALOG.w, (height - TOP - GUTTER) / DIALOG.h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return Math.max(0.5, scale);
}

/** 83:7863 — the illustration: the white panel, and the shapes clipped to the group's mask (Rectangle 6380). */
function Illustration({ children }: { children?: ReactNode }) {
  return (
    <div className="relative shrink-0" style={{ width: PANEL.w, height: PANEL.h }} data-name="Group 48095611">
      {/* Rectangle 27202: the white panel. */}
      <div className="absolute inset-0 rounded-[12px] bg-white" />
      <div
        className="absolute overflow-hidden"
        style={{
          left: -1,
          top: -1,
          width: SURFACE.w,
          height: SURFACE.h,
          maskImage: `url("${panelSurface}")`,
          maskSize: `${SURFACE.w}px ${SURFACE.h}px`,
          maskRepeat: "no-repeat",
          maskMode: "alpha",
          WebkitMaskImage: `url("${panelSurface}")`,
          WebkitMaskSize: `${SURFACE.w}px ${SURFACE.h}px`,
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        {BLOBS.map(b => (
          <div
            key={b.key}
            className="absolute"
            style={{ left: b.x + 1, top: b.y + 1, width: b.w, height: b.h, transform: "rotate(180deg)", opacity: b.opacity, filter: `blur(${b.soften}px)` }}
          >
            <img
              alt=""
              src={b.src}
              className="absolute block max-w-none"
              style={{ left: -b.pad, top: -b.pad, width: b.w + 2 * b.pad, height: b.h + 2 * b.pad }}
            />
          </div>
        ))}
      </div>
      {/* The panel's edge as Figma renders it: a hairline on the panel's own first
          pixel, about 2.5% black, over the shapes. */}
      {/* Whatever the history has chosen to set in the gradient, clipped to the panel. */}
      {children && <div className="absolute inset-0 overflow-hidden rounded-[12px]">{children}</div>}
      <div className="pointer-events-none absolute inset-0 rounded-[12px]" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.025)" }} />
    </div>
  );
}

export default function ProspectsLockedOverlayV3() {
  const frame = useRef<HTMLDivElement>(null);
  const look = useLockedV3Look();
  const Scene = (LOOKS.find(l => l.key === look) ?? LOOKS[0]).Scene;
  const scale = useFit(frame);
  return (
    <div
      ref={frame}
      /* The same frost as the other designs: #FFFFFF at 80% over the page
         column, which carries the 4px blur itself (see Frame63). */
      className="absolute bottom-0 left-[302px] right-0 top-[60px] z-[5] rounded-[10px] bg-[rgba(255,255,255,0.8)]"
      data-name="Prospects / Locked V3"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospects-locked-v3-title"
        className="absolute left-1/2 flex items-stretch overflow-hidden rounded-[16px] bg-white p-[24px]"
        style={{
          top: TOP,
          width: DIALOG.w,
          height: DIALOG.h,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "50% 0",
          boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
        }}
        data-name="Dialog/Notes"
      >
        {/* 83:7791 — the copy, with the button pushed to the foot. */}
        <div className="flex w-[443px] shrink-0 flex-col justify-between pb-[32px] pl-[24px] pr-[24px] pt-[24px]">
          <div className="flex flex-col gap-[28px]">
            <div className="flex flex-col gap-[8px]">
              <h2
                id="prospects-locked-v3-title"
                /* Nudged 1px down, out of the flow: the browser sets Inter 24/32 a pixel
                   higher in its line box than Figma does. */
                className="relative top-[1px] font-['Inter',sans-serif] font-medium leading-[32px] text-[24px]"
                style={{ color: INK }}
              >
                Unlock Buyer Intelligence
              </h2>
              <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[14px]" style={{ color: MUTED }}>
                See the companies researching your profile.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <ul className="flex flex-col gap-[12px]">
                {FEATURES.map(f => (
                  <li key={f} className="flex h-[20px] items-center gap-[8px]">
                    {/* The node's "state" slot: 14 x 18, the tick centred in it. */}
                    <span className="flex h-[18px] w-[14px] shrink-0 items-center justify-center">
                      <img alt="" src={featureTick} width={14} height={14} className="block size-[14px] max-w-none" />
                    </span>
                    <span
                      className="font-['Inter',sans-serif] font-medium leading-[20px] text-[14px] whitespace-nowrap"
                      style={{ color: INK }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Contextual alternates off, as in Figma: otherwise Inter centres an asterisk
                  that stands before a capital. */}
              <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[14px]" style={{ color: MUTED, fontFeatureSettings: "'calt' 0" }}>
                *Limits and availability vary by plan
              </p>
            </div>
          </div>

          {/* 83:7855 "Default Button". The node's text is "view plans" set in title case. */}
          <button
            type="button"
            className="flex h-[42px] w-[155px] cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-[#072929] px-[26px] font-['Inter',sans-serif] font-medium leading-[26px] text-[15px] text-white transition-colors hover:bg-[#0b3b3b]"
            style={{ boxShadow: "0px 1px 6px 0px rgba(19,17,32,0.16)" }}
          >
            <span className="whitespace-nowrap">View Plans</span>
            {/* The arrow's 20px box overhangs its 14 x 22 slot by 3px each side. */}
            <span className="relative block h-[22px] w-[14px] shrink-0">
              <img alt="" src={arrowRight} width={20} height={20} className="absolute left-[-3px] top-[1px] block size-[20px] max-w-none" />
            </span>
          </button>
        </div>

        {/* 83:7863 — the illustration. */}
        <Illustration>{Scene && <Scene key={look} />}</Illustration>
      </div>
      <VariationHistory
        title="History — Variations of Locked V3"
        label="Locked V3 illustration"
        items={LOOKS}
        current={look}
        onSelect={setLockedV3Look}
        storageKey="locked-v3-bar"
        marker="data-locked-v3-bar"
      />
    </div>
  );
}
