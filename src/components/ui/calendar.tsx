import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * shadcn/ui Calendar — the registry component, on react-day-picker.
 *
 * Used here in range mode across two months. Its colours are theme tokens, so
 * a selected day takes the product's ink and the days between it take the same
 * wash every other hover in the module uses.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      /* The nav bar is absolutely positioned against this root, so the root has
         to be the thing it measures from — without `relative` it resolves to
         whatever ancestor is positioned instead, which put the right chevron
         out over the presets column beside the calendar. */
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        /* The caption is given the navigation buttons' own height, and the nav
           bar is laid over that same band — inset by the root's padding, not by
           a hand-picked offset — so each chevron is centred on its month's
           label and the pair stay balanced at any width. `justify-between`
           puts one at the outer edge of the first month and the other at the
           outer edge of the last. */
        month_caption: "flex h-7 items-center justify-center relative",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-3 top-3 flex h-7 items-center justify-between z-10",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        /* The registry rounds the boundaries with `:has(> .day-range-start)`,
           which assumes the marker sits on a child of the cell. This version of
           react-day-picker puts `range_start` and `range_end` on the cell
           itself, so those selectors never matched and both ends rendered
           square. The radius is set on those two class slots below instead,
           where it lands on the element that actually carries the fill. */
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent",
          props.mode === "range" ? "" : "[&:has([aria-selected])]:rounded-md",
        ),
        /**
         * The cell owns the colour; the button only draws the hover.
         *
         * The ghost variant repaints its own text on hover, in the accent ink —
         * which is the same ink the selected cells are filled with, so hovering
         * a range end turned its number dark-on-dark and it vanished. Inheriting
         * instead means the number always takes whatever its cell has decided:
         * white on the two solid ends, the deep ink inside the range, the muted
         * grey on days outside the month and on disabled ones.
         */
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100 hover:text-inherit",
        ),
        /* The two ends of the range are rounded on their outer side, at the
           same `rounded-md` the day buttons and the nav controls use, so the
           band reads as one shape with two finished ends. A range of a single
           day carries both classes and so is rounded all round. The days
           between take no radius at all, which is what keeps the fill
           continuous across them. */
        /* The two ends are solid, so the button's hover wash is suppressed over
           them — laid on top it only lightened the fill. The days between keep
           their own hover, which still reads against the range tint. */
        range_start:
          "day-range-start rounded-l-md aria-selected:bg-primary aria-selected:text-primary-foreground [&>button]:hover:bg-transparent",
        range_end:
          "day-range-end rounded-r-md aria-selected:bg-primary aria-selected:text-primary-foreground [&>button]:hover:bg-transparent",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        /* Today is marked by weight alone. It used to take the accent fill —
           the same wash the days inside a range are drawn in — so with a
           one-day preset applied, today sat beside the selected day looking
           like the other end of a two-day range. Emphasis says the same thing
           without competing with the selection, and when today *is* the
           selected day it simply renders bold inside the solid fill. */
        today: "font-medium",
        /**
         * A day belonging to the neighbouring month is shown for context only,
         * never as part of the selection.
         *
         * With two months side by side the same date is drawn twice — the 31st
         * of August also fills a leading cell in September — and both copies
         * were taking the selected fill, so a one-day preset looked like two
         * selected days in two different months. Each month now highlights only
         * its own days; the greyed numbers still show, they just no longer
         * carry the selection. The doubled selector is what lifts these above
         * the single-class fills the selected states set.
         */
        outside:
          "day-outside text-muted-foreground [&&]:bg-transparent [&&]:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
