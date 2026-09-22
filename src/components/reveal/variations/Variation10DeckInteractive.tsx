import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import Variation3Deck from "./Variation3Deck";
import { RevealCta, revealCountLabel, type RevealPanelProps } from "./parts";

/**
 * Variation 10 — the stacked deck, still a deck after the reveal.
 *
 * Variation 3 sealed, unchanged: the company's contacts held as a physical
 * stack, the count readable from the peeking edges before anything is pressed,
 * and one control on the face of it. No cost line — the single action over a
 * stack that cannot be taken apart is what says the company is the unit.
 *
 * What changes is the other half. Variation 3 fans the deck out into a list and
 * hands the row to one contact's details; this keeps the deck. The same three
 * contact cards stay stacked after the reveal — the same cards, with the frost
 * lifted and the real contact on them: portrait, name, mark, job title, the two
 * channels and the verified or recommended tag. Nothing is summarised above the
 * stack, nothing is featured beside it, and no card is reduced to a portrait.
 *
 * Sealed and opened are one arrangement, not two. Every card is placed by the
 * same rule in both states — a slot, a translate and a scale — so the reveal
 * moves the deck rather than replacing it: the cards ease apart to the reading
 * gap, the veil lifts, the control goes, and the stack the vendor was looking
 * at is the stack they end up with.
 *
 * Opened, the deck can be shuffled. Press any card and it comes to the front;
 * the one that was there falls back into the stack. Both move on transform and
 * opacity alone, so the shuffle costs no layout and every card keeps its
 * contact on it the whole way.
 *
 * Card only. The Prospect Details modal is Variation 3's, untouched.
 */

/* Variation 3's own numbers, so the sealed stack is its stack exactly. */
const CARD_H = 59;
const SCALE_STEP = 0.03;

/**
 * How far the cards behind the front one peek out — before the reveal and
 * after it, because the deck is not allowed to change size.
 *
 * The row is a fixed-height thing in a list of fixed-height things, and a
 * reveal that pushed the card taller moved every prospect below it down the
 * page. So the deck takes the same space in both states and the cards overlap
 * inside it: the reveal lifts the frost and retires the control, and nothing
 * on the row travels a pixel.
 *
 * What that costs is the size of the target on a card that is not in front —
 * seven pixels of edge is what there is to press. The alternative was a deck
 * that relaxed open and took the row with it, which is the thing being fixed.
 */
const PEEK = 7;

/** Constant for a given company: the state it is in has no say in it. */
const stackHeight = (n: number) => CARD_H + Math.max(0, n - 1) * PEEK;

/**
 * The deck, in whichever state the company is in.
 *
 * One renderer for both, because the two states are the same arrangement with
 * different numbers in it. A card's slot decides everything about where it is —
 * how far down the stack, how far scaled back, how deep in the z-order — and a
 * slot is assigned by the press while the company is open and by the dataset's
 * own order while it is sealed.
 */
function Deck({
  company,
  contacts,
  flow,
}: {
  company: string;
  contacts: RevealPanelProps["contacts"];
  flow: ReturnType<typeof useCompanyRevealFlow>;
}) {
  const count = contacts.length;
  const [frontName, setFrontName] = useState(contacts[0]?.name ?? "");

  /* A card can be re-used for another company as the list filters or sorts, so
     the front follows whoever this company's first contact now is. */
  useEffect(() => {
    if (!contacts.some(c => c.name === frontName)) setFrontName(contacts[0]?.name ?? "");
  }, [contacts, frontName]);

  const open = flow.revealed;
  /* Sealed, the deck is in the dataset's order and the press means "reveal",
     not "choose" — there is nothing to choose between yet. */
  const frontIndex = open ? Math.max(0, contacts.findIndex(c => c.name === frontName)) : 0;
  const order = [frontIndex, ...contacts.map((_, i) => i).filter(i => i !== frontIndex)];

  const select = (contact: RevealPanelProps["contacts"][number]) => (e: MouseEvent<HTMLDivElement>) => {
    /* The channels on a disclosed card copy when they are pressed. That press
       is the value's, not the deck's, so it never reshuffles the stack. */
    const target = e.target as HTMLElement;
    if (target.closest("[data-copy-row]") || target.closest(".lead-copy-icon")) return;
    e.stopPropagation();
    setFrontName(contact.name);
  };

  return (
    /* No height transition, because the height never changes. */
    <div className="relative shrink-0 w-full" style={{ height: stackHeight(count) }}>
      {contacts.map((contact, i) => {
        const slot = order.indexOf(i);
        const front = slot === 0;
        return (
          <div
            key={contact.name}
            /* Only a disclosed card is a control. Sealed, the whole stack is
               the reveal and the card forwards its press to it, which is
               ContactPreviewCard's own behaviour and is left alone. */
            role={open ? "button" : undefined}
            tabIndex={open && !front ? 0 : undefined}
            aria-pressed={open ? front : undefined}
            aria-label={open ? `Bring ${contact.name} to the front` : undefined}
            onClick={open ? select(contact) : undefined}
            onKeyDown={
              open
                ? (e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    e.stopPropagation();
                    setFrontName(contact.name);
                  }
                : undefined
            }
            /* The page's click delegate runs on the capture phase and would
               open the Prospect Details modal before this card's own handler
               ran. This is what tells it the press belongs here. */
            data-contact-select={open ? "" : undefined}
            className={`absolute left-0 rounded-[12px] transition-[transform,opacity,box-shadow] duration-[300ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full ${
              open && !front ? "cursor-pointer" : ""
            }`}
            style={{
              top: 0,
              transform: `translateY(${slot * PEEK}px) scale(${1 - slot * SCALE_STEP})`,
              transformOrigin: "top center",
              zIndex: count - slot,
              /* The cards behind are stepped back so the front one is plainly
                 the face of the stack. Opened they are barely dimmed — there is
                 a contact on them now, and a contact the vendor has paid for
                 should not be greyed out. */
              opacity: front ? 1 : open ? 0.92 : 0.75,
              /* Drawn on the card's own shape rather than on its box, so the
                 edge between one card and the next follows the 12px corners
                 instead of squaring them off. */
              filter: "drop-shadow(0 1px 2px rgba(47,43,61,0.16))",
              /* The one on top says so with a hairline in the product's ink —
                 enough to find, not enough to compete with the contact. */
              boxShadow: open && front ? "0 0 0 1.5px rgba(7,41,41,0.4)" : undefined,
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
              layout="prospect"
              className="w-full"
              reveal={
                /* One control, on the face of the stack, and only while the
                   company is sealed. */
                front && flow.locked ? (
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
      })}
    </div>
  );
}

export default function Variation10DeckInteractive(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);

  /* The modal is Variation 3's, unchanged — this concept is the card's. */
  if (layout === "modal") return <Variation3Deck {...props} />;

  if (!contacts.length) return null;

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[310px]"
      data-name="Contact Deck"
    >
      <Deck company={company} contacts={contacts} flow={flow} />
    </div>
  );
}
