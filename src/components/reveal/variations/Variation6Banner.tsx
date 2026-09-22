import ContactTag from "@/components/ContactTag";
import avatarUnrevealed from "@/components/contacts/assets/avatar-unrevealed.svg";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import {
  AvatarStack,
  ContactPreviewCardLazy,
  CostNote,
  RevealCta,
  RevealedBadge,
  RevealedCardState,
  availableLabel,
  revealAllLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 6 — the unlock banner.
 *
 * One banner across the top of the company's contacts, carrying the count, the
 * company and the action; underneath, the contacts drawn as the shape they will
 * take, with their values as skeleton lines.
 *
 * The skeletons are doing real work. A frosted card says "there is something
 * here you cannot read"; a skeleton says "this is the record you are about to
 * be given" — same protection, but it reads as a promise rather than as a
 * withholding, and it makes three cards obviously three cards at a glance,
 * from their shape alone.
 *
 * The banner is deliberately the only control on the panel and is styled as the
 * page's primary action. Nothing inside a skeleton row can be pressed, so there
 * is no per-person path to look for and none to accidentally take.
 */

/** A contact as the shape of the record the reveal will fill in. */
function SkeletonContact({ contact, compact }: { contact: ProspectContact; compact: boolean }) {
  return (
    <div
      className={`bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] content-stretch flex gap-[10px] items-center relative rounded-[12px] shrink-0 w-full ${
        compact ? "px-[10px] py-[8px]" : "px-[12px] py-[10px]"
      }`}
      data-name="Sealed Contact"
    >
      <span
        className="relative block rounded-[100px] shrink-0"
        style={{ width: compact ? 28 : 36, height: compact ? 28 : 36 }}
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
          src={avatarUnrevealed}
        />
      </span>

      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px relative">
        {/* The name's line, not the name. */}
        <span className="reveal-skeleton block" style={{ width: compact ? 104 : 132, height: 9 }} />
        <div className="content-stretch flex gap-[8px] items-center min-w-px relative w-full">
          {/* The role is readable: it is what the vendor is judging. */}
          <p
            className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[18px] min-w-px not-italic overflow-hidden relative shrink text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap ${
              compact ? "text-[11px]" : "text-[12px]"
            }`}
          >
            {contact.jobTitle}
          </p>
          <span className="reveal-skeleton block shrink-0" style={{ width: compact ? 46 : 70, height: 7 }} />
          {!compact && <span className="reveal-skeleton block shrink-0" style={{ width: 88, height: 7 }} />}
        </div>
      </div>

      <ContactTag variant={contact.variant} size={11} labelSize={11} showLabel={false} className="self-start" />
    </div>
  );
}

export default function Variation6Banner({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const modal = layout === "modal";
  const count = contacts.length;
  if (!contacts.length) return null;

  if (flow.revealed) {
    if (!modal) return <RevealedCardState contacts={contacts} settled={flow.settled} />;
    return (
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
          <AvatarStack contacts={contacts} locked={false} size={28} />
          <RevealedBadge count={count} />
        </div>
        {contacts.map(contact => (
          <ContactPreviewCardLazy
            key={contact.name}
            contact={contact}
            settled={flow.settled}
            layout="modal"
          />
        ))}
      </div>
    );
  }

  const banner = (
    <div
      className={`bg-[#072929] content-stretch flex gap-[10px] items-center relative rounded-[12px] shrink-0 w-full ${
        modal ? "px-[14px] py-[12px]" : "px-[10px] py-[8px]"
      }`}
      data-name="Unlock Banner"
    >
      <AvatarStack contacts={contacts} locked size={modal ? 28 : 24} />
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-px items-start min-w-px relative">
        <p
          className={`[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[18px] max-w-full not-italic overflow-hidden shrink-0 text-white text-ellipsis whitespace-nowrap ${
            modal ? "text-[13px]" : "text-[12px]"
          }`}
        >
          {availableLabel(count)}
        </p>
        {/* The row has 310px for banner, count and control together, so the
            line under the count is the short form of the same sentence. */}
        <p
          className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[16px] max-w-full not-italic overflow-hidden shrink-0 text-ellipsis whitespace-nowrap ${
            flow.exhausted ? "text-[#ffb4b6]" : "text-[rgba(255,255,255,0.72)]"
          } text-[11px]`}
        >
          {flow.exhausted
            ? "No reveals left"
            : modal
              ? `Uses 1 of your ${flow.remaining} remaining reveals`
              : "Uses 1 contact reveal"}
        </p>
      </div>
      <RevealCta
        flow={flow}
        count={count}
        label={modal ? revealAllLabel(count) : count === 1 ? "Reveal" : "Reveal all"}
        tone="invert"
        size={modal ? "md" : "sm"}
        className="ml-auto shrink-0"
      />
    </div>
  );

  return (
    <div
      className={`content-stretch flex flex-col gap-[8px] items-start relative shrink-0 ${
        modal ? "w-full" : "w-[310px]"
      }`}
      data-name="Unlock Panel"
    >
      {banner}
      <div
        className={`content-stretch flex flex-col items-start relative shrink-0 w-full ${
          modal ? "gap-[10px]" : "gap-[6px]"
        }`}
      >
        {/* The row previews the first record's shape; the banner above has
            already said how many there are and what the set costs, so the
            preview carries no second price. */}
        {(modal ? contacts : contacts.slice(0, 1)).map(contact => (
          <SkeletonContact key={contact.name} contact={contact} compact={!modal} />
        ))}
      </div>
    </div>
  );
}
