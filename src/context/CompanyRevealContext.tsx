import { createContext, useContext } from "react";

/**
 * Company-based contact reveals, shared by every surface built on the updated
 * business logic — the seven new reveal experiences, kept apart from
 * `ProspectRevealContext`, which still runs the original per-contact
 * accounting for the preserved "Current" experience.
 *
 * A reveal is spent once per company, however many of its available contacts
 * (up to three) get disclosed by it. `revealedContacts` still tracks the
 * individual contact ids — the same ids `contactId()` already produces — so a
 * contact reads as revealed the same way on every card and inside the modal;
 * `revealedCompanies` is what the reveal action itself checks and spends
 * against.
 */
export type CompanyRevealState = {
  /** Contact ids disclosed by a company-level reveal. */
  revealedContacts: ReadonlySet<string>;
  /** Companies whose reveal has been spent. */
  revealedCompanies: ReadonlySet<string>;
  /**
   * Whether a company's reveal may start. Once the plan's allowance is spent
   * this opens the Buy More modal and returns false. Returns true without
   * spending anything for a company already revealed.
   */
  requestReveal: (companyKey: string) => boolean;
  /** Deducts one company reveal and discloses every contact id passed in. */
  completeReveal: (companyKey: string, contactIds: string[]) => void;
};

const NONE: ReadonlySet<string> = new Set<string>();

const CompanyRevealContext = createContext<CompanyRevealState>({
  revealedContacts: NONE,
  revealedCompanies: NONE,
  requestReveal: () => false,
  completeReveal: () => {},
});

export const CompanyRevealProvider = CompanyRevealContext.Provider;

export function useCompanyReveal(): CompanyRevealState {
  return useContext(CompanyRevealContext);
}

/** The header's company reveal allowance — "used" out of the plan's total. */
export type CompanyRevealAllowance = { used: number; total: number };

const CompanyRevealAllowanceContext = createContext<CompanyRevealAllowance>({ used: 0, total: 100 });

export const CompanyRevealAllowanceProvider = CompanyRevealAllowanceContext.Provider;

export function useCompanyRevealAllowance(): CompanyRevealAllowance {
  return useContext(CompanyRevealAllowanceContext);
}

/** Plan tiers the updated logic ships with — company reveals, not contacts. */
export const COMPANY_REVEAL_PLANS = {
  Starter: 50,
  Growth: 100,
  Enterprise: 200,
} as const;

export type CompanyRevealPlan = keyof typeof COMPANY_REVEAL_PLANS;
