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
 * Variation 11 — the left stack, as drawn.
 *
 * The geometry is Figma node 1:50 ("Stack") measured off the file rather than
 * judged by eye. The node draws three cards at the same 310 width, stepped six
 * pixels left of each other and shortened five pixels each as they go back:
 *
 *   front   left 12   top 0   310 x 59
 *   middle  left  6   top 3   310 x 54
 *   back    left  0   top 6   310 x 49
 *
 * Two things fall out of that, and both are the design's point. The front card
 * keeps the panel's full 310 — it is the same card the revealed row and every
 * other concept shows, not a narrowed version of it — and the cards behind
 * earn their depth by being shorter rather than by being scaled, so the edge
 * that shows at the left keeps a true 12px corner instead of a squashed one.
 *
 * The step is small on purpose. A prospect row is scanned, not studied, so the
 * panel's first duty is to present one contact cleanly and its second is to
 * admit there are others; six pixels of edge says "there are more of these"
 * without asking to be read.
 *
 * A card behind is drawn at its own height and clipped to it, so promoting one
 * grows it into the front card's box rather than un-squashing it — the card
 * opens to its full size as it arrives, which is the motion the stack implies.
 */

/* Figma 1:50 — the step left, the height lost and the drop down, per card. */
const STEP = 6;
const SHRINK = 5;
const DROP = 3;

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
              /* The node's own width, on every card in the stack. */
              width: PANEL_W,
              height: CARD_H - slot * SHRINK,
              /* Laid out from the right edge, which is where the panel is
                 anchored: the front card sits flush with it and each card
                 behind steps out to its left. */
              right: 0,
              top: slot * DROP,
              transform: `translateX(${-slot * STEP}px)`,
              /* The card is cut to its slot's height rather than scaled into
                 it, so the corner showing at the left stays a true 12px round
                 and the type on the card is never squashed. */
              overflow: "hidden",
              zIndex: count - slot,
              opacity: front ? 1 : open ? 0.96 : 0.9,
              filter: front ? SHADOW_FRONT : SHADOW_BACK,
              /* The card coming forward overshoots its mark by a hair as it
                 grows to full height; the ones yielding do not, so the move
                 reads as one card arriving rather than three negotiating. */
              transition: `transform ${DUR}ms ${front ? EASE_BACK : EASE}, height ${DUR}ms ${front ? EASE_BACK : EASE}, top ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}, filter ${DUR}ms ${EASE}`,
            }}
          />
        );
      })}
    </StackFrame>
  );
}
