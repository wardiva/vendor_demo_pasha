import type { DateRange } from "@/components/DateRangePicker";
import { formatShortDate } from "@/components/DateRangePicker";
import { daysAgo, daysAhead, startOfDay } from "@/data/demoDates";
import { PROSPECT_DATE_SPAN } from "@/data/prospects";

/**
 * The date range the Signals and Prospects toolbars offer.
 *
 * Both pages read this one model, so the presets, the label and what counts as
 * inside the range are decided in a single place and the two controls cannot
 * drift apart.
 */

export type DatePresetKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "60d"
  | "90d"
  | "custom"
  | "all";

export const DATE_PRESETS: ReadonlyArray<{
  key: DatePresetKey;
  label: string;
  /**
   * How far back the preset reaches, counted inclusively from today — so 1 is
   * today alone. Null for Custom Range, whose span the calendar sets, and for
   * All Time, which has no span to reach back over.
   */
  days: number | null;
  /** Days to shift the window back. Yesterday is the single day before today. */
  offset?: number;
}> = [
  { key: "today", label: "Today", days: 1 },
  { key: "yesterday", label: "Yesterday", days: 1, offset: 1 },
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "60d", label: "Last 60 Days", days: 60 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "custom", label: "Custom Range", days: null },
  /* Last, under Custom Range: the row that takes the date filter off rather
     than setting it to something. */
  { key: "all", label: "All Time", days: null },
];

/**
 * What the toolbar has selected.
 *
 * Every selection carries a range, including All Time — its dates are simply
 * never consulted. Keeping the shape the same means the calendar always has a
 * month to open on and nothing downstream has to handle a missing range; what
 * makes All Time unbounded is that the two date tests below answer before they
 * reach it.
 */
export type DateSelection = {
  preset: DatePresetKey;
  range: DateRange;
};

/**
 * The range both pages open on.
 *
 * A custom one covering the whole dataset — its earliest visited date through
 * its latest — so every prospect is on screen before any filter is touched. It
 * is read off the prospects themselves rather than written down, so a record
 * dated outside today's span widens the default instead of being hidden by it.
 */
export function defaultDateSelection(today = new Date()): DateSelection {
  const { start, end } = PROSPECT_DATE_SPAN;
  /* Nothing datable in the set — fall back to a window around today rather
     than to an empty range, so the page still shows a period. */
  if (!start || !end) {
    return { preset: "custom", range: { start: daysAgo(22, today), end: daysAhead(9, today) } };
  }
  return { preset: "custom", range: { start, end } };
}

/**
 * The window a rolling preset covers, counted back from today inclusive — so
 * "Last 7 days" is today and the six days before it, not today minus seven.
 */
export function resolvePreset(key: DatePresetKey, today = new Date()): DateRange | null {
  const preset = DATE_PRESETS.find(p => p.key === key);
  if (!preset?.days) return null;
  const offset = preset.offset ?? 0;
  const end = startOfDay(today);
  end.setDate(end.getDate() - offset);
  const start = new Date(end);
  start.setDate(start.getDate() - (preset.days - 1));
  return { start, end };
}

/** Builds the selection a preset row stands for. */
export function selectionFor(key: DatePresetKey, today = new Date()): DateSelection {
  /* Only Custom Range has no span of its own, and it is never chosen through
     here — the calendar hands its dates over directly. */
  return { preset: key, range: resolvePreset(key, today) ?? defaultDateSelection(today).range };
}

/**
 * Whether a date falls inside the selection. Both ends inclusive.
 *
 * All Time is not a very wide window, it is the absence of one: every date is
 * inside it, so the answer comes before any range is read.
 */
export function isDateWithin(date: Date, selection: DateSelection): boolean {
  if (selection.preset === "all") return true;
  const day = startOfDay(date).getTime();
  return (
    day >= startOfDay(selection.range.start).getTime() &&
    day <= startOfDay(selection.range.end).getTime()
  );
}

/**
 * What the Date Range button reads.
 *
 * A preset reads as its own name — "Last 30 Days" says what was chosen, where
 * the dates it resolves to only say what that happens to mean today. Only a
 * custom range spells its dates out, and it spells them without the year: the
 * button is a filter, not a record, and the year is the part of it that never
 * varies across a range anyone picks here. The full dates are still what the
 * calendar shows and what the filter measures against; this is the trigger's
 * text and nothing else.
 */
export function dateSelectionLabel(selection: DateSelection): string {
  const preset = DATE_PRESETS.find(p => p.key === selection.preset);
  if (preset && preset.key !== "custom") return preset.label;

  const { start, end } = selection.range;
  /* A custom range picked on one date reads as that date rather than as a
     range from it to itself. */
  if (startOfDay(start).getTime() === startOfDay(end).getTime()) {
    return formatShortDate(start);
  }
  return `${formatShortDate(start)}  →  ${formatShortDate(end)}`;
}

/**
 * Whether a prospect's visited date falls in the selection.
 *
 * The dates the dataset ships are display strings ("Jul 18, 2026"), which is
 * what `Date.parse` already reads for the Sort control, so this reads them the
 * same way. Both ends are inclusive, and a date the parser cannot make sense of
 * is kept rather than silently dropped from the page. All Time keeps every
 * record for the same reason it does above: there is no window to fall outside
 * of.
 */
export function isWithinSelection(dateText: string, selection: DateSelection): boolean {
  if (selection.preset === "all") return true;
  const t = Date.parse(dateText);
  if (Number.isNaN(t)) return true;
  const day = startOfDay(new Date(t)).getTime();
  return (
    day >= startOfDay(selection.range.start).getTime() &&
    day <= startOfDay(selection.range.end).getTime()
  );
}
