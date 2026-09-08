import { getCompanyProfile } from "@/data/companies";
import { PROSPECTS } from "@/data/prospects";

/**
 * Buying sessions behind the Activity tab.
 *
 * Activity used to be a flat list of things a company did — "viewed your
 * pricing page 7 times" — with no sense of when one visit ended and the next
 * began. A session is the unit that actually means something to whoever reads
 * this panel: one person, in one place, at one sitting, moving through a set of
 * pages and clicking things on them. So the records are sessions now, and the
 * timeline draws each one between its own start and end.
 *
 * The sessions are generated rather than written out, for the same reason the
 * rest of the demo data is: every prospect needs some, and generating them from
 * the prospect's own identity keeps them consistent with the record they belong
 * to. A session is seeded from the company's name, so it is stable across
 * reloads; its pages come from the company's own industry, its location from
 * the company's headquarters where the profile states one, and its dates from
 * the prospect's own visited date. Nothing here invents a company, a person or
 * a date the dataset does not already hold.
 */

export type ActivityPageVisit = {
  title: string;
  url: string;
  /** Time spent on the page, e.g. "1 min 20 sec". */
  duration: string;
  /** Clock time the visit began, e.g. "09:14". */
  at: string;
  /** What was clicked while on it, in order. */
  clicks: string[];
};

export type ActivityLocation = {
  city: string;
  /** State, province or region. */
  region: string;
  country: string;
};

export type ActivitySession = {
  /** Who the session is attributed to — anonymous where it is not known. */
  visitor: string;
  /** "Jul 18, 2026" — the dataset's own date format. */
  date: string;
  startedAt: string;
  endedAt: string;
  location: ActivityLocation;
  /** Spelled out, e.g. "2 minutes, 22 seconds". */
  total: string;
  /** The same length as a number, so sessions can be summed. */
  totalSeconds: number;
  pages: ActivityPageVisit[];
};

/* ─────────────────────────── generator ─────────────────────────── */

/** mulberry32, as the signals dataset uses — stable output per seed. */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T,>(items: readonly T[], rand: () => number): T => items[Math.floor(rand() * items.length)];

/**
 * The pages a buyer in a given category reads.
 *
 * Software Finder's own pages — the product this module reports on — so a
 * visit reads as somebody researching on it. Each entry is a title and the
 * path it sits at; the category segment comes from the prospect's industry.
 */
const CATEGORY_PATHS: Record<string, string> = {
  Manufacturing: "manufacturing",
  "Cloud Infrastructure": "cloud",
  "Logistics & Shipping": "logistics",
  "Supply Chain": "supply-chain",
  "Healthcare Services": "healthcare",
  "Healthcare IT": "healthcare",
  "Data & Analytics": "analytics",
  "Data & AI": "analytics",
  Construction: "construction",
  "Renewable Energy": "energy",
  "Clean Energy": "energy",
  "Digital Advertising": "marketing",
  "Financial Services": "finance",
  "Industrial IoT": "iot",
  "Management Consulting": "consulting",
  "Defense & Aerospace": "aerospace",
  "Life Sciences": "life-sciences",
  Cybersecurity: "security",
};

const PAGE_SHAPES: ReadonlyArray<(category: string, slug: string) => { title: string; path: string }> = [
  (c, s) => ({ title: `Best ${c} Software - Compared for 2026`, path: `/${s}` }),
  (c, s) => ({ title: `${c} Software Pricing Guide - 2026`, path: `/${s}/pricing` }),
  (c, s) => ({ title: `Top 10 ${c} Platforms - Reviews and Ratings`, path: `/${s}/reviews` }),
  (c, s) => ({ title: `${c} Software Buyer's Guide`, path: `/${s}/buyers-guide` }),
  (c, s) => ({ title: `${c} Software Alternatives and Competitors`, path: `/${s}/alternatives` }),
  (c, s) => ({ title: `${c} Software Demo - Book a Walkthrough`, path: `/${s}/demo` }),
  (c, s) => ({ title: `${c} Software Implementation Checklist`, path: `/${s}/implementation` }),
];

const CLICKS = [
  "Watch Demo",
  "Get Pricing",
  "FAQs",
  "Compare Vendors",
  "Read Reviews",
  "Download Buyer's Guide",
  "Book a Call",
  "See Integrations",
  "View Case Study",
  "Request a Quote",
] as const;

