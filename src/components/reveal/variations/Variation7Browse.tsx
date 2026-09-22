import { useState, type MouseEvent } from "react";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import {
  ContactPreviewCardLazy,
  CostNote,
  RevealCta,
  RevealedBadge,
  availableLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 7 — browse, then unlock.
 *
 * One contact on screen at a time, with a control for stepping between them,
 * and a single unlock underneath that opens all of them at once.
 *
 * The idea is to make the group navigable in a space that only fits one person.
 * A list row has 310 pixels; three cards do not go in it, but three *tabs* do —
 * so the vendor can look through the whole committee, role by role, without
 * leaving the list or spending anything. The unlock stays put beneath them
 * while they browse, so the price never attaches itself to whichever contact
 * happens to be on screen.
 *
 * It is the only concept here that keeps earning after the reveal: the same
 * stepper becomes the way to read all three contacts from the list row, which
 * no other variation can do without growing the row to three cards tall.
 */
export default function Variation7Browse({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const [active, setActive] = useState(0);
  const modal = layout === "modal";
  const count = contacts.length;
  if (!contacts.length) return null;

  const current = contacts[Math.min(active, count - 1)];
  const many = count > 1;

  const stepper = many && (
    <div
      role="tablist"
      aria-label={`Contacts at ${company}`}
      className="content-stretch flex gap-[2px] items-center shrink-0 bg-[rgba(47,43,61,0.06)] p-[2px] rounded-[7px]"
    >
      {contacts.map((contact, i) => {
        const on = i === Math.min(active, count - 1);
        return (
          <button
            key={contact.name}
            type="button"
            role="tab"
            aria-selected={on}
            /* Browsing is free and must never be mistaken for buying, so the
               step is stopped here and reaches neither the reveal nor the row
               click that opens the modal. */
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setActive(i);
            }}
            title={contact.jobTitle}
            className={`cursor-pointer font-['Inter',sans-serif] leading-[18px] px-[8px] rounded-[5px] text-[11px] transition-colors ${
              on
                ? "bg-white font-medium text-[#072929] shadow-[0px_1px_2px_0px_rgba(47,43,61,0.12)]"
                : "font-normal text-[rgba(47,43,61,0.7)] hover:text-[#2f2b3d]"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={`content-stretch flex flex-col gap-[6px] items-start relative shrink-0 ${
        modal ? "w-full" : "w-[310px]"
      }`}
      data-name="Contact Browser"
    >
      {/* What is being looked through, and where in it the vendor is. */}
      <div className="content-stretch flex gap-[8px] items-center justify-between relative shrink-0 w-full">
        {flow.revealed ? (
          <RevealedBadge count={count} size={modal ? "md" : "sm"} />
        ) : (
          <p
            className={`[word-break:break-word] font-['Inter',sans-serif] font-medium not-italic shrink-0 text-[#2f2b3d] whitespace-nowrap ${
              modal ? "text-[13px] leading-[20px]" : "text-[11px] leading-[18px]"
            }`}
          >
            {availableLabel(count)}
          </p>
        )}
        {stepper}
      </div>

      {/* The one contact on screen. It carries no control of its own: the
          unlock below covers every contact in the stepper, including the ones
          not currently shown. */}
      <ContactPreviewCardLazy
        contact={current}
        locked={flow.locked}
        settled={flow.settled}
        onRevealRequest={flow.reveal}
        layout={modal ? "modal" : "prospect"}
      />

      {flow.locked && (
        <div className="content-stretch flex gap-[10px] items-center justify-between relative shrink-0 w-full">
          <CostNote flow={flow} showRemaining={modal} />
          <RevealCta
            flow={flow}
            count={count}
            label={many ? `Unlock all ${count} contacts` : "Unlock contact"}
            tone={modal ? "primary" : "soft"}
            size={modal ? "md" : "sm"}
          />
        </div>
      )}
    </div>
  );
}
