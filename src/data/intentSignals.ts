import { getActivitySessions } from "@/data/activitySessions";
import { LEADS } from "@/data/leads";

/**
 * The signals a prospect's intent score is built from.
 *
 * Six of them, each standing for one thing a buyer did and the band of intent
 * that behaviour evidences. The names and the bands are the product's, fixed:
 * nothing here derives a range, invents a seventh signal, or re-scores a
 * prospect. This only says which of the six a given company has produced.
 */

export type IntentSignal = {
  label: string;
  /** The band as the product writes it. */
  range: string;
  /** The same band as numbers, for the concepts that plot it. */
  min: number;
  max: number;
};

export const INTENT_SIGNALS: readonly IntentSignal[] = [
  { label: "Viewed Category Page", range: "30–50%", min: 30, max: 50 },
  { label: "Viewed Product Profile", range: "51–70%", min: 51, max: 70 },
  { label: "Viewed Pricing", range: "71%+", min: 71, max: 100 },
  { label: "Viewed Alternatives", range: "51–70%", min: 51, max: 70 },
  { label: "Compared Products", range: "51–70%", min: 51, max: 70 },
  { label: "Viewed Reviews", range: "51–70%", min: 51, max: 70 },
];

/** The three bands the six signals fall into, strongest first. */
export const INTENT_BANDS: ReadonlyArray<{ range: string; min: number; max: number }> = [
  { range: "71%+", min: 71, max: 100 },
  { range: "51–70%", min: 51, max: 70 },
  { range: "30–50%", min: 30, max: 50 },
];

/**
 * Which of the six this company has actually produced.
 *
 * One question, asked of the activity and of nothing else: did the prospect
 * do this?
 *
 * Four of the six are a page in the Activity tab's own sessions, matched on
 * its path, so what this section claims is visible in the timeline beneath
 * it. The other two, "looked at your profile" and "compared you against
 * someone", have no page of their own and come from the company-level
 * research flags the Signals page counts.
 *
 * Pricing used to be either: the page, or the flag. That OR was the bug.
 * Ironclad Construction carries `pricing: true` and has never opened a
 * pricing page — its whole timeline is alternatives, a demo and the category
 * — so the flag alone lit the one signal in the top band and dragged the
 * summary up with it. Pricing has a page of its own, unlike the other two, so
 * the page is the better evidence and now the only evidence.
 *
 * What does not come into it is the score. The direction runs one way —
 * activity produces signals, signals feed the scoring, scoring produces the
 * number — and reading it backwards to decide which signals fired was wrong
 * in both directions. It deleted real evidence: Bridgeport Consulting opened
 * the alternatives page and the reviews page and scored 50, so both were
 * suppressed for starting above 50 and the section reported "0 of 6" over a
 * timeline showing the two visits. And it would have credited evidence that
 * does not exist, had it ever been allowed to add rather than only remove.
 *
 * A band is what a signal is worth to the scoring, not a claim about where
 * the prospect ended up. The two can disagree — that is what a weighted
 * score does — and when they do, the timeline is what happened.
 */
export function getTriggeredSignals(company: string): ReadonlySet<string> {
  const paths = new Set<string>();
  for (const session of getActivitySessions(company)) {
    for (const page of session.pages) {
      try {
        paths.add(new URL(page.url).pathname);
      } catch {
        /* A path that will not parse tells us nothing; the rest still do. */
      }
    }
  }

  /** The category page is the bare slug — one segment, no sub-page. */
  const visitedCategory = [...paths].some(p => p.split("/").filter(Boolean).length === 1);
  const visited = (leaf: string) => [...paths].some(p => p.endsWith(`/${leaf}`));

  const lead = LEADS.find(l => l.name === company);

  const triggered = new Set<string>();

  /* Four of the six are a page in the timeline below, matched on its own
     path, so a tick here is something the reader can scroll down and see. */
  if (visitedCategory) triggered.add("Viewed Category Page");
  if (visited("pricing")) triggered.add("Viewed Pricing");
  if (visited("alternatives")) triggered.add("Viewed Alternatives");
  if (visited("reviews")) triggered.add("Viewed Reviews");

  /* The other two have no page to match. The seven page shapes the sessions
     are built from are the category listing, pricing, reviews, buyers-guide,
     alternatives, demo and implementation — there is no product-profile page
     and no compare page — so these stay on the company-level research
     signals, which is where "looked at your profile" and "compared you
     against someone" are actually recorded and what the Signals page counts
     and the Prospects filter selects on.

     Note that the category listing is titled "Best X Software - Compared for
     2026". It is not a compare event and is not read as one: it is already
     the category page, and matching "Compared Products" off a word in a
     title would be inventing evidence rather than finding it. */
  if (lead?.signals.profile) triggered.add("Viewed Product Profile");
  if (lead?.signals.competitor) triggered.add("Compared Products");

  return triggered;
}
