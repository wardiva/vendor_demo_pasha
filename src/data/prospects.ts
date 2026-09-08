import { getCompanyProfile } from "@/data/companies";
import { deriveEmail, derivePhone } from "@/data/contactIdentity";
import { PROSPECT_DAY_OFFSETS, daysAgo, formatVisited } from "@/data/demoDates";
import type { ContactVariant } from "@/components/ContactTag";
import avatarElena from "@/data/assets/avatar-elena.png";
import avatarJames from "@/data/assets/avatar-james.png";
import avatarPriya from "@/data/assets/avatar-priya.png";
import avatarMarcus from "@/data/assets/avatar-marcus.png";
import avatarNadia from "@/data/assets/avatar-nadia.png";
import avatarDaniel from "@/data/assets/avatar-daniel.png";
import avatarTobias from "@/data/assets/avatar-tobias.png";
import avatarRachel from "@/data/assets/avatar-rachel.png";
/* Figma 221:2126 draws all eleven of its contacts on one portrait, so the
   eleven prospects added from it share the single asset the node exports. */
import avatarFigma from "@/data/assets/avatar-figma.png";

/**
 * The prospect cards on the Prospects page (Figma 76:1758).
 *
 * Every prospect is company-level, and the identified contact behind it sits in
 * the card's Contact Reveal panel — blurred until it is revealed. Company
 * details beyond what the card shows come from the company profile, the same
 * record the Prospect Details modal opens.
 */

/** The identified contact behind a company prospect, if there is one. */
export type ProspectContact = {
  avatar: string;
  /* Name and job title sit inside the card's blur until the contact is revealed. */
  name: string;
  jobTitle: string;
  /**
   * Both channels, on every contact.
   *
   * The card and the modal each show a phone and an envelope, so neither can
   * be optional any more. A seed may state either outright; whatever it leaves
   * out is completed from the contact's own name and their company's domain —
   * see `contactIdentity`.
   */
  phone: string;
  email: string;
  /**
   * Which preview the card shows. A prospect with no verified contact falls
   * back to its AI recommended one; a prospect with neither has no panel.
   */
  variant: ContactVariant;
  /**
   * Contacts the dataset ships already disclosed — Figma 221:2275 draws one
   * such card, with no veil and no Reveal Contact control over it. App seeds
   * the revealed set from this, so the card opens disclosed without spending
   * an allowance, and the same person reads as disclosed in the modal.
   */
  revealedByDefault?: boolean;
};

export type Prospect = {
  /**
   * Stable identifier, derived from the company name rather than a position.
   * Surfaces that list prospects in their own order — the Signals table, and
   * anything that filters or sorts — reference this instead of an index, so a
   * reordered list can never resolve to the wrong record.
   */
  id: string;
  /** Position of the card on the page. */
  index: number;
  name: string;
  logo: string;
  domain: string;
  industry: string;
  /** The card derives its 7-pill meter from this score. */
  intentPct: number;
  date: string;
  /** null when the prospect has neither a verified nor a recommended contact. */
  contact: ProspectContact | null;
};

/**
 * A seed states what it knows. `phone` and `email` are optional here and
 * required on the record the page reads: whatever a seed leaves out is filled
 * in below, so no card or modal can be handed a contact with only one channel.
 */
type SeedContact = Omit<ProspectContact, "phone" | "email"> & {
  phone?: string;
  email?: string;
};

type ProspectSeed = {
  company: string;
  industry: string;
  intentPct: number;
  date: string;
  contact: SeedContact | null;
};

