import avatarJaylon from "@/imports/BuyerActivityLeads/ffebdcde90720141416a1da9597aec20a03c136b.png";
import avatarKadin from "@/imports/BuyerActivityLeads/b73fe3d0390fdfead34e26dcf9c85a169c8ae528.png";
import avatarJaydon from "@/imports/BuyerActivityLeads/c2d54489d822cc73ac687f9cb20a3c817ba0ead4.png";

/**
 * Contact-level leads on the Leads page, keyed by their card index.
 *
 * Cards are static markup from the Figma import, so each contact card is
 * described here and matched by position — the same approach the company
 * cards use.
 */
export type ContactLead = {
  /** Index of the matching card in the imported Leads page. */
  index: number;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  intentPct: number;
  /** Notes panel copy; the emphasised span is the tool they use today. */
  note: { before: string; emphasis: string; after: string };
  /** Whether the card starts locked behind the reveal overlay. */
  lockedByDefault: boolean;
};

/* Copy from the Figma design (node 33:1992). */
const NOTE_JIRA: ContactLead["note"] = {
  before: "The buyer currently uses ",
  emphasis: "Jira",
  after:
    " but is facing challenges with reporting and workflow complexity. They are researching other project management tools and showing strong intent to switch to a solution that better fits their needs.",
};

export const CONTACT_LEADS: ContactLead[] = [
  {
    index: 0, name: "Jaylon Siphron", jobTitle: "Senior Director, Operations",
    company: "Brown and Caldwell", email: "jaylon.siphron@brownandcaldwell.com",
    phone: "+1 919-555-8247", avatar: avatarJaylon, intentPct: 75, lockedByDefault: true,
    note: NOTE_JIRA,
  },
  {
    index: 1, name: "Jaylon Siphron", jobTitle: "Senior Director, Operations",
    company: "Brown and Caldwell", email: "jaylon.siphron@brownandcaldwell.com",
    phone: "+1 919-555-8247", avatar: avatarJaylon, intentPct: 75, lockedByDefault: true,
    note: NOTE_JIRA,
  },
  {
    index: 4, name: "Kadin Dorwart", jobTitle: "Senior Director, Operations",
    company: "Brown and Caldwell", email: "jesse@verticacp.com",
    phone: "+1 919-555-8247", avatar: avatarKadin, intentPct: 52, lockedByDefault: true,
    note: {
      before: "The buyer currently uses ",
      emphasis: "Asana",
      after:
        " but is finding it hard to keep cross-team reporting in one place. They have been comparing alternatives over the past month and are actively shortlisting a replacement.",
    },
  },
  {
    index: 5, name: "Jaydon Gouse", jobTitle: "Senior Director, Operations",
    company: "Brown and Caldwell", email: "jaydon.gouse@brownandcaldwell.com",
    phone: "+1 919-555-8247", avatar: avatarJaydon, intentPct: 75, lockedByDefault: true,
    note: {
      before: "The buyer currently uses ",
      emphasis: "Trello",
      after:
        " and has outgrown it as their operations team has scaled. They are evaluating tools with stronger automation and permissions, and their research activity has increased sharply this quarter.",
    },
  },
];

const BY_INDEX = new Map(CONTACT_LEADS.map(c => [c.index, c]));

export function getContactLead(cardIndex: number): ContactLead | null {
  return BY_INDEX.get(cardIndex) ?? null;
}

/** Card indices that begin locked and need a reveal before opening. */
export const LOCKED_CONTACT_INDICES = CONTACT_LEADS.filter(c => c.lockedByDefault).map(c => c.index);

/** Contact reveal allowance shown in the Leads page header. */
export const REVEAL_ALLOWANCE = { used: 196, total: 200 };
