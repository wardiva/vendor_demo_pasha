import { useState, type MouseEvent } from "react";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import {
  ContactPreviewCardLazy,
  CostNote,
  RevealCta,
  RevealedBadge,
  RoleRow,
  availableLabel,
  revealAllLabel,
  revealedLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 4 — the expandable section.
 *
 * The company's contacts are one collapsible section, headed by the count and
 * opened by a chevron. Nothing about the people is shown until the vendor asks
 * for it, and asking costs nothing — the expand is free, the reveal is the
 * purchase, and the two are plainly different controls.
 *
 * That separation is the point. A vendor scanning a long list is not choosing
 * between contacts; they are choosing which companies deserve a closer look.
 * This gives them a way to look closer — roles, verification, how many — before
 * spending anything, and it keeps the list itself at one line per company while
 * they scan.
 *
 * It is also the variation that survives a fourth contact best: a section can
 * hold a list of any length behind one summary and one price.
 */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className="reveal-chevron shrink-0 block"
      data-open={open}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="#2F2B3D"
        strokeOpacity="0.7"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Variation4Expandable({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const modal = layout === "modal";
  /* The modal has the room to open with the section already expanded; the list
     row does not, and opens closed so the page still scans one line a company. */
  const [open, setOpen] = useState(modal);
  const count = contacts.length;
  if (!contacts.length) return null;

  const toggle = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setOpen(v => !v);
  };

  const summary = (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      className="content-stretch cursor-pointer flex gap-[8px] items-center min-w-px relative shrink text-left"
    >
      <Chevron open={open} />
      <span className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        {flow.revealed ? revealedLabel(count) : availableLabel(count)}
      </span>
      {/* Closed, the section says what opening it will not cost — in the modal,
          which has the room for it. The list row has the chevron alone. */}
      {modal && !open && !flow.revealed && (
        <span className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[18px] not-italic shrink-0 text-[11px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          Preview roles — free
        </span>
      )}
    </button>
  );

  const body = (
    <div className="reveal-collapse w-full" data-open={open}>
      <div>
        <div
          className={`content-stretch flex flex-col items-start relative shrink-0 w-full ${
            flow.revealed ? "gap-[12px] pt-[12px]" : "gap-[10px] pt-[10px]"
          }`}
        >
          {flow.revealed
            ? contacts.map(contact => (
                <ContactPreviewCardLazy
                  key={contact.name}
                  contact={contact}
                  settled={flow.settled}
                  layout={modal ? "modal" : "prospect"}
                />
              ))
            : contacts.map(contact => (
                /* Sealed, the section shows the roles and the verification —
                   what the reveal is worth — and none of the identities. */
                <RoleRow key={contact.name} contact={contact} locked />
              ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-[rgba(244,242,240,0.6)] content-stretch flex flex-col items-start px-[12px] py-[10px] relative rounded-[12px] shrink-0 ${
        modal ? "w-full" : "w-[310px]"
      }`}
      data-name="Contacts Section"
    >
      <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
        {/* The count and, in the modal, the cost beneath it — stacked rather
            than run along one line, which at three contacts and a control
            beside it is more than the panel's width will take. */}
        <div className="content-stretch flex flex-col gap-[1px] items-start min-w-px relative shrink">
          {summary}
          {modal && flow.locked && <CostNote flow={flow} showRemaining className="pl-[20px]" />}
        </div>
        {flow.locked ? (
          <div className="content-stretch flex gap-[8px] items-center shrink-0">
            <RevealCta
              flow={flow}
              count={count}
              label={modal ? revealAllLabel(count) : count === 1 ? "Reveal" : "Reveal all"}
              tone={modal ? "primary" : "soft"}
              size={modal ? "md" : "sm"}
            />
          </div>
        ) : (
          <RevealedBadge count={count} size={modal ? "md" : "sm"} />
        )}
      </div>
      {body}
      {!modal && flow.locked && open && <CostNote flow={flow} className="pt-[8px]" />}
    </div>
  );
}
