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
 * Variation 12 — the fanned stack.
 *
 * Variation 11's geometry with a hand in it. Each card behind the front is
 * turned a degree and a half further from true and dropped a pixel, the way
 * cards sit when someone is holding them rather than when a machine has
 * stacked them.
 *
 * The tilt is not decoration. A square offset by a square reads as one card
 * mis-rendered — the eye looks for the error before it looks for the second
 * contact — whereas anything off-axis is unmistakably a separate object. It is
 * also what stops the panel reading as boxy: a rectangle that is not aligned to
 * its neighbour has no shared edge to harden against.
 *
 * It is kept small on purpose. A degree and a half at 59px is about a pixel and
 * a half of rise across the card, which is legible as a tilt and never as a
 * mistake, and the front card is always dead level so the contact the vendor is
 * actually reading is never on an angle.
 *
 * Bringing a card forward is the satisfying one: it rotates to level as it
 * slides right, so the motion is a card being squared up and laid down. The
 * one it displaces tilts away as it goes back, which is the same gesture in
 * reverse and costs nothing extra to watch.
 */

/** Left inset, tilt and drop per card behind the front. */
const STEP = 12;
const TILT = 1.6;
const DROP = 1.5;

export default function Variation12Fan(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;
  const { slotOf, setFront } = useFrontContact(contacts, open);

  if (layout === "modal") return <Variation3Deck {...props} />;
  if (!count) return null;
  if (count === 1) return <LoneCard contact={contacts[0]} flow={flow} />;

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
              right: 0,
              /* Out to the left, down a little, and turned — the rotation last
                 so it is applied about the card's own settled position. */
              transform: `translate(${-slot * STEP}px, ${slot * DROP}px) rotate(${-slot * TILT}deg) scale(${1 - slot * 0.015})`,
              /* Turned about the corner that stays put, which is the one the
                 vendor can see and press. */
              transformOrigin: "left center",
              zIndex: count - slot,
              opacity: front ? 1 : open ? 0.96 : 0.82,
              filter: front ? SHADOW_FRONT : SHADOW_BACK,
              transition: `transform ${DUR}ms ${front ? EASE_BACK : EASE}, opacity ${DUR}ms ${EASE}, filter ${DUR}ms ${EASE}`,
            }}
          />
        );
      })}
    </StackFrame>
  );
}
