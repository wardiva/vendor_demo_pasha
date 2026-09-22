import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import {
  GroupHeading,
  RevealCta,
  RevealedBadge,
  RevealedCardState,
  revealCountLabel,
  type RevealPanelProps,
} from "./parts";

/**
 * Variation 3 — the stacked deck.
 *
 * The contacts are held as a physical stack: one card in front, the others
 * peeking out behind it. A stack is a thing you pick up whole — you cannot take
 * the third card out of the middle of it — and that is the model, made
 * tangible rather than explained.
 *
 * The reveal is then a single, satisfying motion: the stack fans out into the
 * list it always was, and every contact in it is open. The count is legible
 * before the press, from the edges alone, which is the cheapest possible way to
 * answer "how many do I get?" — no label required, though the control still
 * carries one.
 *
 * Where it is strong: the list row, where a stack costs barely more height than
 * a single card but stops the panel reading as one person. Where it asks for
 * care: the peeking edges have to stay legible at one and two contacts, so the
 * stack degrades to an ordinary card when there is nothing behind it.
 */

/* How far the cards behind the front one peek out, and how much each is scaled
   back. Small enough to read as depth rather than as a list that failed to lay
   out; large enough to count from a metre away. */
const PEEK = { card: 7, modal: 10 };
const SCALE_STEP = 0.03;

export default function Variation3Deck({ company, contacts, layout }: RevealPanelProps) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const modal = layout === "modal";
  if (!contacts.length) return null;

  /* Opened, the row shows details rather than a stack — there is no longer
     anything stacked, and the list row's job is the contact. */
  if (!modal && flow.revealed) {
    return <RevealedCardState contacts={contacts} settled={flow.settled} />;
  }

  const peek = modal ? PEEK.modal : PEEK.card;
  const cardHeight = modal ? 75 : 59;

  /* Sealed, each card sits `height - peek` on top of the one before it; opened,
     they fall into an ordinary 12px-gapped list. The margin is what animates,
     so the panel's own height travels with the fan rather than jumping. */
  const deck = contacts.map((contact, i) => {
    const front = i === 0;
    const stacked = flow.locked;
    return (
      <div
        key={contact.name}
        className="reveal-deck-card relative w-full"
        style={{
          marginTop: front ? 0 : stacked ? -(cardHeight - peek) : 12,
          transform: stacked && !front ? `scale(${1 - i * SCALE_STEP})` : "none",
          transformOrigin: "top center",
          zIndex: count - i,
          /* The cards behind are dimmed so the front one is plainly the face of
             the stack rather than one of three competing surfaces. */
          opacity: stacked && !front ? 0.75 : 1,
          /* Drawn on the card's own shape rather than on its box, so the edge
             that separates one card in the stack from the next follows the
             12px corners instead of squaring them off. Without it the pale
             tint on white leaves the peeking edges barely visible, and the
             stack stops reading as more than one card. */
          filter: stacked ? "drop-shadow(0 1px 2px rgba(47,43,61,0.16))" : "none",
        }}
      >
        <ContactPreviewCard
          variant={contact.variant}
          avatar={contact.avatar}
          name={contact.name}
          jobTitle={contact.jobTitle}
          phone={contact.phone}
          email={contact.email}
          locked={flow.locked}
          settled={flow.settled}
          onRevealRequest={flow.reveal}
          layout={modal ? "modal" : "prospect"}
          className="w-full"
          reveal={
            /* One control, on the face of the stack. */
            front && flow.locked && !modal ? (
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
  });

  if (modal) {
    return (
      <div
        className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full"
        data-name="Contact Deck"
      >
        <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
          <GroupHeading company={company} count={count} revealed={flow.revealed} />
          {flow.revealed && <RevealedBadge count={count} />}
        </div>

        <div className="flex flex-col items-start relative shrink-0 w-full">{deck}</div>

        {flow.locked && (
          /* Under the stack, where the motion starts: press, and the deck fans
             out from directly above the control. */
          <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
            <RevealCta
              flow={flow}
              count={count}
              label={count === 1 ? "Reveal contact" : `Reveal all ${count} contacts`}
              tone="primary"
              size="md"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[310px]"
      data-name="Contact Deck"
    >
      <div className="flex flex-col items-start relative shrink-0 w-full">{deck}</div>
    </div>
  );
}
