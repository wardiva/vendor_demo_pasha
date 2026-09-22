import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import {
  AvatarStack,
  CostNote,
  GroupHeading,
  RevealCta,
  RevealedBadge,
  availableLabel,
  revealAllLabel,
  revealCountLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 1 — the company unlock.
 *
 * The judgement behind it: the model changed, the interface should not have to
 * change much to say so. A vendor already reads these cards as companies, so the
 * smallest true change is to stop presenting the contact panel as a person for
 * sale and start presenting it as this company's contacts, opened together.
 *
 * Three things carry that, and nothing else is added:
 *
 *  1. A line above the panel counts what the company holds — "3 contacts
 *     available" — so the number is read before the action is considered.
 *  2. The control names the same number: "Reveal 3 contacts". One press, one
 *     count, no arithmetic about what three presses would cost.
 *  3. The cost sits beside it in the plan's own unit: uses 1 contact reveal.
 *
 * The preview stays a single contact on the list, because a list row is not
 * where three people can be read, and the modal is one press away and shows
 * them all. After the reveal the line says so, and the portraits of the others
 * stand beside it — the group is open, and the card says where the rest are.
 */
export default function Variation1CompanyUnlock({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const primary = contacts[0];
  const rest = contacts.slice(1);
  if (!primary) return null;

  if (layout === "modal") {
    return (
      <div
        className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full"
        data-name="Company Reveal"
      >
        {/* The company's line and its action, on one row: what is available,
            and the single press that opens all of it. */}
        <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[2px] items-start min-w-px relative shrink">
            <GroupHeading company={company} count={count} revealed={flow.revealed} />
            {flow.locked && <CostNote flow={flow} showRemaining />}
          </div>
          {flow.locked ? (
            <RevealCta
              flow={flow}
              count={count}
              label={revealAllLabel(count)}
              tone="primary"
              size="md"
            />
          ) : (
            <RevealedBadge count={count} />
          )}
        </div>

        {/* Every contact the reveal buys, listed in full and sealed as one
            group: no card carries a control of its own, because no card can be
            bought on its own. Pressing any of them runs the company's reveal. */}
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          {contacts.map(contact => (
            <ContactPreviewCard
              key={contact.name}
              variant={contact.variant}
              avatar={contact.avatar}
              name={contact.name}
              jobTitle={contact.jobTitle}
              phone={contact.phone}
              email={contact.email}
              locked={flow.locked}
              settled={flow.settled}
              onRevealRequest={flow.reveal}
              layout="modal"
              className="w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0 w-[310px]"
      data-name="Company Reveal"
    >
      {/* The count and the cost, above the preview: read before the press. */}
      <div className="content-stretch flex gap-[8px] items-center justify-between relative shrink-0 w-full">
        {flow.revealed ? (
          <RevealedBadge count={count} size="sm" />
        ) : (
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[18px] not-italic shrink-0 text-[#2f2b3d] text-[11px] whitespace-nowrap">
            {availableLabel(count)}
          </p>
        )}
        {flow.locked ? (
          <CostNote flow={flow} />
        ) : (
          rest.length > 0 && <AvatarStack contacts={rest} locked={false} size={20} />
        )}
      </div>

      <ContactPreviewCard
        variant={primary.variant}
        avatar={primary.avatar}
        name={primary.name}
        jobTitle={primary.jobTitle}
        phone={primary.phone}
        email={primary.email}
        locked={flow.locked}
        settled={flow.settled}
        onRevealRequest={flow.reveal}
        className="w-full"
        reveal={
          flow.locked ? (
            <RevealCta
              flow={flow}
              count={count}
              label={revealCountLabel(count)}
              size="sm"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]"
            />
          ) : undefined
        }
      />
    </div>
  );
}
