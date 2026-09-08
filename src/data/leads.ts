import { SIGNAL_KINDS, type SignalKind } from "@/data/signals";
import { PROSPECTS } from "@/data/prospects";
import type { ContactVariant } from "@/components/ContactTag";

/**
 * Metadata for the seven lead cards on the Leads page.
 *
 * The cards themselves are static markup from the Figma import, so each one is
 * described here by its index and matched against the applied filters — the
 * same approach the Signals page uses for its leads table.
 */

export const LEAD_TYPES = ["Contact", "Company"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

/**
 * Signal options as presented in the Prospects filter panel.
 *
 * Listed in the order the Signals page's summary cards run, so a reader coming
 * from a card finds its option where the card sat. Profile and Pricing are the
 * two page signals those cards report; the other two are unchanged, in name
 * and in what they match.
 */
export const LEAD_SIGNAL_OPTIONS = [
  "Buyers in Market",
  "Profile Signals",
  "Pricing Signals",
  "Competitor",
] as const;
export type LeadSignalOption = (typeof LEAD_SIGNAL_OPTIONS)[number];

export type Lead = {
  /** Index of the matching card in the imported Leads page. */
  index: number;
  name: string;
  type: LeadType;
  signals: Record<SignalKind, boolean>;
};

/**
 * Lead metadata by company, for the filters this page offers.
 *
 * The eight the page shipped with are unchanged. The rest carry the same two
 * fields so the filters reach them too — see `LEADS` below for why that
 * matters.
 */
const LEAD_SEEDS: Record<string, Omit<Lead, "index" | "name">> = {
  "Meridian Supply Co.":      { type: "Company", signals: { profile: true,  pricing: true,  competitor: true  } },
  "Northvane Technologies":   { type: "Contact", signals: { profile: true,  pricing: false, competitor: true  } },
  "Bowline Freight":          { type: "Company", signals: { profile: true,  pricing: true,  competitor: false } },
  "Canopy Health Group":      { type: "Contact", signals: { profile: true,  pricing: false, competitor: true  } },
  "Stratos Analytics":        { type: "Company", signals: { profile: true,  pricing: false, competitor: true  } },
  "Ironclad Construction":    { type: "Contact", signals: { profile: false, pricing: true,  competitor: false } },
  "Summit Ridge Energy":      { type: "Company", signals: { profile: true,  pricing: false, competitor: false } },
  "Pinehurst Media":          { type: "Contact", signals: { profile: true,  pricing: false, competitor: false } },

  /* Added so the eleven prospects from Figma 221:2126 carry the same metadata
     the original eight do. Split between the two lead types and given a mix of
     competitor signals, so both options of each group match something. */
  "Apex Logistics Group":     { type: "Company", signals: { profile: true,  pricing: true,  competitor: true  } },
  "Meridian Health Systems":  { type: "Contact", signals: { profile: true,  pricing: true,  competitor: false } },
  "NovaTech Solutions":       { type: "Company", signals: { profile: true,  pricing: true,  competitor: true  } },
  "Pinnacle Financial Group": { type: "Contact", signals: { profile: false, pricing: true,  competitor: false } },
  "Vanguard Manufacturing":   { type: "Company", signals: { profile: true,  pricing: false, competitor: true  } },
  "Clearview Analytics":      { type: "Contact", signals: { profile: true,  pricing: true,  competitor: true  } },
  "Summit Energy Corp":       { type: "Company", signals: { profile: true,  pricing: false, competitor: false } },
  "Bridgeport Consulting":    { type: "Contact", signals: { profile: false, pricing: true,  competitor: true  } },
  "Hyperion Aerospace":       { type: "Company", signals: { profile: true,  pricing: true,  competitor: false } },
  "Solaris Biotech":          { type: "Contact", signals: { profile: true,  pricing: false, competitor: true  } },
  "Onyx Cybersecurity":       { type: "Company", signals: { profile: true,  pricing: true,  competitor: true  } },
};

/** A prospect with no seed of its own still filters, rather than ignoring the
 *  groups entirely. */
const DEFAULT_LEAD: Omit<Lead, "index" | "name"> = {
  type: "Company",
  signals: { profile: true, pricing: false, competitor: false },
};

/**
 * One lead per prospect, in prospect order.
 *
 * Built from `PROSPECTS` rather than listed separately. The two were written
 * out independently and fell out of step when the dataset grew: this list held
 * eight entries against nineteen prospects, and `leadVisibility` returns one
 * answer per entry — so every prospect past the eighth was read as `undefined`,
 * which is not `false`, and stayed visible no matter which filter was applied.
 * Deriving the list means it cannot be shorter than the data it describes.
 */
export const LEADS: Lead[] = PROSPECTS.map((p, index) => ({
  index,
  name: p.name,
  ...(LEAD_SEEDS[p.name] ?? DEFAULT_LEAD),
}));

export type LeadsFilters = {
  leads: LeadType[];
  signals: LeadSignalOption[];
  /** Verified / Recommended, read off each prospect's own contact. */
  contacts: ContactVariant[];
  /** Intent bands, by label. */
  intent: string[];
  /** Industries, by the label the prospects data uses. */
  industries: string[];
};

export const EMPTY_LEADS_FILTERS: LeadsFilters = {
  leads: [],
  signals: [],
  contacts: [],
  intent: [],
  industries: [],
};

/**
 * The industries the Industry filter offers — read off the prospects
 * themselves, so the list is exactly what the dataset contains and cannot
 * drift from it. Duplicates are collapsed and the dataset's order is kept.
 */
export const INDUSTRY_FILTER_OPTIONS: string[] = [...new Set(PROSPECTS.map(p => p.industry))];

/**
 * The Intent Score bands, which are the ones the Intent tag already colours
 * by — so a prospect's tag and the band it filters into always agree.
 */
export const INTENT_FILTER_OPTIONS: { label: string; min: number; max: number }[] = [
  { label: "30 - 50%", min: 30, max: 50 },
  { label: "51 - 70%", min: 51, max: 70 },
  { label: "71% +", min: 71, max: 100 },
];

/** The options the Contacts filter offers, in the order the panel lists them. */
export const CONTACT_FILTER_OPTIONS: { label: string; value: ContactVariant }[] = [
  { label: "Verified", value: "verified" },
  { label: "Recommended", value: "recommended" },
];

export function countActiveLeadsFilters(f: LeadsFilters): number {
  return (
    (f.leads.length ? 1 : 0) +
    (f.signals.length ? 1 : 0) +
    (f.contacts.length ? 1 : 0) +
    (f.intent.length ? 1 : 0) +
    (f.industries.length ? 1 : 0)
  );
}

export function hasActiveLeadsFilters(f: LeadsFilters): boolean {
  return countActiveLeadsFilters(f) > 0;
}

/**
 * What each Signals option asks of a lead.
 *
 * Every lead on this page is a buyer in market, so that option matches them
 * all — the rule it has always had. Competitor is unchanged too. Profile and
 * Pricing read the signals the lead already carried, which is the same record
 * the Signals page's Profile and Pricing cards are counted from, so arriving
 * here from one of those cards lists the prospects behind the figure it
 * showed.
 */
const SIGNAL_OPTION_TEST: Record<LeadSignalOption, (lead: Lead) => boolean> = {
  "Buyers in Market": () => true,
  "Profile Signals": lead => lead.signals.profile,
  "Pricing Signals": lead => lead.signals.pricing,
  Competitor: lead => lead.signals.competitor,
};

/** AND across groups, OR within a group — same rule as the Signals filters. */
export function leadMatchesFilters(
  lead: Lead,
  f: LeadsFilters,
  /** The prospect's contact type, where it has one. */
  contact?: ContactVariant,
  /** The prospect's intent score. */
  intentPct?: number,
  /** The prospect's industry. */
  industry?: string,
): boolean {
  if (f.leads.length && !f.leads.includes(lead.type)) return false;
  /* A prospect with no identified contact cannot match a contact type, so it
     drops out as soon as this group is in play. */
  if (f.contacts.length && (!contact || !f.contacts.includes(contact))) return false;
  if (f.industries.length && (!industry || !f.industries.includes(industry))) return false;
  if (f.intent.length) {
    const bands = INTENT_FILTER_OPTIONS.filter(o => f.intent.includes(o.label));
    const score = intentPct ?? -1;
    if (!bands.some(b => score >= b.min && score <= b.max)) return false;
  }
  if (f.signals.length) {
    const hit = f.signals.some(option => SIGNAL_OPTION_TEST[option](lead));
    if (!hit) return false;
  }
  return true;
}

/** Visibility for each lead card, in card order. */
export function leadVisibility(f: LeadsFilters): boolean[] {
  const active = hasActiveLeadsFilters(f);
  /* LEADS and PROSPECTS are the same eight companies in the same order, so the
     contact type comes straight off the prospect at this index. */
  return LEADS.map((lead, i) =>
    !active ||
    leadMatchesFilters(
      lead,
      f,
      PROSPECTS[i]?.contact?.variant,
      PROSPECTS[i]?.intentPct,
      PROSPECTS[i]?.industry,
    ),
  );
}

export { SIGNAL_KINDS };
