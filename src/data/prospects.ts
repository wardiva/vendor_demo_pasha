import { getCompanyProfile } from "@/data/companies";
import { deriveEmail, derivePhone } from "@/data/contactIdentity";
import { PROSPECT_DAY_OFFSETS, daysAgo, formatVisited } from "@/data/demoDates";
import { MAX_CONTACTS_PER_COMPANY } from "@/data/revealPlans";
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
  /**
   * The company's headquarters, as Company Information states it —
   * "Chicago, United States". Empty for a company whose profile holds no
   * location, so the Location filter can tell "unknown" from a place.
   */
  location: string;
  /** The card derives its 7-pill meter from this score. */
  intentPct: number;
  date: string;
  /**
   * The contact the card previews — the first of `contacts`, and null when the
   * company has none. Kept alongside the list so the surfaces that preview a
   * single person (the table's CONTACT DETAILS column) still have one to name.
   */
  contact: ProspectContact | null;
  /**
   * Every contact identified at the company, up to the three it can hold.
   *
   * Reveals are company-level: these are disclosed together, for one reveal,
   * however many of them there are. The list is the same one the Prospect
   * Details modal lists, so what a card promises is what the modal opens.
   */
  contacts: ProspectContact[];
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
  /**
   * The rest of the company's contacts, after the one the card previews.
   *
   * A company holds three at most, so a seed states none, one or two here. They
   * are disclosed with the contact above them rather than separately: the
   * reveal is the company's, and this is the rest of what it buys.
   */
  alsoAt?: SeedContact[];
};

