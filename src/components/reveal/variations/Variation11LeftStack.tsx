import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import Variation3Deck from "./Variation3Deck";
import {
  CARD_H,
  DUR,
  EASE,
  EASE_BACK,
  LoneCard,
  PANEL_W,
  SHADOW_BACK,
  SHADOW_FRONT,
  StackCard,
  StackFrame,
  useFrontContact,
} from "./leftStack";
import type { RevealPanelProps } from "./parts";

/**
 * Variation 11 — the minimal left stack.
 *
 * The quietest of the three. Each card behind the front one is inset from the
 * left by a fixed step and nothing else happens to it: no rotation, no
 * separate rail, no chrome. What the vendor sees is one contact card with a
 * couple of edges showing at its left shoulder, which is the least a stack can
 * be and still be read as one.
 *
 * The restraint is the argument. A prospect row is scanned, not studied — the
 * eye is going down a list of companies — so the panel's first duty is to
 * present one contact cleanly, and its second is to admit there are others.
 * Anything more expressive than an edge competes with the row itself.
 *
 * The geometry is chosen so the front card is always the same size: every card
 * is drawn at the width the deepest one leaves, and the stack's total footprint
 * is the panel, whether the company holds one contact or three. Bringing a card
 * forward slides it right onto the mark with a few pixels of overshoot; the one
 * it displaces takes the plain curve back into the stack, so the two read as a
 * promotion rather than as a swap.
 */

/** How much of each card behind shows at the left. */
const STEP = 11;

export default function Variation11LeftStack(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;
  const { slotOf, setFront } = useFrontContact(contacts, open);

  /* The modal is Variation 3's, untouched — these concepts are the card's. */
  if (layout === "modal") return <Variation3Deck {...props} />;
  if (!count) return null;
  /* One contact is a plain card: nothing to stack, so nothing stacked. */
  if (count === 1) return <LoneCard contact={contacts[0]} flow={flow} />;

  /* Every card is the width the deepest edge leaves, so the front card neither
     grows nor shrinks as the stack is shuffled. */
  const cardW = PANEL_W - (count - 1) * STEP;

  return (
    <StackFrame>
      {contacts.map((contact, i) => {
        const slot = slotOf(i);
        const front = slot === 0;
        return (
          <StackCard
            key={contact.name}
            contact={contact}
            flow={flow}
            front={front}
            open={open}
            count={count}
            onSelect={() => setFront(contact.name)}
            style={{
              width: cardW,
              height: CARD_H,
              /* Laid out from the right edge: the front card sits flush with
                 the panel and each card behind steps out to its left. */
              right: 0,
              transform: `translateX(${-slot * STEP}px) scale(${1 - slot * 0.018})`,
              /* The cards shrink toward the edge that is showing, so the sliver
                 a vendor aims at keeps its position and its height. */
              transformOrigin: "left center",
              zIndex: count - slot,
              opacity: front ? 1 : open ? 0.96 : 0.82,
              filter: front ? SHADOW_FRONT : SHADOW_BACK,
              /* The card coming forward overshoots its mark by a hair; the
                 ones yielding do not, so the move reads as one card arriving
                 rather than three cards negotiating. */
              transition: `transform ${DUR}ms ${front ? EASE_BACK : EASE}, opacity ${DUR}ms ${EASE}, filter ${DUR}ms ${EASE}`,
            }}
          />
        );
      })}
    </StackFrame>
  );
}
