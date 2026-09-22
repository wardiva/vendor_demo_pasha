import { getActivitySessions } from "@/data/activitySessions";
import { LEADS } from "@/data/leads";
import { getCompanyProfile } from "@/data/companies";

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
 * Two questions, asked in order, because they are different questions and
 * running them together is what produced a 50% prospect whose signals said
 * "strongest is a 71%+ signal".
 *
 * First: did the activity produce this signal at all? Four of the six are
 * read off the sessions in the Activity tab — the pages the buyer opened,
 * matched on their own paths — so what this section claims is visible in the
 * timeline beneath it. The other two, "looked at your profile" and "compared
 * you against someone", have no page of their own and come from the
 * company-level research flags the Signals page counts.
 *
 * Pricing used to be either: the page, or the flag. That OR was the bug.
 * Ironclad Construction carries `pricing: true` and has never opened a
 * pricing page — its whole timeline is alternatives, a demo and the category
 * — so the flag alone lit the one signal in the top band and dragged the
 * summary up with it. Pricing has a page of its own, unlike the other two, so
 * the page is the better evidence and now the only evidence.
 *
 * Second: could this signal have contributed to the score the prospect
 * actually carries? A band is what a signal is worth when it fires. If a
 * 71%+ signal had counted, the score would not be 50 — so at 50 it did not
 * count, whatever the activity shows, and a signal the score cannot account
 * for is not reported as triggered. The score is the source of truth, and
 * this is the line that makes it one.
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

  /* 1 — what the activity produced. */
  const observed = new Set<string>();
  if (visitedCategory) observed.add("Viewed Category Page");
  if (lead?.signals.profile) observed.add("Viewed Product Profile");
  if (visited("pricing")) observed.add("Viewed Pricing");
  if (visited("alternatives")) observed.add("Viewed Alternatives");
  if (lead?.signals.competitor) observed.add("Compared Products");
  if (visited("reviews")) observed.add("Viewed Reviews");

  /* 2 — of those, the ones the score can account for. A signal whose band
     starts above the prospect's score cannot have contributed to it: the
     score would be at least that high if it had. Missing profile, or a score
     of 0, admits nothing above the bottom band, which is the honest reading
     of having no score to attribute anything to. */
  const score = getCompanyProfile(company)?.intentPct ?? 0;
  const triggered = new Set<string>();
  for (const signal of INTENT_SIGNALS) {
    if (observed.has(signal.label) && signal.min <= score) triggered.add(signal.label);
  }

  return triggered;
}
