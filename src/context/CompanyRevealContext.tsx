import { createContext, useContext } from "react";

/**
 * Company reveals, shared by every surface that can disclose contacts.
 *
 * Reveals are keyed by company rather than by contact: opening a company
 * discloses every contact it holds — one, two or three — and spends exactly one
 * reveal. So the prospect card, the table row and the Prospect Details modal are
 * all looking at the same fact about the same company, and a vendor who reveals
 * on the card and then opens the modal is never charged again for the people
 * they have already bought.
 */
export type CompanyRevealState = {
  /** Keys of companies whose contacts are disclosed. */
  revealedCompanies: ReadonlySet<string>;
  /**
   * Whether a reveal may start. Out of allowance this opens the Buy More flow
   * and returns false, leaving the company sealed. A company already revealed
   * returns true without spending anything.
   */
  requestCompanyReveal: (company: string) => boolean;
  /** Spends one reveal and discloses every contact at the company. */
  completeCompanyReveal: (company: string, contactCount: number) => void;
  /** Reveals left on the plan. Zero is the exhausted state the cards render. */
  remaining: number;
};

/** "Meridian Supply Co." -> "meridian-supply-co". */
export function companyKey(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const NONE_REVEALED: ReadonlySet<string> = new Set<string>();

/* Without a provider no allowance exists, so nothing reveals — every surface
   still renders, with its contacts sealed. */
const CompanyRevealContext = createContext<CompanyRevealState>({
  revealedCompanies: NONE_REVEALED,
  requestCompanyReveal: () => false,
  completeCompanyReveal: () => {},
  remaining: 0,
});

export const CompanyRevealProvider = CompanyRevealContext.Provider;

export function useCompanyReveal(): CompanyRevealState {
  return useContext(CompanyRevealContext);
}

/** Whether this company's contacts are disclosed. */
export function useIsCompanyRevealed(company: string): boolean {
  const { revealedCompanies } = useCompanyReveal();
  return revealedCompanies.has(companyKey(company));
}
