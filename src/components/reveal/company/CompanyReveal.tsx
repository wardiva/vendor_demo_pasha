import { useMemo } from "react";
import { useRevealExperience } from "@/context/RevealExperienceContext";
import { getCompanyRevealContacts, companyRevealKey } from "@/data/companyReveal";
import { CompanyRevealCardBlock, CompanyRevealModalBlock } from "./CompanyRevealVariants";

/**
 * Entry points for the company-based reveal experiences.
 *
 * Each reads the active experience off `RevealExperienceContext` itself, so
 * every host — the Prospects/Signals card and the modal's Contacts tab — only
 * has to say which company it is showing; which of the seven concepts is on
 * screen is decided in one place and stays in sync across all of them.
 */

export function CompanyRevealCard({ companyName }: { companyName: string }) {
  const { experience } = useRevealExperience();
  const contacts = useMemo(() => getCompanyRevealContacts(companyName), [companyName]);
  if (experience === "current" || contacts.length === 0) return null;
  return (
    <CompanyRevealCardBlock
      experience={experience}
      companyKey={companyRevealKey(companyName)}
      companyName={companyName}
      contacts={contacts}
    />
  );
}

export function CompanyRevealModal({ companyName }: { companyName: string }) {
  const { experience } = useRevealExperience();
  const contacts = useMemo(() => getCompanyRevealContacts(companyName), [companyName]);
  if (experience === "current" || contacts.length === 0) return null;
  return (
    <CompanyRevealModalBlock
      experience={experience}
      companyKey={companyRevealKey(companyName)}
      companyName={companyName}
      contacts={contacts}
    />
  );
}

/** Whether the active experience is one of the new company-based concepts. */
export function useIsCompanyRevealExperience(): boolean {
  return useRevealExperience().experience !== "current";
}
