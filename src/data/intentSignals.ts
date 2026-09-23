import { getActivitySessions } from "@/data/activitySessions";
import { LEADS } from "@/data/leads";

/**
 * The signals a prospect's intent score is built from.
 *
 * Five of them, each standing for one thing a buyer did and the band of
 * intent that behaviour evidences. The names and the bands are the product's,
 * fixed: nothing here derives a range, invents a signal, or re-scores a
 * prospect. This only says which of the five a given company has produced.
 *
 * There were six. "Compared Products" is gone — the competitor flag it read
 * is still counted by the Signals page and still selectable in the Prospects
 * filter; it just no longer stands as an intent signal of its own.
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
  { label: "Viewed Reviews", range: "51–70%", min: 51, max: 70 },
];

/** The three bands the five signals fall into, strongest first. */
export const INTENT_BANDS: ReadonlyArray<{ range: string; min: number; max: number }> = [
  { range: "71%+", min: 71, max: 100 },
  { range: "51–70%", min: 51, max: 70 },
  { range: "30–50%", min: 30, max: 50 },
];

/**
 * Which of the five this company has actually produced.
 *
 * One question, asked of the activity and of nothing else: did the prospect
 * do this?
 *
 * Four of the five are a page in the Activity tab's own sessions, matched on
 * its path, so what this section claims is visible in the timeline beneath
 * it. The fifth, "looked at your profile", has no page of its own and comes
 * from the company-level research flag the Signals page counts.
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

  /* Four of the five are a page in the timeline below, matched on its own
     path, so a tick here is something the reader can scroll down and see. */
  if (visitedCategory) triggered.add("Viewed Category Page");
  if (visited("pricing")) triggered.add("Viewed Pricing");
  if (visited("alternatives")) triggered.add("Viewed Alternatives");
  if (visited("reviews")) triggered.add("Viewed Reviews");

  /* The fifth has no page to match. The seven page shapes the sessions are
     built from are the category listing, pricing, reviews, buyers-guide,
     alternatives, demo and implementation — there is no product-profile page
     — so this one stays on the company-level research flag, which is where
     "looked at your profile" is actually recorded and what the Signals page
     counts and the Prospects filter selects on.

     The competitor flag is still read elsewhere — the Signals page counts it
     and the Prospects filter selects on it — it simply no longer produces an
     intent signal of its own. */
  if (lead?.signals.profile) triggered.add("Viewed Product Profile");

  return triggered;
}

/**
 * The score those signals add up to.
 *
 * This is the step that was missing. The signals were read off the activity
 * and the score was written by hand beside it, so the two were free to
 * disagree and did — Summit Ridge Energy opened a pricing page and carried a
 * 40, which is a 71%+ signal on a prospect the product called low intent.
 * Nothing reconciled them because nothing computed one from the other.
 *
 * Two rules, both of them the product's own:
 *
 * The band is the strongest signal that fired. A signal's range is what it is
 * worth, so the best evidence sets the floor: a prospect who opened pricing is
 * in 71%+ and one who only saw the category page is in 30–50. This is what
 * makes the section and the score consistent by construction — the score can
 * no longer sit below a band whose signal is ticked, because that band is
 * what put it there.
 *
 * Where it sits inside the band is how much else corroborates it. One signal
 * lands on the floor of its band; each further signal moves it up a fifth of
 * the band's width. Five of five reaches 96 rather than 100, because a
 * scoring model that can be maxed out has stopped discriminating at the top.
 *
 * No signals is no score. It is not 30: 30 is the floor of a band a prospect
 * earns by doing something, and a prospect who has done none of the five has
 * not earned it.
 */
export function getIntentScore(company: string): number {
  const triggered = getTriggeredSignals(company);
  if (triggered.size === 0) return 0;

  const fired = INTENT_SIGNALS.filter(s => triggered.has(s.label));
  const band = fired.reduce((best, s) => (s.min > best.min ? s : best), fired[0]);
  const corroboration = (triggered.size - 1) / INTENT_SIGNALS.length;
  return band.min + Math.round((band.max - band.min) * corroboration);
}


/**
 * The fixtures against the scorer, on local hosts only.
 *
 * The prospect cards, the tables and the modal header all read `intentPct`
 * off the fixtures rather than calling the scorer, because the data modules
 * they come from sit upstream of the activity and cannot import it without a
 * cycle. Those numbers are generated from `getIntentScore` — but generated
 * once, which is exactly how they drifted in the first place: the signals
 * moved and the scores stayed where somebody had typed them.
 *
 * So the agreement is checked rather than assumed. Editing a session, a
 * research flag, a band or the scoring rule and leaving a fixture behind now
 * says so in the console on the next load, naming every prospect that no
 * longer adds up, instead of showing a 40% prospect with a 71%+ signal ticked
 * and waiting for somebody to notice.
 */
export function auditIntentFixtures(
  prospects: ReadonlyArray<{ name: string; intentPct: number }>,
): Array<{ name: string; fixture: number; derived: number }> {
  return prospects
    .map(p => ({ name: p.name, fixture: p.intentPct, derived: getIntentScore(p.name) }))
    .filter(r => r.fixture !== r.derived);
}