/** "Visitor A1642" — an id, the way an analytics tool labels an unknown one. */
function visitorId(rand: () => number): string {
  const letter = String.fromCharCode(65 + Math.floor(rand() * 26));
  return `Visitor ${letter}${1000 + Math.floor(rand() * 9000)}`;
}

/**
 * Where the session was browsing from.
 *
 * The company's own headquarters where the profile states one, so the panel
 * agrees with Company Information. The profiles record a city and a country
 * with no region between them, which this fills in for the cities the dataset
 * actually uses; anything unrecognised keeps the country in the region's place
 * rather than inventing an administrative division.
 */
const REGIONS: Record<string, string> = {
  Calgary: "Alberta",
  London: "England",
  "Walnut Creek": "California",
  Austin: "Texas",
  Chicago: "Illinois",
  "San Francisco": "California",
  Atlanta: "Georgia",
  Seattle: "Washington",
  "New York": "New York",
  Portland: "Oregon",
  "San Diego": "California",
};

/** Somewhere plausible for a company we hold no headquarters for. */
const FALLBACK_LOCATIONS: readonly ActivityLocation[] = [
  { city: "Denver", region: "Colorado", country: "United States" },
  { city: "Boston", region: "Massachusetts", country: "United States" },
  { city: "Toronto", region: "Ontario", country: "Canada" },
  { city: "Manchester", region: "England", country: "United Kingdom" },
  { city: "Port Harcourt", region: "Rivers State", country: "Nigeria" },
  { city: "Bengaluru", region: "Karnataka", country: "India" },
  { city: "Dublin", region: "Leinster", country: "Ireland" },
];

/**
 * Where a session was browsing from.
 *
 * The most recent one is the company's own headquarters, so the newest session
 * agrees with what Company Information says about them. Earlier sessions come
 * from elsewhere — a second office, someone travelling, a colleague on the
 * evaluation — because a buying decision is rarely one person at one desk, and
 * a stack of sessions all reading the same city tells you nothing.
 */
function locationFor(
  company: string,
  index: number,
  used: Set<string>,
  rand: () => number,
): ActivityLocation {
  const hq = getCompanyProfile(company)?.headquarters ?? "";
  const parts = hq.split(",").map(p => p.trim());
  const hqLocation =
    parts.length === 2 && parts[0] && parts[0] !== "—"
      ? { city: parts[0], region: REGIONS[parts[0]] ?? parts[1], country: parts[1] }
      : null;

  if (index === 0 && hqLocation) return hqLocation;

  /* Anywhere the stack has not already used, so no two sessions on one prospect
     repeat a city. Exhausting the pool falls back to any of it rather than
     failing to place the session at all. */
  const unused = FALLBACK_LOCATIONS.filter(l => l.city !== hqLocation?.city && !used.has(l.city));
  return pick(unused.length ? unused : FALLBACK_LOCATIONS, rand);
}

/* ── time helpers ── */

const two = (n: number) => String(n).padStart(2, "0");

/** "1 min and 20 sec", or "11 sec" under a minute. */
function shortDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (!m) return `${s} sec`;
  return s ? `${m} min and ${s} sec` : `${m} min`;
}

/** "2 minutes, 22 seconds" — the session total, spelled out. */
function longDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m ? `${m} minute${m === 1 ? "" : "s"}` : "";
  const ss = s ? `${s} second${s === 1 ? "" : "s"}` : "";
  return [mm, ss].filter(Boolean).join(", ") || "0 seconds";
}

/**
 * The same span to the nearest whole minute — "10 minutes".
 *
 * What the summary card over the timeline reports. A running total across every
 * session is a sense of how much attention a company has given, and seconds are
 * a precision that reads as noise at that scale; the sessions underneath still
 * carry their exact lengths. Anything under a minute is written as less than one
 * rather than rounded away to nothing.
 */
function roundedDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (!m) return "<1 minute";
  return `${m} minute${m === 1 ? "" : "s"}`;
}