const SEEDS: ProspectSeed[] = [
  {
    company: "Meridian Supply Co.", industry: "Manufacturing", intentPct: 90, date: "Jul 18, 2026",
    contact: { avatar: avatarElena, name: "Elena Vasquez", jobTitle: "VP of Procurement", phone: "+1 312-555-4091", variant: "verified" },
    alsoAt: [
      { avatar: avatarDaniel, name: "Owen Brady", jobTitle: "Director of Operations", variant: "recommended" },
      { avatar: avatarPriya, name: "Hana Lin", jobTitle: "Procurement Manager", variant: "recommended" },
    ],
  },
  {
    company: "Northvane Technologies", industry: "Cloud Infrastructure", intentPct: 57, date: "Aug 02, 2026",
    contact: { avatar: avatarJames, name: "James Whitfield", jobTitle: "Chief Revenue Officer", phone: "+1 628-555-7320", variant: "verified" },
    alsoAt: [
      { avatar: avatarNadia, name: "Sonia Patel", jobTitle: "VP of Engineering", variant: "recommended" },
    ],
  },
  {
    company: "Bowline Freight", industry: "Logistics & Shipping", intentPct: 54, date: "Jun 25, 2026",
    contact: { avatar: avatarPriya, name: "Callum Ridley", jobTitle: "Director of Fleet Operations", phone: "+1 704-555-8126", variant: "verified" },
    alsoAt: [
      { avatar: avatarRachel, name: "Greta Olsen", jobTitle: "Head of Logistics", variant: "recommended" },
      { avatar: avatarTobias, name: "Marco Vidal", jobTitle: "Operations Manager", variant: "recommended" },
    ],
  },
  {
    /* One contact and no more — what a card, a modal and a reveal control all
       have to read correctly when the company holds a single person. */
    company: "Canopy Health Group", industry: "Healthcare Services", intentPct: 64, date: "Aug 11, 2026",
    contact: { avatar: avatarMarcus, name: "Marcus Lindgren", jobTitle: "Head of Business Dev", phone: "+1 206-555-9243", variant: "verified" },
  },
  {
    /* AI recommended only — the modal shows no verified section for this one. */
    company: "Stratos Analytics", industry: "Data & Analytics", intentPct: 61, date: "May 30, 2026",
    contact: { avatar: avatarNadia, name: "Nadia Okoro", jobTitle: "Senior Account Executive", phone: "+1 917-555-6158", variant: "recommended" },
    alsoAt: [
      { avatar: avatarJames, name: "Theo Bright", jobTitle: "Director of Data Platform", variant: "recommended" },
    ],
  },
  {
    company: "Ironclad Construction", industry: "Construction", intentPct: 54, date: "Jul 03, 2026",
    contact: { avatar: avatarDaniel, name: "Daniel Reeves", jobTitle: "General Manager", phone: "+1 503-555-3402", variant: "verified" },
    alsoAt: [
      { avatar: avatarElena, name: "Wanda Cole", jobTitle: "Procurement Director", variant: "recommended" },
      { avatar: avatarMarcus, name: "Sam Ortiz", jobTitle: "Project Executive", variant: "recommended" },
    ],
  },
  {
    company: "Summit Ridge Energy", industry: "Renewable Energy", intentPct: 90, date: "Jul 09, 2026",
    contact: { avatar: avatarTobias, name: "Tobias Engström", jobTitle: "Business Development Manager", phone: "+1 858-555-4637", variant: "verified" },
    alsoAt: [
      { avatar: avatarNadia, name: "Ingrid Solberg", jobTitle: "Head of Grid Strategy", variant: "recommended" },
    ],
  },
  {
    company: "Pinehurst Media", industry: "Digital Advertising", intentPct: 81, date: "Aug 21, 2026",
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
    company: "Apex Logistics Group", industry: "Supply Chain", intentPct: 86, date: "Aug 01, 2026",
    contact: { avatar: avatarFigma, name: "Carlos Mendez", jobTitle: "Regional Sales Director", variant: "verified" },
    alsoAt: [
      { avatar: avatarElena, name: "Renata Diaz", jobTitle: "VP of Supply Chain", variant: "recommended" },
      { avatar: avatarDaniel, name: "Paul Osei", jobTitle: "Fleet Director", variant: "recommended" },
    ],
  },
  {
    company: "Meridian Health Systems", industry: "Healthcare IT", intentPct: 57, date: "Jul 28, 2026",
    contact: { avatar: avatarFigma, name: "Priya Sharma", jobTitle: "VP of Procurement", variant: "verified" },
    alsoAt: [
      { avatar: avatarJames, name: "Alan Whitaker", jobTitle: "Chief Information Officer", variant: "recommended" },
    ],
  },
  {
    /* 221:2275 — the one card the node draws already disclosed. Company-level
       now, so every contact it holds opens with it. */
    company: "NovaTech Solutions", industry: "Cloud Infrastructure", intentPct: 61, date: "Jul 30, 2026",
    contact: { avatar: avatarFigma, name: "James Whitfield", jobTitle: "Chief Technology Officer", variant: "verified", revealedByDefault: true },
    alsoAt: [
      { avatar: avatarPriya, name: "Dana Cho", jobTitle: "Head of Platform", variant: "recommended", revealedByDefault: true },
    ],
  },
  {
    /* AI recommended — the node marks this card with the recommended glyph. */
    company: "Pinnacle Financial Group", industry: "Financial Services", intentPct: 86, date: "Aug 02, 2026",
    contact: { avatar: avatarFigma, name: "Sarah Chen", jobTitle: "Head of Partnerships", variant: "recommended" },
    alsoAt: [
      { avatar: avatarTobias, name: "Victor Hale", jobTitle: "Director of Partnerships", variant: "recommended" },
    ],
  },
  {
    company: "Vanguard Manufacturing", industry: "Industrial IoT", intentPct: 90, date: "Jul 25, 2026",
    contact: { avatar: avatarFigma, name: "Marcus Johnson", jobTitle: "Director of Operations", variant: "verified" },
    alsoAt: [
      { avatar: avatarRachel, name: "Lena Fischer", jobTitle: "Plant Operations Lead", variant: "recommended" },
      { avatar: avatarMarcus, name: "Ray Kimura", jobTitle: "Head of Industrial IoT", variant: "recommended" },
    ],
  },
  {
    company: "Clearview Analytics", industry: "Data & AI", intentPct: 61, date: "Aug 03, 2026",
    contact: { avatar: avatarFigma, name: "Elena Kovacs", jobTitle: "Chief Data Officer", variant: "verified" },
    alsoAt: [
      { avatar: avatarJames, name: "Noah Bennett", jobTitle: "VP of Analytics", variant: "recommended" },
    ],
  },
  {
    company: "Summit Energy Corp", industry: "Clean Energy", intentPct: 81, date: "Jul 22, 2026",
    contact: { avatar: avatarFigma, name: "David Park", jobTitle: "VP of Business Dev", variant: "verified" },
  },
  {
    company: "Bridgeport Consulting", industry: "Management Consulting", intentPct: 57, date: "Aug 05, 2026",
    contact: { avatar: avatarFigma, name: "Amara Okafor", jobTitle: "Senior Partner", variant: "verified" },
    alsoAt: [
      { avatar: avatarNadia, name: "Grace Lim", jobTitle: "Engagement Director", variant: "recommended" },
    ],
  },
  {
    company: "Hyperion Aerospace", industry: "Defense & Aerospace", intentPct: 86, date: "Jul 19, 2026",
    contact: { avatar: avatarFigma, name: "Robert Fischer", jobTitle: "Program Director", variant: "verified" },
    alsoAt: [
      { avatar: avatarElena, name: "Iris Navarro", jobTitle: "Head of Procurement", variant: "recommended" },
      { avatar: avatarTobias, name: "Tom Haley", jobTitle: "Systems Program Manager", variant: "recommended" },
    ],
  },
  {
    company: "Solaris Biotech", industry: "Life Sciences", intentPct: 95, date: "Aug 07, 2026",
    contact: { avatar: avatarFigma, name: "Hannah Reeves", jobTitle: "VP of R&D", variant: "verified" },
    alsoAt: [
      { avatar: avatarDaniel, name: "Felix Moreau", jobTitle: "Director of Clinical Ops", variant: "recommended" },
    ],
  },
  {
    /* The node repeats the company name in this card's industry slot; the
       category the name states is used instead. See the profile in companies. */
    company: "Onyx Cybersecurity", industry: "Cybersecurity", intentPct: 64, date: "Jul 31, 2026",
    contact: { avatar: avatarFigma, name: "Leo Tanaka", jobTitle: "Head of Sales Engineering", variant: "recommended" },
    alsoAt: [
      { avatar: avatarNadia, name: "Dana Whitlock", jobTitle: "Director of Security Operations", variant: "verified" },
      { avatar: avatarRachel, name: "Miriam Kaur", jobTitle: "Principal Security Architect", variant: "recommended" },
    ],
  },
];

