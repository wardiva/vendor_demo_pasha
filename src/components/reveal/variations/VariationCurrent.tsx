import { useEffect, useRef, useState, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import RevealContactButton from "@/components/reveal/RevealContactButton";
import { REVEAL_DELAY, showButtonLoader } from "@/components/reveal/revealMechanics";
import { fireConfettiFrom } from "@/components/reveal/confetti";
import { contactId, useProspectReveal } from "@/context/ProspectRevealContext";
import type { ProspectContact } from "@/data/prospects";
import type { RevealPanelProps } from "./parts";

/**
 * The implementation that shipped before reveals were counted per company.
 *
 * Kept whole and kept working, so the change can be judged against the thing it
 * replaces rather than against a description of it. It is the only variation
 * still running on the contact-keyed reveal state and the contact-counted
 * allowance: one contact per card, one reveal per contact, and a company whose
 * three people are all wanted costs three.
 *
 * Nothing here is new. The markup, the classes, the 850ms loader, the burst and
 * the Figma offsets are the ones the prospect card carried; they have only moved
 * file, so this panel and the concepts beside it can be swapped at runtime.
 */
function LegacyContactSection({ company, contact }: { company: string; contact: ProspectContact }) {
  const { revealed, requestReveal, completeReveal } = useProspectReveal();
  /* Keyed by the contact, not the card, so the modal's copy of this person
     reads the same revealed state. */
  const id = contactId(company, contact.name);
  const isRevealed = revealed.has(id);
  const [settled, setSettled] = useState(isRevealed);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);
  const locked = !isRevealed;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleReveal = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pending.current || isRevealed) return;
    /* Out of allowance — this opens the Buy More flow and leaves it locked. */
    if (!requestReveal(id)) return;
    pending.current = true;

    const btn = btnRef.current;
    const restore = btn ? showButtonLoader(btn) : () => {};

    timers.current.push(
      window.setTimeout(() => {
        pending.current = false;
        restore();
        const origin = btn?.getBoundingClientRect();
        if (origin) fireConfettiFrom(origin);
        completeReveal(id, contact.phone);
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  return (
    <ContactPreviewCard
      variant={contact.variant}
      avatar={contact.avatar}
      name={contact.name}
      jobTitle={contact.jobTitle}
      phone={contact.phone}
      email={contact.email}
      locked={locked}
      settled={settled}
      className="w-[310px]"
      reveal={
        locked ? (
          /* 219:1041 centres the control on the panel in both axes, half a
             pixel left and half a pixel down, which is the design's own
             rounding of a 111x26 button inside a 310x59 card. */
          <RevealContactButton
            ref={btnRef}
            onClick={handleReveal}
            variant="label-sm"
            className="absolute left-[calc(50%-0.5px)] top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 z-[3]"
          />
        ) : undefined
      }
    />
  );
}

export default function VariationCurrent({ company, contacts }: RevealPanelProps) {
  /* The card previewed one contact and knew nothing of the rest. */
  const contact = contacts[0];
  if (!contact) return null;
  return <LegacyContactSection company={company} contact={contact} />;
}
