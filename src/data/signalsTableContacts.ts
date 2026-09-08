import avatarCaleb from "@/imports/BuyerActivityBuyerIntentStarter/025345fc75e7100f8bef072c3c35641d598f915e.png";
import avatarSophia from "@/imports/BuyerActivityBuyerIntentStarter/cd81baf587a9dd9e1b0dd03b300af6b2dcd43627.png";
import avatarChloe from "@/imports/BuyerActivityBuyerIntentStarter/1d005ad055e5ad711af65c3db30f19057b89ab41.png";
import avatarAmelia from "@/imports/BuyerActivityBuyerIntentStarter/e1316db0d52da017d8dadbb3f046c242e3ae0c06.png";
import type { ContactLead } from "./contactLeads";

/**
 * Contact-level rows of the Signals page "Buyer Intent Leads" table, keyed by
 * their index in ROW_DATA.
 *
 * Name, job title, email, phone and intent score mirror exactly what each row
 * renders, so the Contact Details modal and the row always agree. These rows
 * show their details outright, so none of them is gated behind a reveal.
 */
export const SIGNALS_TABLE_CONTACTS: Record<number, ContactLead> = {
  1: {
    index: 1,
    name: "Caleb Alvarez",
    jobTitle: "Senior Director, Operations",
    company: "Alderwood Logistics",
    email: "caleb.alvarez@alderwood.ca",
    phone: "+1 919-555-5382",
    avatar: avatarCaleb,
    intentPct: 80,
    lockedByDefault: false,
    note: {
      before: "The buyer currently uses ",
      emphasis: "HubSpot",
      after:
        " for pipeline reporting but has outgrown its automation limits as operations have scaled. They have been comparing alternatives across the past quarter and are actively shortlisting a replacement.",
    },
  },
  3: {
    index: 3,
    name: "Sophia Moreau",
    jobTitle: "Chief Product Officer",
    company: "Beacon Learning",
    email: "caleb.alvarez@alderwood.ca",
    phone: "+1 919-555-5382",
    avatar: avatarSophia,
    intentPct: 75,
    lockedByDefault: false,
    note: {
      before: "The buyer currently uses ",
      emphasis: "Granola",
      after:
        " for research capture but wants reporting the whole product org can share. Their pricing-page activity has climbed steadily and they are evaluating a team-wide rollout.",
    },
  },
  5: {
    index: 5,
    name: "Chloe Lindqvist",
    jobTitle: "IT Operations Manager",
    company: "Junction Freight Co",
    email: "caleb.alvarez@alderwood.ca",
    phone: "",
    avatar: avatarChloe,
    intentPct: 52,
    lockedByDefault: false,
    note: {
      before: "The buyer currently uses ",
      emphasis: "VS Code",
      after:
        " across the engineering org and is reviewing tooling that fits the same workflow. They have returned to competitor comparisons several times this month.",
    },
  },
  6: {
    index: 6,
    name: "Amelia Brooks",
    jobTitle: "Systems Administrator",
    company: "Junction Freight Co",
    email: "caleb.alvarez@alderwood.ca",
    phone: "+1 919-555-5382",
    avatar: avatarAmelia,
    intentPct: 50,
    lockedByDefault: false,
    note: {
      before: "The buyer currently uses ",
      emphasis: "HubSpot",
      after:
        " to coordinate account handovers but finds permissions hard to manage at their headcount. They are researching options with stronger role controls.",
    },
  },
};

export function getSignalsTableContact(rowIndex: number): ContactLead | null {
  return SIGNALS_TABLE_CONTACTS[rowIndex] ?? null;
}