const SEEDS: ProspectSeed[] = [
  {
    company: "Meridian Supply Co.", industry: "Manufacturing", intentPct: 80, date: "Jul 18, 2026",
    contact: { avatar: avatarElena, name: "Elena Vasquez", jobTitle: "VP of Procurement", phone: "+1 312-555-4091", variant: "verified" },
  },
  {
    company: "Northvane Technologies", industry: "Cloud Infrastructure", intentPct: 75, date: "Aug 02, 2026",
    contact: { avatar: avatarJames, name: "James Whitfield", jobTitle: "Chief Revenue Officer", phone: "+1 628-555-7320", variant: "verified" },
  },
  {
    company: "Bowline Freight", industry: "Logistics & Shipping", intentPct: 65, date: "Jun 25, 2026",
    contact: { avatar: avatarPriya, name: "Callum Ridley", jobTitle: "Director of Fleet Operations", phone: "+1 704-555-8126", variant: "verified" },
  },
  {
    company: "Canopy Health Group", industry: "Healthcare Services", intentPct: 62, date: "Aug 11, 2026",
    contact: { avatar: avatarMarcus, name: "Marcus Lindgren", jobTitle: "Head of Business Dev", phone: "+1 206-555-9243", variant: "verified" },
  },
  {
    /* AI recommended only — the modal shows no verified section for this one. */
    company: "Stratos Analytics", industry: "Data & Analytics", intentPct: 52, date: "May 30, 2026",
    contact: { avatar: avatarNadia, name: "Nadia Okoro", jobTitle: "Senior Account Executive", phone: "+1 917-555-6158", variant: "recommended" },
  },
  {
    company: "Ironclad Construction", industry: "Construction", intentPct: 50, date: "Jul 03, 2026",
    contact: { avatar: avatarDaniel, name: "Daniel Reeves", jobTitle: "General Manager", phone: "+1 503-555-3402", variant: "verified" },
  },
  {
    company: "Summit Ridge Energy", industry: "Renewable Energy", intentPct: 40, date: "Jul 09, 2026",
    contact: { avatar: avatarTobias, name: "Tobias Engström", jobTitle: "Business Development Manager", phone: "+1 858-555-4637", variant: "verified" },
  },
  {
    company: "Pinehurst Media", industry: "Digital Advertising", intentPct: 32, date: "Aug 21, 2026",
    contact: { avatar: avatarRachel, name: "Rachel Townsend", jobTitle: "Head of Client Strategy", phone: "+1 646-555-2190", variant: "verified" },
  },

  /* ── Added from Figma 221:2126 ──
     Appended to the eight above rather than replacing any of them; no company
     in the node is one the dataset already held. Company, industry, intent
     score, contact, designation and the verified / recommended and disclosed
     states are the node's own, and every one of these contacts is drawn on the
     node's single portrait.

     The node carries no visited year and no phone numbers. The dates take
     the year the rest of the dataset runs in so the Sort control's Date.parse
     still reads them, and the phones — like every contact's email — are
     completed below rather than written out here. */
  {
    company: "Apex Logistics Group", industry: "Supply Chain", intentPct: 85, date: "Aug 01, 2026",
    contact: { avatar: avatarFigma, name: "Carlos Mendez", jobTitle: "Regional Sales Director", variant: "verified" },
  },
  {
    company: "Meridian Health Systems", industry: "Healthcare IT", intentPct: 70, date: "Jul 28, 2026",
    contact: { avatar: avatarFigma, name: "Priya Sharma", jobTitle: "VP of Procurement", variant: "verified" },
  },
  {
    /* 221:2275 — the one card the node draws already disclosed. */
    company: "NovaTech Solutions", industry: "Cloud Infrastructure", intentPct: 91, date: "Jul 30, 2026",
    contact: { avatar: avatarFigma, name: "James Whitfield", jobTitle: "Chief Technology Officer", variant: "verified", revealedByDefault: true },
  },
  {
    /* AI recommended — the node marks this card with the recommended glyph. */
    company: "Pinnacle Financial Group", industry: "Financial Services", intentPct: 68, date: "Aug 02, 2026",
    contact: { avatar: avatarFigma, name: "Sarah Chen", jobTitle: "Head of Partnerships", variant: "recommended" },
  },
  {
    company: "Vanguard Manufacturing", industry: "Industrial IoT", intentPct: 79, date: "Jul 25, 2026",
    contact: { avatar: avatarFigma, name: "Marcus Johnson", jobTitle: "Director of Operations", variant: "verified" },
  },
  {
    company: "Clearview Analytics", industry: "Data & AI", intentPct: 88, date: "Aug 03, 2026",
    contact: { avatar: avatarFigma, name: "Elena Kovacs", jobTitle: "Chief Data Officer", variant: "verified" },
  },
  {
    company: "Summit Energy Corp", industry: "Clean Energy", intentPct: 64, date: "Jul 22, 2026",
    contact: { avatar: avatarFigma, name: "David Park", jobTitle: "VP of Business Dev", variant: "verified" },
  },
  {
    company: "Bridgeport Consulting", industry: "Management Consulting", intentPct: 50, date: "Aug 05, 2026",
    contact: { avatar: avatarFigma, name: "Amara Okafor", jobTitle: "Senior Partner", variant: "verified" },
  },
  {
    company: "Hyperion Aerospace", industry: "Defense & Aerospace", intentPct: 44, date: "Jul 19, 2026",
    contact: { avatar: avatarFigma, name: "Robert Fischer", jobTitle: "Program Director", variant: "verified" },
  },
  {
    company: "Solaris Biotech", industry: "Life Sciences", intentPct: 56, date: "Aug 07, 2026",
    contact: { avatar: avatarFigma, name: "Hannah Reeves", jobTitle: "VP of R&D", variant: "verified" },
  },
  {
    /* The node repeats the company name in this card's industry slot; the
       category the name states is used instead. See the profile in companies. */
    company: "Onyx Cybersecurity", industry: "Cybersecurity", intentPct: 61, date: "Jul 31, 2026",
    contact: { avatar: avatarFigma, name: "Leo Tanaka", jobTitle: "Head of Sales Engineering", variant: "recommended" },
  },
];