/** A date the dataset's own format, offset back from a prospect's visit. */
function dateMinusDays(date: string, days: number): string {
  const t = Date.parse(date);
  if (Number.isNaN(t)) return date;
  const d = new Date(t);
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function buildSession(
  company: string,
  visitedDate: string,
  daysBack: number,
  index: number,
  usedCities: Set<string>,
  rand: () => number,
): ActivitySession {
  const prospect = PROSPECTS.find(p => p.name === company);
  const category = prospect?.industry ?? "Business";
  const slug = CATEGORY_PATHS[category] ?? "software";

  /* Two to four pages a session — enough to read as a visit, short enough that
     the timeline stays scannable. */
  const pageCount = 2 + Math.floor(rand() * 3);
  const shapes = PAGE_SHAPES.slice().sort(() => rand() - 0.5).slice(0, pageCount);

  let clock = 9 * 60 + Math.floor(rand() * 8 * 60); // somewhere in the working day
  const startMinutes = clock;
  let startSeconds = Math.floor(rand() * 60);

  const pages: ActivityPageVisit[] = shapes.map(shape => {
    const { title, path } = shape(category, slug);
    const seconds = 25 + Math.floor(rand() * 170);
    const at = `${two(Math.floor(clock / 60) % 24)}:${two(clock % 60)}`;
    clock += Math.max(1, Math.round(seconds / 60));

    /* Up to six clicks on a page, and often none — a buyer reads more than
       they press, but a page they are serious about collects a handful, which
       is what the panel folds away behind "show more". */
    const clickCount = Math.max(0, Math.floor(rand() * 8) - 1);
    const clicks: string[] = [];
    while (clicks.length < clickCount) {
      const label = pick(CLICKS, rand);
      if (!clicks.includes(label)) clicks.push(label);
    }

    return { title, url: `https://softwarefinder.com${path}`, duration: shortDuration(seconds), at, clicks };
  });

  const totalSeconds = pages.reduce((sum, p) => {
    const m = /(?:(\d+) min)?\s*(?:(\d+) sec)?/.exec(p.duration);
    return sum + (Number(m?.[1] ?? 0) * 60 + Number(m?.[2] ?? 0));
  }, 0);

  const endMinutes = startMinutes + Math.ceil((startSeconds + totalSeconds) / 60);

  return {
    visitor: visitorId(rand),
    date: dateMinusDays(visitedDate, daysBack),
    startedAt: `${two(Math.floor(startMinutes / 60) % 24)}:${two(startMinutes % 60)}`,
    endedAt: `${two(Math.floor(endMinutes / 60) % 24)}:${two(endMinutes % 60)}`,
    location: locationFor(company, index, usedCities, rand),
    total: longDuration(totalSeconds),
    totalSeconds,
    pages,
  };
}

/**
 * What the three cards over the timeline report.
 *
 * Read off the sessions themselves rather than stored: the first time this
 * company was seen is the start of its oldest session, the last is the end of
 * its newest, and the total is every session added together. So the summary
 * can never disagree with the timeline beneath it.
 */
export function summarise(sessions: ActivitySession[]) {
  if (!sessions.length) return null;
  const newest = sessions[0];
  const oldest = sessions[sessions.length - 1];
  const seconds = sessions.reduce((sum, s) => sum + s.totalSeconds, 0);
  return {
    firstSeen: { date: oldest.date, time: oldest.startedAt },
    lastSeen: { date: newest.date, time: newest.endedAt },
    total: roundedDuration(seconds),
  };
}

/**
 * The sessions a company's Activity tab shows, newest first.
 *
 * Built once per company and cached, so the same prospect reads the same way
 * every time its modal is opened.
 */
const CACHE = new Map<string, ActivitySession[]>();

export function getActivitySessions(company: string): ActivitySession[] {
  const cached = CACHE.get(company);
  if (cached) return cached;

  const prospect = PROSPECTS.find(p => p.name === company);
  const rand = makeRandom(seedFrom(company));
  /* One to three sittings — a prospect that has been back is worth showing as
     having been back. */
  const count = 1 + Math.floor(rand() * 3);
  const visited = prospect?.date ?? "";

  /* Each sitting steps further back than the one before it, accumulated rather
     than multiplied out from the index: `index * random` can hand the third
     session a smaller offset than the second and put it above one that is
     newer. Stepping keeps the stack strictly oldest-last. */
  const sessions: ActivitySession[] = [];
  const usedCities = new Set<string>();
  let daysBack = 0;
  for (let i = 0; i < count; i++) {
    const session = buildSession(company, visited, daysBack, i, usedCities, rand);
    usedCities.add(session.location.city);
    sessions.push(session);
    daysBack += 1 + Math.floor(rand() * 4);
  }

  CACHE.set(company, sessions);
  return sessions;
}
