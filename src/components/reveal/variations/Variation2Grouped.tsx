import ContactTag from "@/components/ContactTag";
import CopyableValue from "@/components/CopyableValue";
import LinkedInMark from "@/components/LinkedInMark";
import MailIcon from "@/components/MailIcon";
import PhoneIcon from "@/components/PhoneIcon";
import avatarUnrevealed from "@/components/contacts/assets/avatar-unrevealed.svg";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import {
  AvatarStack,
  CostNote,
  RevealCta,
  RevealedCardState,
  RevealedBadge,
  availableLabel,
  revealAllLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 2 — grouped contacts.
 *
 * One card, one veil, one price. The company's people are not three cards that
 * happen to unlock together; they are a single object — a contact group — with
 * the company's name on it and one control that opens it.
 *
 * What that buys, as UX: the frost runs across the whole group rather than
 * around each person, so there is no visual unit smaller than the group for the
 * eye to price. A vendor cannot look at this and wonder what one of them costs,
 * because one of them is not a thing the interface offers.
 *
 * The header stays sharp above the veil and carries the whole transaction: how
 * many people are in the group, and that opening it uses one reveal. The rows
 * beneath show how many there are and what each one does, which is what makes
 * the group worth judging before it is bought.
 */

/** A contact as the group lists them: one row of the block being bought. */
function GroupRow({ contact, locked }: { contact: ProspectContact; locked: boolean }) {
  return (
    <div
      className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full"
      data-name="Row"
      data-no-row-hover
    >
      <span className="relative block rounded-[100px] shrink-0 size-[32px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
          src={locked ? avatarUnrevealed : contact.avatar}
        />
      </span>

      <div className="content-stretch flex flex-[1_0_0] flex-col gap-px items-start min-w-px relative">
        <div className="content-stretch flex gap-[4px] items-center max-w-full relative shrink-0">
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] overflow-hidden relative shrink text-[#2f2b3d] text-[13px] text-ellipsis whitespace-nowrap">
            {contact.name}
          </p>
          <LinkedInMark size={14} />
        </div>
        <div className="content-stretch flex gap-[12px] items-center max-w-full min-w-px relative shrink-0 w-full">
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[19px] not-italic overflow-hidden relative shrink text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
            {contact.jobTitle}
          </p>
          {/* The channels are marks while the group is sealed and values once
              it is open — the same withholding every contact card in the
              product does, applied to the row. */}
          <div className="content-stretch flex gap-[10px] items-center min-w-px relative shrink" data-no-row-hover>
            {locked ? (
              <>
                <PhoneIcon size={14} />
                <MailIcon size={14} />
              </>
            ) : (
              <>
                <CopyableValue
                  value={contact.phone}
                  className="lead-copy-inline content-stretch flex gap-[4px] items-center relative shrink-0"
                >
                  <PhoneIcon size={14} />
                  <p className="font-['Inter',sans-serif] font-normal leading-[19px] not-italic relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                    {contact.phone}
                  </p>
                </CopyableValue>
                <CopyableValue
                  value={contact.email}
                  className="lead-copy-inline content-stretch flex gap-[4px] items-center min-w-0 relative shrink"
                >
                  <MailIcon size={14} />
                  <p className="font-['Inter',sans-serif] font-normal leading-[19px] min-w-0 not-italic overflow-hidden relative text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
                    {contact.email}
                  </p>
                </CopyableValue>
              </>
            )}
          </div>
        </div>
      </div>

      <ContactTag variant={contact.variant} size={11} labelSize={11} showLabel={false} className="self-start" />
    </div>
  );
}

export default function Variation2Grouped({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  if (!contacts.length) return null;

  if (layout === "modal") {
    return (
      <div
        /* The group's own card: the module's 2px tint around a white inner, so
           the whole set reads as one surface rather than as a stack of them. */
        className="bg-[rgba(244,242,240,0.6)] content-stretch flex items-start p-[2px] relative rounded-[12px] shrink-0 w-full"
        data-name="Contact Group"
      >
        <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-w-px px-[12px] py-[12px] relative rounded-[10px]">
          {/* The transaction, stated once, above the veil. */}
          <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
            <div className="content-stretch flex gap-[10px] items-center min-w-px relative shrink">
              <AvatarStack contacts={contacts} locked={flow.locked} size={28} />
              <div className="content-stretch flex flex-col gap-[1px] items-start min-w-px relative shrink">
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
                  {flow.revealed ? `${company} contact group` : availableLabel(count)}
                </p>
                {flow.locked ? (
                  <CostNote flow={flow} showRemaining />
                ) : (
                  <RevealedBadge count={count} size="sm" />
                )}
              </div>
            </div>
            {flow.locked && (
              <RevealCta flow={flow} count={count} label={revealAllLabel(count)} tone="primary" size="md" />
            )}
          </div>

          {/* The group itself, under one frost. Pressing anywhere in it runs
              the same reveal the header's control does — there is nothing
              smaller in here to press. */}
          <div
            onClick={flow.locked ? () => flow.reveal() : undefined}
            className={`content-stretch flex flex-col gap-[14px] items-start mt-[12px] pt-[12px] relative shrink-0 w-full bg-white ${
              flow.locked
                ? "lead-card-locked cursor-pointer"
                : `lead-card-revealed ${flow.settled ? "lead-card-settled" : ""}`
            }`}
            style={{ boxShadow: "inset 0 1px 0 0 #f4f2f0" }}
            data-name="Group Contacts"
          >
            {contacts.map(contact => (
              <GroupRow key={contact.name} contact={contact} locked={flow.locked} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* Opened, the row goes back to being a contact row — the group summary has
     nothing left to say that the details do not say better. */
  if (flow.revealed) {
    return <RevealedCardState contacts={contacts} settled={flow.settled} />;
  }

  return (
    <div
      onClick={() => flow.reveal()}
      className="bg-[rgba(244,242,240,0.6)] content-stretch cursor-pointer flex gap-[10px] h-[59px] items-center px-[12px] py-[8px] relative rounded-[12px] shrink-0 w-[310px]"
      data-name="Contact Group"
    >
      <AvatarStack contacts={contacts} locked size={26} />
      <div className="content-stretch flex flex-col gap-px items-start min-w-px relative shrink">
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic overflow-hidden shrink-0 text-[#2f2b3d] text-[13px] text-ellipsis whitespace-nowrap">
          {availableLabel(count)}
        </p>
        <CostNote flow={flow} />
      </div>
      {/* The row has 310px for the whole group, so the control drops the word
          the line above it has already said. */}
      <RevealCta
        flow={flow}
        count={count}
        label={count === 1 ? "Reveal" : "Reveal all"}
        size="sm"
        className="ml-auto shrink-0"
      />
    </div>
  );
}