/** "Meridian Supply Co." -> "meridian-supply-co". */
const toId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const PROSPECTS: Prospect[] = SEEDS.map((seed, index) => {
  const profile = getCompanyProfile(seed.company);
  const name = profile?.name ?? seed.company;
  return {
    id: toId(name),
    index,
    name: profile?.name ?? seed.company,
    logo: profile?.logo ?? "",
    domain: profile?.website ?? "",
    industry: seed.industry,
    intentPct: seed.intentPct,
    /* Counted back from today rather than the fixed string the seed carries,
       so every preset window the toolbar offers has prospects in it. The
       seed's own date is kept as the fallback for a record with no offset. */
    date: PROSPECT_DAY_OFFSETS[index] === undefined
      ? seed.date
      : formatVisited(daysAgo(PROSPECT_DAY_OFFSETS[index])),
    /* Completed here rather than in each seed: a contact reaches the page with
       both channels whatever the seed stated, and the address is built from
       this person's name and this company's own domain. */
    contact: seed.contact && {
      ...seed.contact,
      phone: seed.contact.phone || derivePhone(`${name}:${seed.contact.name}`),
      email: seed.contact.email || deriveEmail(seed.contact.name, profile?.website ?? ""),
    },
  };
});

/**
 * The full span of the dataset's visited dates, earliest to latest.
 *
 * What the toolbars open on, so the default range covers every prospect there
 * is and nothing is withheld before a filter has been touched. Derived rather
 * than written down: adding a prospect outside today's span widens this on its
 * own instead of quietly falling outside the default view.
 */
export const PROSPECT_DATE_SPAN: { start: Date; end: Date } = (() => {
  const times = PROSPECTS.map(p => Date.parse(p.date)).filter(t => !Number.isNaN(t));
  const now = new Date();
  if (!times.length) return { start: now, end: now };
  const day = (t: number) => {
    const d = new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return { start: day(Math.min(...times)), end: day(Math.max(...times)) };
})();

export function getProspect(index: number): Prospect | null {
  return PROSPECTS[index] ?? null;
}

/** Resolve a prospect by its stable id, whatever order the caller lists them in. */
export function getProspectById(id: string): Prospect | null {
  return PROSPECTS.find(p => p.id === id) ?? null;
}

/**
 * The Prospects page's companies, in card order and each listed once.
 *
 * This is the module's canonical company list: the Signals filter's company
 * selector renders it, so the filter and the Prospects page always name the
 * same set and use the same logos.
 */
export const PROSPECT_COMPANIES: Array<{ name: string; logo: string }> = PROSPECTS.map(p => ({
  name: p.name,
  logo: p.logo,
}));

/** Just the names, for the filter's selection sets and matching. */
export const PROSPECT_COMPANY_NAMES: string[] = PROSPECT_COMPANIES.map(c => c.name);