/** "Meridian Supply Co." -> "meridian-supply-co". */
const toId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const PROSPECTS: Prospect[] = SEEDS.map((seed, index) => {
  const profile = getCompanyProfile(seed.company);
  const name = profile?.name ?? seed.company;
  /* Completed here rather than in each seed: a contact reaches the page with
     both channels whatever the seed stated, and the address is built from this
     person's name and this company's own domain. */
  const complete = (c: SeedContact): ProspectContact => ({
    ...c,
    phone: c.phone || derivePhone(`${name}:${c.name}`),
    email: c.email || deriveEmail(c.name, profile?.website ?? ""),
  });
  /* The previewed contact first, then the rest, capped at what a company can
     hold — one reveal buys this list and nothing beyond it. */
  const contacts = [seed.contact, ...(seed.alsoAt ?? [])]
    .filter((c): c is SeedContact => c !== null)
    .slice(0, MAX_CONTACTS_PER_COMPANY)
    .map(complete);
  return {
    id: toId(name),
    index,
    name: profile?.name ?? seed.company,
    logo: profile?.logo ?? "",
    domain: profile?.website ?? "",
    industry: seed.industry,
    /* The profile writes an unknown headquarters as "—" so its table row is
       never blank; here that is no location at all. */
    location: profile && profile.headquarters !== "—" ? profile.headquarters : "",
    intentPct: seed.intentPct,
    /* Counted back from today rather than the fixed string the seed carries,
       so every preset window the toolbar offers has prospects in it. The
       seed's own date is kept as the fallback for a record with no offset. */
    date: PROSPECT_DAY_OFFSETS[index] === undefined
      ? seed.date
      : formatVisited(daysAgo(PROSPECT_DAY_OFFSETS[index])),
    contact: contacts[0] ?? null,
    contacts,
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

const BY_COMPANY = new Map(PROSPECTS.map(p => [p.name, p]));

/**
 * Every contact at a company, in the order its surfaces list them.
 *
 * One answer for the card, the table row and the modal. Reveals are
 * company-level, so the count a card promises — "3 contacts available" — has to
 * be the count the modal opens and the count one reveal pays for; reading them
 * from the same record is what guarantees it.
 */
export function getCompanyContacts(company: string): ProspectContact[] {
  return BY_COMPANY.get(company)?.contacts ?? [];
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
