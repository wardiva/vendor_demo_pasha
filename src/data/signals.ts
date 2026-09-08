import { PROSPECTS, PROSPECT_COMPANY_NAMES } from "@/data/prospects";
import { COMPANY_ACTIVITY_SPAN, daysAgo } from "@/data/demoDates";
/**
 * Canonical dataset for the Buyer Intent Signals page.
 *
 * Every analytics card on the page (the four summary stats, Activity Level,
 * Buyers Tech Stack, Headquarter Location and Company Size) is derived from
 * this single list of companies, so applying a filter updates all of them
 * consistently instead of each card carrying its own hard-coded numbers.
 *
 * The generator is seeded and deterministic: the same dataset is produced on
 * every load, and the unfiltered aggregates reproduce the numbers from the
 * original design (see TARGET_* below).
 */

/* ─────────────────────────── domain ─────────────────────────── */

export const ACTIVITY_LEVELS = ["Low", "Medium", "High"] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const TECH_STACK = ["HubSpot", "Granola", "Figma", "Claude", "VS Code"] as const;
export type Tech = (typeof TECH_STACK)[number];

/** Canonical size buckets — these labels are what the Company Size chart renders. */
export const COMPANY_SIZES = ["1-50", "51-200", "201-1K", "1K-5K", "5K+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

/** Countries offered in the Headquarter Location filter. */
export const FILTERABLE_LOCATIONS = [
  "United States", "Canada", "Germany", "United Kingdom", "Singapore",
] as const;

/** The card reads "Top 5 of 8 countries", so the dataset spans 8. */
export const ALL_LOCATIONS = [
  ...FILTERABLE_LOCATIONS, "Australia", "France", "Netherlands",
] as const;
export type Location = (typeof ALL_LOCATIONS)[number];

export const SIGNAL_KINDS = ["profile", "pricing", "competitor"] as const;
export type SignalKind = (typeof SIGNAL_KINDS)[number];

export type Company = {
  id: string;
  name: string;
  activity: ActivityLevel;
  location: Location;
  size: CompanySize;
  techStack: Tech[];
  /** People from this company currently in market — feeds "Buyers in Market". */
  buyers: number;
  /** Which research signals this company has produced. */
  signals: Record<SignalKind, boolean>;
  /**
   * When this account was last active.
   *
   * What the Date Range filter measures against: every summary figure, trend
   * and breakdown on the Signals page is aggregated from the accounts that
   * survive the filters, so dating them is what makes those tiles answer to
   * the selected period.
   */
  lastActivity: Date;
  /* ── previous reporting period, used for the summary cards' trend ── */
  previousBuyers: number;
  previousSignals: Record<SignalKind, boolean>;
};

/* ─────────────────────── generation targets ───────────────────────
 * Chosen so the unfiltered page matches the original static design.
 * Every marginal total below is hit exactly by the generator.
 */

const TOTAL_COMPANIES = 1349;

const TARGET_SIZE: Record<CompanySize, number> = {
  "1-50": 72, "51-200": 502, "201-1K": 421, "1K-5K": 325, "5K+": 29,
};

const TARGET_ACTIVITY: Record<ActivityLevel, number> = {
  /* Preserves the design's 8 : 9 : 9 split across the full dataset. */
  Low: 415, Medium: 467, High: 467,
};

const TARGET_LOCATION: Record<Location, number> = {
  /* Preserves the design's 8 : 7 : 3 : 2 : 1 ordering for the top five. */
  "United States": 486, "Canada": 425, "Germany": 182, "United Kingdom": 122,
  "Singapore": 61, "Australia": 36, "France": 24, "Netherlands": 13,
};

const TARGET_TECH: Record<Tech, number> = {
  HubSpot: 633, Granola: 532, Figma: 476, Claude: 406, "VS Code": 397,
};

/** Companies producing each signal type — these are the summary-card values. */
const TARGET_SIGNALS: Record<SignalKind, number> = {
  profile: 1250, pricing: 1180, competitor: 540,
};

/** Total people in market — the "Buyers in Market" summary card. */
const TARGET_BUYERS = 2480;

/**
 * Previous reporting period. Calibrated so the unfiltered trends land on the
 * figures from the original design: +20.4%, +10.2%, +20.4% and +20.5%.
 * (Competitor cannot hit 20.4% exactly — no whole number of companies divides
 * 540 into that ratio — so it lands one tenth of a point above.)
 */
const TARGET_PREVIOUS_BUYERS = 2060;
const TARGET_PREVIOUS_SIGNALS: Record<SignalKind, number> = {
  profile: 1134, pricing: 980, competitor: 448,
};

/**
 * The named accounts, pinned so filtering by them behaves predictably.
 *
 * These are the Prospects page's companies, in its card order — the Signals
 * filter's company selector lists the same set, so a selection there always
 * resolves to a real account here.
 *
 * Every one of them carries the competitor signal. The Competitors filter
 * offers this whole list, and a company selected there matches only if it
 * actually produces competitor research — so the ten that did not were offered
 * as options that could never return anything, and picking one emptied the
 * page. The association is real rather than waived: the filter still requires
 * the signal, and now every name it offers genuinely has it. The dataset's
 * competitor total is unchanged, since the generated accounts draw from what
 * these leave of the same budget.
 */
const FEATURED: Array<Omit<Company, "id" | "buyers" | "previousBuyers" | "previousSignals" | "lastActivity">> = [
  {
    name: "Meridian Supply Co.", activity: "High", location: "Canada", size: "51-200",
    techStack: ["HubSpot", "Figma"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Northvane Technologies", activity: "High", location: "United Kingdom", size: "1K-5K",
    techStack: ["HubSpot", "VS Code"],
    signals: { profile: false, pricing: true, competitor: true },
  },
  {
    name: "Bowline Freight", activity: "Medium", location: "United States", size: "1-50",
    techStack: ["Claude", "Granola"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Canopy Health Group", activity: "Medium", location: "United States", size: "1-50",
    techStack: ["Claude", "Granola"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Stratos Analytics", activity: "High", location: "United States", size: "201-1K",
    techStack: ["Figma", "VS Code"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Ironclad Construction", activity: "Low", location: "Germany", size: "201-1K",
    techStack: ["HubSpot"],
    signals: { profile: false, pricing: true, competitor: true },
  },
  {
    name: "Summit Ridge Energy", activity: "Medium", location: "Singapore", size: "1K-5K",
    techStack: ["Granola", "VS Code"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Pinehurst Media", activity: "Low", location: "United States", size: "1-50",
    techStack: ["Figma"],
    signals: { profile: true, pricing: false, competitor: true },
  },

  /* ── The eleven prospects added from Figma 221:2126 ──
     They had no account here, so the Signals table fell back to a neutral
     record for them — Low activity, no location, no tech, the smallest size —
     which meant every facet filter excluded them and the page looked as though
     filtering were broken. Given real facets, spread so that each option of
     each group matches several prospects and the ordinary two- and three-filter
     combinations land on something. The totals stay exact: featured accounts
     draw from the same budgets as the generated ones. */
  {
    /* Granola + 51-200 + Canada, so that combination returns a prospect. */
    name: "Apex Logistics Group", activity: "Medium", location: "Canada", size: "51-200",
    techStack: ["Granola", "HubSpot"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Meridian Health Systems", activity: "High", location: "United States", size: "201-1K",
    techStack: ["Claude", "Figma"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    /* One of the two accounts in the largest size band, which had none. */
    name: "NovaTech Solutions", activity: "High", location: "United States", size: "5K+",
    techStack: ["VS Code", "Claude"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Pinnacle Financial Group", activity: "Low", location: "United Kingdom", size: "1K-5K",
    techStack: ["HubSpot", "Claude"],
    signals: { profile: false, pricing: true, competitor: true },
  },
  {
    name: "Vanguard Manufacturing", activity: "Medium", location: "Germany", size: "5K+",
    techStack: ["Figma", "HubSpot"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Clearview Analytics", activity: "High", location: "Canada", size: "201-1K",
    techStack: ["Granola", "Figma"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Summit Energy Corp", activity: "Low", location: "Singapore", size: "51-200",
    techStack: ["VS Code"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Bridgeport Consulting", activity: "Medium", location: "United Kingdom", size: "51-200",
    techStack: ["Granola", "Claude"],
    signals: { profile: false, pricing: true, competitor: true },
  },
  {
    name: "Hyperion Aerospace", activity: "Low", location: "United States", size: "1K-5K",
    techStack: ["HubSpot", "VS Code"],
    signals: { profile: true, pricing: true, competitor: true },
  },
  {
    name: "Solaris Biotech", activity: "High", location: "Germany", size: "201-1K",
    techStack: ["Claude", "Granola"],
    signals: { profile: true, pricing: false, competitor: true },
  },
  {
    name: "Onyx Cybersecurity", activity: "Medium", location: "Singapore", size: "1-50",
    techStack: ["Figma", "VS Code"],
    signals: { profile: true, pricing: true, competitor: true },
  },
];

/** Company names selectable inside the Signals filter sub-panels. */
export const FEATURED_COMPANY_NAMES = FEATURED.map(c => c.name);

/* ─────────────────────────── generator ─────────────────────────── */

/** mulberry32 — small deterministic PRNG so the dataset is stable per load. */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Expands {a: 2, b: 1} into ["a", "a", "b"]. */
function expand<T extends string>(counts: Record<T, number>): T[] {
  const pool: T[] = [];
  for (const key of Object.keys(counts) as T[]) {
    for (let i = 0; i < counts[key]; i++) pool.push(key);
  }
  return pool;
}

/** Removes one instance of `value`, so featured rows draw from the same budget. */
function take<T>(pool: T[], value: T) {
  const i = pool.indexOf(value);
  if (i !== -1) pool.splice(i, 1);
}

/**
 * Picks `count` indices spread evenly across `total` using a stride walk.
 * Deterministic, and guarantees exactly `count` distinct indices.
 */
function stridedIndices(total: number, count: number, offset: number): Set<number> {
  const picked = new Set<number>();
  if (count <= 0 || total <= 0) return picked;
  const stride = total / count;
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(offset + i * stride) % total;
    /* Collisions are possible after rounding — walk forward to the next free slot. */
    while (picked.has(idx)) idx = (idx + 1) % total;
    picked.add(idx);
  }
  return picked;
}

function buildCompanies(): Company[] {
  const rand = makeRandom(0x5eed);

  const activityPool = expand(TARGET_ACTIVITY);
  const locationPool = expand(TARGET_LOCATION);
  const sizePool = expand(TARGET_SIZE);

  /* Featured accounts consume from the same budgets so totals stay exact. */
  for (const f of FEATURED) {
    take(activityPool, f.activity);
    take(locationPool, f.location);
    take(sizePool, f.size);
  }

  const activities = shuffle(activityPool, rand);
  const locations = shuffle(locationPool, rand);
  const sizes = shuffle(sizePool, rand);

  const blankSignals = (): Record<SignalKind, boolean> =>
    ({ profile: false, pricing: false, competitor: false });

  const companies: Company[] = FEATURED.map((f, i) => ({
    ...f,
    id: `featured-${i}`,
    techStack: [...f.techStack],
    signals: { ...f.signals },
    buyers: 0,
    previousBuyers: 0,
    previousSignals: blankSignals(),
    /**
     * A featured account is a prospect, so it is dated the day that prospect
     * was last seen rather than given one of its own.
     *
     * Dated independently, the two could disagree: selecting a competitor
     * showed its prospect card, because that reads the prospect's visited
     * date, while every figure above read this one — and if the account's own
     * date fell outside the selected period the page reported nothing for a
     * company it was plainly listing. The draw is still made so the seeded
     * sequence, and therefore the rest of the dataset, is unchanged.
     */
    lastActivity: (() => {
      const fallback = daysAgo(Math.floor(rand() * COMPANY_ACTIVITY_SPAN));
      const visited = Date.parse(PROSPECTS.find(p => p.name === f.name)?.date ?? "");
      return Number.isNaN(visited) ? fallback : new Date(visited);
    })(),
  }));

  const generatedCount = TOTAL_COMPANIES - FEATURED.length;
  for (let i = 0; i < generatedCount; i++) {
    companies.push({
      id: `company-${i}`,
      name: `Account ${String(i + 1).padStart(4, "0")}`,
      activity: activities[i],
      location: locations[i],
      size: sizes[i],
      techStack: [],
      buyers: 0,
      signals: blankSignals(),
      previousBuyers: 0,
      previousSignals: blankSignals(),
      lastActivity: daysAgo(Math.floor(rand() * COMPANY_ACTIVITY_SPAN)),
    });
  }

  /* ── tech stack: exact per-tool totals, companies may use several tools ── */
  const remainingTech = { ...TARGET_TECH };
  for (const c of companies.slice(0, FEATURED.length)) {
    for (const t of c.techStack) remainingTech[t] -= 1;
  }
  TECH_STACK.forEach((tech, ti) => {
    const pool = companies.slice(FEATURED.length);
    const picks = stridedIndices(pool.length, remainingTech[tech], ti * 137);
    picks.forEach(i => pool[i].techStack.push(tech));
  });

  /* ── signals: exact company counts per signal kind ── */
  const remainingSignals = { ...TARGET_SIGNALS };
  for (const c of companies.slice(0, FEATURED.length)) {
    for (const k of SIGNAL_KINDS) if (c.signals[k]) remainingSignals[k] -= 1;
  }
  SIGNAL_KINDS.forEach((kind, ki) => {
    const pool = companies.slice(FEATURED.length);
    const picks = stridedIndices(pool.length, remainingSignals[kind], ki * 311);
    picks.forEach(i => (pool[i].signals[kind] = true));
  });

  /* ── buyers in market: every company has at least one, remainder spread ── */
  const spreadBuyers = (budget: number, assign: (c: Company, n: number) => void) => {
    let left = budget;
    for (const c of companies) {
      assign(c, 1);
      left -= 1;
    }
    const extras = shuffle(
      companies.map((_, i) => i),
      rand,
    );
    for (let i = 0; i < extras.length && left > 0; i++) {
      assign(companies[extras[i]], 2);
      left -= 1;
    }
  };

  spreadBuyers(TARGET_BUYERS, (c, n) => (c.buyers = n === 1 ? 1 : c.buyers + 1));
  spreadBuyers(
    TARGET_PREVIOUS_BUYERS,
    (c, n) => (c.previousBuyers = n === 1 ? 1 : c.previousBuyers + 1),
  );

  /* ── previous-period signals, offset from the current period so the trend
   *    varies by company rather than moving uniformly ── */
  SIGNAL_KINDS.forEach((kind, ki) => {
    const picks = stridedIndices(companies.length, TARGET_PREVIOUS_SIGNALS[kind], ki * 523 + 71);
    picks.forEach(i => (companies[i].previousSignals[kind] = true));
  });

  return companies;
}

export const COMPANIES: Company[] = buildCompanies();

/* ─────────────────────────── filtering ─────────────────────────── */

/**
 * Dimensions the Signals filter's sub-panel offers. Narrower than SIGNAL_KINDS,
 * which stays the full research-signal vocabulary the analytics cards are built
 * from: the sub-panel filters by buyers in market and by competitor research.
 */
export const SIGNAL_FILTER_KINDS = ["buyersInMarket", "competitor"] as const;
export type SignalFilterKind = (typeof SIGNAL_FILTER_KINDS)[number];

export type AppliedFilters = {
  activity: ActivityLevel[];
  techStack: Tech[];
  location: string[];
  companySize: CompanySize[];
  /** Company names selected under each signal sub-panel. */
  signals: Record<SignalFilterKind, string[]>;
};

export const EMPTY_FILTERS: AppliedFilters = {
  activity: [], techStack: [], location: [], companySize: [],
  signals: { buyersInMarket: [], competitor: [] },
};

export function countActiveFilters(f: AppliedFilters): number {
  const signalCount = SIGNAL_FILTER_KINDS.some(k => f.signals[k].length > 0) ? 1 : 0;
  return (
    (f.activity.length ? 1 : 0) +
    (f.techStack.length ? 1 : 0) +
    (f.location.length ? 1 : 0) +
    (f.companySize.length ? 1 : 0) +
    signalCount
  );
}

export function hasActiveFilters(f: AppliedFilters): boolean {
  return countActiveFilters(f) > 0;
}

/**
 * Combined AND across categories, OR within a category — the behaviour a user
 * expects from a multi-select filter panel.
 */
export function matchesFilters(c: Company, f: AppliedFilters): boolean {
  if (f.activity.length && !f.activity.includes(c.activity)) return false;
  if (f.location.length && !f.location.includes(c.location)) return false;
  if (f.companySize.length && !f.companySize.includes(c.size)) return false;
  if (f.techStack.length && !f.techStack.some(t => c.techStack.includes(t))) return false;

  /* A company matches the Signals filter when it was picked under a signal
   * sub-panel AND actually produces that signal: buyers currently in market
   * for the Buyers in Market list, competitor research for the other. */
  const signalSelections = SIGNAL_FILTER_KINDS.filter(k => f.signals[k].length > 0);
  if (signalSelections.length) {
    const hit = signalSelections.some(
      kind =>
        f.signals[kind].includes(c.name) &&
        (kind === "buyersInMarket" ? c.buyers > 0 : c.signals.competitor),
    );
    if (!hit) return false;
  }
  return true;
}

/**
 * The accounts a selection covers.
 *
 * The chips and the Date Range narrow the same list, so they compose rather
 * than one overriding the other. Everything the Signals page shows — the
 * summary figures, their trends, and the activity, tech stack, location and
 * size breakdowns — is aggregated from what this returns, which is what makes
 * the whole page answer to the selected period rather than only its table.
 */
export function filterCompanies(f: AppliedFilters, within?: (d: Date) => boolean): Company[] {
  const byFilters = hasActiveFilters(f) ? COMPANIES.filter(c => matchesFilters(c, f)) : COMPANIES;
  return within ? byFilters.filter(c => within(c.lastActivity)) : byFilters;
}

/* ─────────────────────────── aggregation ─────────────────────────── */

export type Slice = { label: string; count: number; pct: number };

export type SummaryStat = {
  key: "buyers" | SignalKind;
  value: number;
  /** Share of the current selection producing this signal (signal cards only). */
  pct: number;
  /** Same measure over the previous reporting period. */
  previous: number;
  /**
   * Percentage change against the previous period. `null` when there is no
   * baseline to compare against, which the card renders as a neutral state.
   */
  deltaPct: number | null;
};

export type SignalsAnalytics = {
  total: number;
  isEmpty: boolean;
  stats: Record<"buyers" | SignalKind, SummaryStat>;
  /**
   * Buyers behind each research signal — what the Profile Signals and Pricing
   * Signals cards report.
   *
   * `stats` counts the accounts producing a signal; this counts the people. A
   * buyer is counted once for the period however many times they came back,
   * because it reads the account's own distinct in-market buyer count — the
   * same figure the Buyers in Market card sums — rather than anything
   * per-visit. So the three are on one scale: profile and pricing buyers are
   * both subsets of Buyers in Market, and cannot exceed it.
   */
  signalBuyers: Record<SignalKind, SummaryStat>;
  activity: Slice[];
  techStack: Slice[];
  /** Top five countries within the current selection. */
  locations: Slice[];
  /** Distinct countries with matching data, for the "Top 5 of N countries" caption. */
  locationCount: number;
  /** Total countries tracked by the dataset, regardless of the current filter. */
  locationUniverse: number;
  companySize: Slice[];
};

const share = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

/**
 * @param techSelection  The Tech Stack filter's current selection. The Buyers
 *                       Tech Stack card keeps every technology on screen and
 *                       reads the ones outside the selection as zero, so the
 *                       filter empties their bars instead of removing their
 *                       rows. Counts stay derived from `companies`, which the
 *                       caller has already narrowed by every active filter.
 *                       Empty — no Tech Stack filter — charts them all.
 */
export function aggregate(
  companies: Company[],
  techSelection: readonly Tech[] = [],
): SignalsAnalytics {
  const total = companies.length;

  const buyers = companies.reduce((sum, c) => sum + c.buyers, 0);
  const signalTotals = {
    profile: companies.filter(c => c.signals.profile).length,
    pricing: companies.filter(c => c.signals.pricing).length,
    competitor: companies.filter(c => c.signals.competitor).length,
  };

  const previousBuyers = companies.reduce((sum, c) => sum + c.previousBuyers, 0);
  const previousSignalTotals = {
    profile: companies.filter(c => c.previousSignals.profile).length,
    pricing: companies.filter(c => c.previousSignals.pricing).length,
    competitor: companies.filter(c => c.previousSignals.competitor).length,
  };

  /* No previous-period baseline means the change is undefined, not zero. */
  const change = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
  };

  const stat = (key: SummaryStat["key"], value: number, previous: number, pct: number): SummaryStat => ({
    key, value, previous, pct, deltaPct: change(value, previous),
  });

  /**
   * The people behind each signal, over the same selection.
   *
   * An account contributes the buyers it has in market to every signal it
   * produces, so someone who read the pricing page four times in the period is
   * one buyer here, exactly as they are one buyer in the card above. Previous
   * period is measured the same way against that period's own signals, so the
   * trend runs through the same `stat`/`change` the other cards use.
   */
  const signalBuyers = Object.fromEntries(
    SIGNAL_KINDS.map(kind => {
      const value = companies.reduce((sum, c) => (c.signals[kind] ? sum + c.buyers : sum), 0);
      const previous = companies.reduce(
        (sum, c) => (c.previousSignals[kind] ? sum + c.previousBuyers : sum),
        0,
      );
      return [kind, stat(kind, value, previous, share(value, buyers))];
    }),
  ) as Record<SignalKind, SummaryStat>;

  const activity: Slice[] = ACTIVITY_LEVELS.map(level => {
    const count = companies.filter(c => c.activity === level).length;
    return { label: level, count, pct: share(count, total) };
  });

  /* Every technology keeps its row, the way every bucket does in Company Size:
     one the filter leaves out reads zero and draws an empty track rather than
     disappearing. Order is the dataset's own and never sorts by count, so a row
     holds the place the eye left it in while its bar animates to the new
     figure — and a row on its way to zero can be watched going there. */
  const techStack: Slice[] = TECH_STACK.map(tech => {
    const excluded = techSelection.length > 0 && !techSelection.includes(tech);
    const count = excluded ? 0 : companies.filter(c => c.techStack.includes(tech)).length;
    return { label: tech, count, pct: share(count, total) };
  });

  /**
   * Zero-count countries stay in the list so the card can render them as empty
   * bar tracks, matching how Company Size keeps every bucket visible. Ranking
   * is by size, falling back to the dataset's canonical order so ties — and the
   * run of zeros at the bottom — render in a stable sequence.
   */
  const byCountry = ALL_LOCATIONS.map((name, order) => {
    const count = companies.filter(c => c.location === name).length;
    return { label: name as string, count, pct: share(count, total), order };
  });
  byCountry.sort((a, b) => b.count - a.count || a.order - b.order);

  const companySize: Slice[] = COMPANY_SIZES.map(label => {
    const count = companies.filter(c => c.size === label).length;
    return { label, count, pct: share(count, total) };
  });

  return {
    total,
    isEmpty: total === 0,
    stats: {
      buyers: stat("buyers", buyers, previousBuyers, 100),
      profile: stat("profile", signalTotals.profile, previousSignalTotals.profile, share(signalTotals.profile, total)),
      pricing: stat("pricing", signalTotals.pricing, previousSignalTotals.pricing, share(signalTotals.pricing, total)),
      competitor: stat("competitor", signalTotals.competitor, previousSignalTotals.competitor, share(signalTotals.competitor, total)),
    },
    signalBuyers,
    activity,
    techStack,
    locations: byCountry.slice(0, 5).map(({ label, count, pct }) => ({ label, count, pct })),
    /* Caption counts only countries that actually have data in the selection. */
    locationCount: byCountry.filter(s => s.count > 0).length,
    locationUniverse: ALL_LOCATIONS.length,
    companySize,
  };
}

/** Unfiltered baseline — reproduces the numbers from the original design. */
export const DEFAULT_ANALYTICS = aggregate(COMPANIES);

/* ─────────────────────── Signals filter row ─────────────────────── */

/**
 * The options each chip on the Signals filter row offers, taken from the
 * page's own vocabularies — the same lists the panel has always filtered by.
 * Competitor lists the companies, which is what that group holds.
 */
export const SIGNALS_FILTER_OPTIONS: Record<string, readonly string[]> = {
  activity: ACTIVITY_LEVELS,
  techStack: TECH_STACK,
  location: FILTERABLE_LOCATIONS,
  companySize: COMPANY_SIZES,
  competitor: PROSPECT_COMPANY_NAMES,
};

/** Replaces one chip's group, leaving the other four exactly as they were. */
export function applySignalsGroup(
  f: AppliedFilters,
  key: string,
  values: string[],
): AppliedFilters {
  if (key === "competitor") {
    return { ...f, signals: { ...f.signals, competitor: values } };
  }
  return { ...f, [key]: values } as AppliedFilters;
}

/** Empties one chip's group. */
export function clearSignalsGroup(f: AppliedFilters, key: string): AppliedFilters {
  return applySignalsGroup(f, key, []);
}
