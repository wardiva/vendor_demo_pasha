import { getCompanyDetails, type ContactEntry } from "@/data/companyDetails";
import { contactId } from "@/context/ProspectRevealContext";
import type { ContactVariant } from "@/components/ContactTag";

/**
 * Company-based contact reveals — the updated business logic.
 *
 * A reveal is now spent once per company rather than once per contact: a
 * company surfaces up to three available contacts, and revealing any of them
 * discloses all three for a single credit. This module answers only "which
 * contacts does this company make available" — up to one verified contact
 * (the modal's own limit) plus up to two AI-recommended ones, the same three
 * a company can already show in the Contacts tab.
 *
 * A contact's id is the same `contactId(company, name)` the legacy per-contact
 * system already keys by, so a person reads as the same person everywhere —
 * only what spending a reveal on them means has changed.
 */

const MAX_AVAILABLE_CONTACTS = 3;
const MAX_VERIFIED = 1;

export type RevealContact = ContactEntry & {
  id: string;
  variant: ContactVariant;
};

/** Up to three contacts a company makes available, verified first. */
export function getCompanyRevealContacts(company: string): RevealContact[] {
  const { verifiedContacts, recommendedContacts } = getCompanyDetails(company);
  const verified: RevealContact[] = verifiedContacts
    .slice(0, MAX_VERIFIED)
    .map(c => ({ ...c, id: contactId(company, c.name), variant: "verified" }));
  const room = MAX_AVAILABLE_CONTACTS - verified.length;
  const recommended: RevealContact[] = recommendedContacts
    .slice(0, Math.max(room, 0))
    .map(c => ({ ...c, id: contactId(company, c.name), variant: "recommended" }));
  return [...verified, ...recommended];
}

/** A stable per-company key for the reveal balance and the revealed set. */
export function companyRevealKey(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
