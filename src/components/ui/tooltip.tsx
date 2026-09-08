import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";

import { cn } from "@/lib/utils";
import tooltipArrow from "@/components/assets/tooltip-arrow.svg";

/**
 * shadcn/ui Tooltip, on Base UI.
 *
 * The behaviour is the registry component's, untouched — the provider, the
 * root, the trigger's `render` composition, the portal and the positioner.
 * Only the treatment is the product's own: Figma 227:3150 draws this tooltip
 * as a white card rather than the registry's dark pill, so `TooltipContent`
 * carries that design instead of the default one.
 */

function TooltipProvider({
  delay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
  sideOffset?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["sideOffset"];
}) {
  return (
    <TooltipPrimitive.Portal>
      {/* Figma 227:3150 carries the shadow on the frame around both the body
          and its caret, so it sits here rather than on the body — a shadow on
          the body alone would stop at the caret's shoulder. */}
      <TooltipPrimitive.Positioner
        sideOffset={sideOffset}
        className="z-50 drop-shadow-[0px_2px_4px_rgba(47,43,61,0.12)]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            /* 227:3152 — white, 10px radius, 12px/6px padding; and 227:3153's
               type: Inter regular at 12/18 in the text-primary ink, tracked
               0.4 and never wrapped. */
            "w-fit origin-[var(--transform-origin)] rounded-[10px] bg-white px-[12px] py-[6px] font-['Inter',sans-serif] text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#2f2b3d] whitespace-nowrap transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {/* 227:3154 — the design's own 12x6 caret, hung off the body rather
              than sitting in it.

              The positioner places the arrow flush against the inside of the
              popup's edge, which put this white caret on the popup's own white
              fill: rendered, measured, and completely invisible. Shifting it by
              its own height clears the edge, so it reads as the tip the design
              draws beneath the body — the column of body-then-caret that
              227:3151 lays out. The export points up, so it is turned over when
              the tooltip sits above its trigger and left alone when it flips
              below. */}
          <TooltipPrimitive.Arrow className="h-[6px] w-[12px] data-[side=bottom]:-translate-y-full data-[side=top]:translate-y-full data-[side=top]:rotate-180">
            <img alt="" className="block max-w-none size-full" src={tooltipArrow} />
          </TooltipPrimitive.Arrow>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
