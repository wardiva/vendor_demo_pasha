import { useEffect, useRef, useState, type MouseEvent } from "react";
import { companyKey, useCompanyReveal } from "@/context/CompanyRevealContext";
import { REVEAL_DELAY, showButtonLoader } from "@/components/reveal/revealMechanics";
import { fireConfettiFrom } from "@/components/reveal/confetti";

/**
 * The company reveal, run once for every design that offers it.
 *
 * Each variation draws the action differently — a button on the card, a group
 * header, a banner, a footer under a carousel — but what the action *does* is
 * the same in all of them, and it is this: check the allowance, hold the
 * control in its loading state, disclose every contact at the company for one
 * reveal, burst from the control, then let the veil fade.
 *
 * The sequence, its timings and the Buy More fallback are the ones the
 * contact-level reveal already shipped, so nothing about how a reveal feels
 * changes with the counting model. What changes is the unit: one call here
 * opens the whole company.
 */
export type CompanyRevealFlow = {
  /** Every contact at the company is disclosed. */
  revealed: boolean;
  /** True once the fade has finished and the cards are ordinary ones. */
  settled: boolean;
  /** The contacts are still behind the veil. */
  locked: boolean;
  /** A reveal is in flight. */
  pending: boolean;
  /** No reveals left on the plan, and this company is not already open. */
  exhausted: boolean;
  /** Reveals left on the plan. */
  remaining: number;
  /** Attach to the control the burst should launch from. */
  btnRef: React.RefObject<HTMLButtonElement | null>;
  /** Runs the reveal. Safe to call from any control, including twice. */
  reveal: (e?: MouseEvent<HTMLElement>) => void;
};

export function useCompanyRevealFlow(company: string, contactCount: number): CompanyRevealFlow {
  const { revealedCompanies, requestCompanyReveal, completeCompanyReveal, remaining } =
    useCompanyReveal();
  const revealed = revealedCompanies.has(companyKey(company));
  /* Held until the ring and shadow have faded, after which the cards are
     styled like any other settled contact. */
  const [settled, setSettled] = useState(revealed);
  const [pending, setPending] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const timers = useRef<number[]>([]);

  /* Filters can hide a card and the modal can close mid-reveal, so nothing
     lands after unmount. */
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* A company revealed from another surface while this one was on screen —
     the modal opened over its card, the table row behind the modal — arrives
     here as a state change rather than as this flow's own reveal, so it has
     no fade to wait for and is settled at once. */
  useEffect(() => {
    if (revealed && !inFlight.current) setSettled(true);
  }, [revealed]);

  const reveal = (e?: MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    if (inFlight.current || revealed || contactCount === 0) return;
    /* Out of allowance — this opens the Buy More flow and leaves it sealed. */
    if (!requestCompanyReveal(company)) return;
    inFlight.current = true;
    setPending(true);

    const btn = btnRef.current;
    /* Controls that carry the eye mark swap it for the spinner in place;
       the rest read `pending` and say so in their own words. */
    const restore = btn ? showButtonLoader(btn) : () => {};

    timers.current.push(
      window.setTimeout(() => {
        inFlight.current = false;
        setPending(false);
        restore();
        /* Measured while the control is still on screen, so the burst launches
           from the control rather than from the card. */
        const origin = btn?.getBoundingClientRect();
        if (origin) fireConfettiFrom(origin);
        completeCompanyReveal(company, contactCount);
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  return {
    revealed,
    settled,
    locked: !revealed,
    pending,
    exhausted: !revealed && remaining <= 0,
    remaining,
    btnRef,
    reveal,
  };
}
