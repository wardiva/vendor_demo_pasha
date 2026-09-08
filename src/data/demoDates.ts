/**
 * When the demo data happened.
 *
 * The dataset used to carry dates written out as fixed strings, which meant
 * every window measured from today — Today, Yesterday, Last 7 Days — was empty
 * the moment the clock moved past them. The dates are counted back from today
 * instead, so each preset always has something to show and the filtering stays
 * genuinely date-based: nothing is exempted from a range, the records simply
 * sit at offsets that every window can reach.
 *
 * The values themselves are the demo's own. Nothing else about a record
 * changes — only when it is dated.
 */

/**
 * Days back from today, one per prospect in dataset order.
 *
 * Spread so every preset window contains records and every window still
 * excludes some: the last two sit beyond ninety days, so Last 90 Days is a
 * filter rather than a synonym for the whole list.
 */
export const PROSPECT_DAY_OFFSETS = [
  0, 1, 2, 4, 6, /* Today, Yesterday and the rest of the last week */
  9, 14, 20, 27, /* within the last 30 */
  35, 44, 52, 58, /* within the last 60 */
  66, 75, 82, 88, /* within the last 90 */
  118, 147, /* older than every preset */
];

/** How far back the generated company activity reaches. */
export const COMPANY_ACTIVITY_SPAN = 120;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** The day `n` days before today, at midnight. */
export function daysAgo(n: number, today = new Date()): Date {
  const d = startOfDay(today);
  d.setDate(d.getDate() - n);
  return d;
}

/** The day `n` days after today, at midnight. */
export function daysAhead(n: number, today = new Date()): Date {
  return daysAgo(-n, today);
}

/**
 * A visited date in the shape the dataset has always written them —
 * "Jul 18, 2026" — so the tables read the same and `Date.parse`, which the Sort
 * control relies on, still understands them.
 */
export function formatVisited(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/**
 * The same date with its year dropped — "Aug 31, 2026" reads "Aug 31".
 *
 * Display only. The record keeps the full string it has always carried, which
 * is what `Date.parse` reads for the Sort control and what the date filter
 * measures its ranges against; this trims the year off on the way to the screen
 * and touches neither. A string that is not written the dataset's way is passed
 * through untouched rather than guessed at.
 */
export function withoutYear(dateText: string): string {
  return dateText.replace(/,\s*\d{4}\s*$/, "");
}
