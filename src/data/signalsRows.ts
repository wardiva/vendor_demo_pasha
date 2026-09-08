import { PROSPECTS } from "@/data/prospects";
import type { ContactVariant } from "@/components/ContactTag";

/**
 * Rows of the prospects table (Figma 98:2769), and the prospects the Signals
 * page's own section lists.
 *
 * One row per prospect, built from the Prospects page's own dataset — same
 * company record, logo, domain, industry, date, intent score and contact — so
 * the two surfaces can never disagree about a company.
 *
 * Presentation only. The rows carry no account facets and no matcher: the
 * Signals page's filters narrow the accounts its metrics and charts are
 * aggregated from, and the prospects section is not one of those surfaces. It
 * lists the same companies whatever is selected above it, so there is nothing
 * here for a filter to read. The Prospects page still filters its own list,
 * through its own model in `leads` — see `ProspectsTable`, which takes the
 * visibility it renders from the page that owns it.
 */

export type SignalRow = {
  /** The prospect's stable id — what a row click resolves through. */
  id: string;
  /** Position among the table's data rows, and into the prospect list. */
  index: number;
  /** Company shown in the BUYER column. */
  company: string;
  logo: string;
  domain: string;
  industry: string;
  visited: string;
  intentPct: number;
  /** The contact shown in the CONTACT DETAILS, PHONE and STATUS columns. */
  contact: {
    avatar: string;
    name: string;
    jobTitle: string;
    phone: string;
    variant: ContactVariant;
  } | null;
};

export const SIGNAL_ROWS: SignalRow[] = PROSPECTS.map(p => ({
  id: p.id,
  index: p.index,
  company: p.name,
  logo: p.logo,
  domain: p.domain,
  industry: p.industry,
  visited: p.date,
  intentPct: p.intentPct,
  contact: p.contact
    ? {
        avatar: p.contact.avatar,
        name: p.contact.name,
        jobTitle: p.contact.jobTitle,
        phone: p.contact.phone,
        variant: p.contact.variant,
      }
    : null,
}));

/** Row height from the design, used to hold the table's size in its empty state. */
export const SIGNAL_ROW_HEIGHT = 66;
