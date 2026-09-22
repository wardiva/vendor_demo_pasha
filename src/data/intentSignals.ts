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
 * Read off what the app already holds rather than stored a second time, so a
 * prospect's signals cannot drift from the activity and the counts the rest of
 * the module reports.
 *
 * Three come from the sessions in the Activity tab itself — the pages the buyer
 * opened, matched on their own paths — so what this section claims is visible
 * in the timeline beneath it. The other two are the company-level research
 * signals the Signals page counts and the Prospects filter selects on, which
 * is where "looked at your profile" and "compared you against someone" are
 * recorded. Pricing is either: the page, or the signal.
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

  if (visitedCategory) triggered.add("Viewed Category Page");
  if (lead?.signals.profile) triggered.add("Viewed Product Profile");
  if (visited("pricing") || lead?.signals.pricing) triggered.add("Viewed Pricing");
  if (visited("alternatives")) triggered.add("Viewed Alternatives");
  if (lead?.signals.competitor) triggered.add("Compared Products");
  if (visited("reviews")) triggered.add("Viewed Reviews");

  return triggered;
}
