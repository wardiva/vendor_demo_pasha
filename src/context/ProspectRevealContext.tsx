import { createContext, useContext } from "react";

/**
 * Contact reveals, shared by every surface that can disclose one.
 *
 * Reveals are keyed by a stable contact id rather than by a card's position,
 * so the Prospects card and the Prospect Details modal are looking at the same
 * fact about the same person: revealing on either shows as revealed on the
 * other, reopening the modal keeps it revealed, and the second view never
 * charges a second credit.
 */
export type ProspectRevealState = {
  /** Ids of contacts already disclosed. */
  revealed: ReadonlySet<string>;
  /**
   * Whether a reveal may start. Once the allowance is spent this opens the
   * Buy More modal and returns false, leaving the contact locked. Returns true
   * without spending anything for a contact that is already revealed.
   */
  requestReveal: (id: string) => boolean;
  /** Deducts one reveal and unlocks the contact, once the loader has run. */
  completeReveal: (id: string, disclosed?: string) => void;
};

/** "Meridian Supply Co." + "Elena Vasquez" -> "meridian-supply-co:elena-vasquez". */
export function contactId(company: string, contact: string): string {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug(company)}:${slug(contact)}`;
}

const NONE_REVEALED: ReadonlySet<string> = new Set<string>();

/* Without a provider no allowance exists, so nothing reveals — the imported
   page still renders, with every contact section locked. */
const ProspectRevealContext = createContext<ProspectRevealState>({
  revealed: NONE_REVEALED,
  requestReveal: () => false,
  completeReveal: () => {},
});

export const ProspectRevealProvider = ProspectRevealContext.Provider;

export function useProspectReveal(): ProspectRevealState {
  return useContext(ProspectRevealContext);
}
