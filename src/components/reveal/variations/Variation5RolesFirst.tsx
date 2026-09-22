import ContactTag from "@/components/ContactTag";
import MailIcon from "@/components/MailIcon";
import PhoneIcon from "@/components/PhoneIcon";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import {
  ContactPreviewCardLazy,
  CostNote,
  GroupHeading,
  RevealCta,
  RevealedBadge,
  availableLabel,
  revealCountLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 5 — roles first.
 *
 * The frost is dropped. Instead of showing a person and blurring them, this
 * shows the one thing about them that is not for sale — what they do — and
 * withholds the rest outright: the name, the number and the address are drawn
 * as marks, never as blurred text.
 *
 * Two arguments for it. First, a blur is an invitation to squint; a mask is an
 * honest statement that the information is not here yet. Second, and the real
 * reason: the decision a vendor is making is "is this company's buying committee
 * worth a reveal?", and roles answer that question far better than a frosted
 * portrait does. A VP of Procurement, a Director of Operations and a Procurement
 * Manager is a committee worth opening. Three blurred faces are not information.
 *
 * The cost is stated once, for the set, because the set is what is bought.
 */

/** A withheld value: present, clearly not readable, and not a blurred truth. */
function MaskedValue({ width = 84 }: { width?: number }) {
  return (
    <span
      aria-label="Hidden until revealed"
      className="inline-block rounded-[3px] bg-[repeating-linear-gradient(90deg,rgba(47,43,61,0.28)_0_3px,transparent_3px_6px)] h-[6px] align-middle"
      style={{ width }}
    />
  );
}

function SealedRole({ contact, compact }: { contact: ProspectContact; compact: boolean }) {
  return (
    <div
      className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full"
      data-name="Role"
      data-no-row-hover
    >
      {/* The job title, in full and in the ordinary ink — the part of the
          record that helps a vendor decide, and the part that is not for sale. */}
      <p
        className={`[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] min-w-px not-italic overflow-hidden relative shrink text-[#2f2b3d] text-ellipsis whitespace-nowrap ${
          compact ? "text-[12px]" : "text-[13px]"
        }`}
      >
        {contact.jobTitle}
      </p>
      <ContactTag
        variant={contact.variant}
        size={11}
        labelSize={11}
        showLabel={!compact}
        className="shrink-0"
      />
      {/* What arrives with the reveal, drawn as the channels it will fill. */}
      <div className="content-stretch flex gap-[8px] items-center ml-auto shrink-0" data-no-row-hover>
        <PhoneIcon size={13} />
        <MaskedValue width={compact ? 42 : 66} />
        {!compact && (
          <>
            <MailIcon size={13} />
            <MaskedValue width={78} />
          </>
        )}
      </div>
    </div>
  );
}

export default function Variation5RolesFirst({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const modal = layout === "modal";
  const count = contacts.length;
  if (!contacts.length) return null;

  if (flow.revealed) {
    /* Opened, the roles have done their job and the contacts take the space. */
    return (
      <div
        className={`content-stretch flex flex-col gap-[8px] items-start relative shrink-0 ${
          modal ? "w-full" : "w-[310px]"
        }`}
      >
        <RevealedBadge count={count} size={modal ? "md" : "sm"} />
        <div
          className={`content-stretch flex flex-col items-start relative shrink-0 w-full ${
            modal ? "gap-[12px]" : "gap-[8px]"
          }`}
        >
          {(modal ? contacts : contacts.slice(0, 1)).map(contact => (
            <ContactPreviewCardLazy
              key={contact.name}
              contact={contact}
              settled={flow.settled}
              layout={modal ? "modal" : "prospect"}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[rgba(244,242,240,0.6)] content-stretch flex flex-col gap-[8px] items-start px-[12px] py-[10px] relative rounded-[12px] shrink-0 ${
        modal ? "w-full" : "w-[310px]"
      }`}
      data-name="Sealed Roles"
    >
      {modal ? (
        <GroupHeading company={company} count={count} revealed={false} />
      ) : (
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[18px] not-italic shrink-0 text-[#2f2b3d] text-[11px] whitespace-nowrap">
          {availableLabel(count)}
        </p>
      )}

      <div
        className={`content-stretch flex flex-col items-start relative shrink-0 w-full ${
          modal ? "gap-[10px]" : "gap-[6px]"
        }`}
      >
        {contacts.map(contact => (
          <SealedRole key={contact.name} contact={contact} compact={!modal} />
        ))}
      </div>

      <div className="content-stretch flex gap-[10px] items-center justify-between relative shrink-0 w-full">
        <CostNote flow={flow} showRemaining={modal} />
        <RevealCta
          flow={flow}
          count={count}
          label={revealCountLabel(count)}
          tone={modal ? "primary" : "soft"}
          size={modal ? "md" : "sm"}
        />
      </div>
    </div>
  );
}
