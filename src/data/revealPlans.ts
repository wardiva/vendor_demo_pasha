/**
 * Reveal allowances, counted per company.
 *
 * A reveal buys a company's contacts, not a person: whether a company has one
 * contact or the three it can hold at most, disclosing them costs the vendor a
 * single reveal. The plan a vendor is on sets how many companies they may open
 * in a period, which is why the limits below are company counts.
 */

export type PlanTier = "starter" | "growth" | "enterprise";

/** Company reveals a plan includes. */
export const PLAN_LIMITS: Record<PlanTier, number> = {
  starter: 50,
  growth: 100,
  enterprise: 200,
};

export const PLAN_NAMES: Record<PlanTier, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

/** The plan this demo vendor is on. */
export const CURRENT_PLAN: PlanTier = "growth";

/**
 * The most contacts a company can hold.
 *
 * The cap is the reason the reveal reads as one action: three is a set small
 * enough to show in full before it is bought, so nothing is hidden behind a
 * "and others" the vendor has to pay to count.
 */
export const MAX_CONTACTS_PER_COMPANY = 3;

/**
 * Where the demo starts. Well inside the plan, so a reviewer can spend several
 * reveals before meeting the exhausted state — which the prototype bar can also
 * jump straight to.
 */
export const COMPANY_REVEAL_ALLOWANCE = {
  used: 42,
  total: PLAN_LIMITS[CURRENT_PLAN],
};
