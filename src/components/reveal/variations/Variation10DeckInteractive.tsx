import { useEffect, useState } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import Variation3Deck from "./Variation3Deck";
import { RevealCta, revealCountLabel, type RevealPanelProps } from "./parts";

/**
 * Variation 10 — the stacked deck, still a deck after the reveal.
 *
 * Variation 3 sealed, unchanged: the contacts held as a physical stack with one
 * control on the face of it, and the count readable from the peeking edges
 * before anything is pressed. The cost line beneath is gone — the single action
 * over a stack that cannot be taken apart is what says the company is the unit,
 * and a sentence about what it charges was answering a question the stack had
 * already closed.
 *
 * What changes is the other half. Variation 3 fans the deck out into a list and
 * hands the row over to one contact's details; this keeps the deck. Opened, the
 * panel is the three of them and nothing else: no name, no title, no channels,
 * no featured card beside the stack. The vendor has bought the contacts and can
 * read them in the Prospect Details modal, which is where three people fit —
 * the row's job here is to say which three, and to let the vendor put any one
 * of them at the front.
 *
 * That is the whole interaction: press a face, it comes forward, the one that
 * was in front falls back into the stack. It is a deck being shuffled, which is
 * the same physical claim the sealed state makes, carried through to the state
 * the vendor spends the most time looking at.
 *
 * Card only. The Prospect Details modal is Variation 3's, untouched.
 */

/* Variation 3's own numbers for the sealed stack, so the two open identically. */
const PEEK = 7;
const SCALE_STEP = 0.03;
const CARD_H = 59;

/* ── the opened deck ──
   One box per face, moved by transform alone: a slot is an x, a scale and a
   depth, so a shuffle animates on the two properties a browser can move
   without touching layout. The panel's height never changes with the
   selection, because nothing in it is laid out by the selection. */
const FACE = 48;
const SLOTS: ReadonlyArray<{ x: number; scale: number; opacity: number }> = [
  { x: 0, scale: 1, opacity: 1 },
  { x: 34, scale: 0.9, opacity: 0.85 },
  { x: 64, scale: 0.82, opacity: 0.7 },
];

/** The stack's own height, matched to the sealed deck so the row never jumps. */
const deckHeight = (n: number) => CARD_H + Math.max(0, n - 1) * PEEK;

/**
 * The company's contacts as a deck that can be shuffled.
 *
 * Faces only. A name or a title here would be the "featured contact" this
 * concept is defined by not having, so the identity a face carries is the face
 * itself — and, for anyone not reading it with their eyes, the label on the
 * control.
 */
function InteractiveDeck({ contacts }: { contacts: RevealPanelProps["contacts"] }) {
  const [frontName, setFrontName] = useState(contacts[0]?.name ?? "");

  /* A card can be re-used for another company as the list filters or sorts, so
     the front follows whoever this company's first contact now is. */
  useEffect(() => {
    if (!contacts.some(c => c.name === frontName)) setFrontName(contacts[0]?.name ?? "");
  }, [contacts, frontName]);

  const frontIndex = Math.max(0, contacts.findIndex(c => c.name === frontName));
  /* The chosen face takes the front slot; the rest keep their own order behind
     it, so the deck never reshuffles further than the press asked for. */
  const order = [frontIndex, ...contacts.map((_, i) => i).filter(i => i !== frontIndex)];

  return (
    <div
      className="relative shrink-0"
      style={{ width: SLOTS[Math.min(contacts.length, SLOTS.length) - 1].x + FACE, height: deckHeight(contacts.length) }}
      data-name="Contact Deck"
    >
      {contacts.map((contact, i) => {
        const slot = Math.min(order.indexOf(i), SLOTS.length - 1);
        const { x, scale, opacity } = SLOTS[slot];
        const front = slot === 0;
        return (
          <button
            key={contact.name}
            type="button"
            aria-pressed={front}
            /* The only place this contact is named. It is not drawn — the
               concept's whole point is that the opened row carries no contact
               text — but a control has to say what it does to anyone who
               cannot see whose face is on it. */
            aria-label={`Bring ${contact.name} to the front`}
            onClick={e => {
              e.stopPropagation();
              setFrontName(contact.name);
            }}
            /* The page's click delegate runs on the capture phase and would
               open the Prospect Details modal before this button's own handler
               ran. This is what tells it the press belongs here. */
            data-contact-select
            className="absolute cursor-pointer rounded-[100px] top-1/2 transition-[transform,opacity,box-shadow] duration-[300ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{
              width: FACE,
              height: FACE,
              left: 0,
              opacity,
              zIndex: SLOTS.length - slot,
              /* -50% of its own height keeps the face centred in the panel at
                 whatever scale the slot gives it. */
              transform: `translate(${x}px, -50%) scale(${scale})`,
              /* The white ring is the deck's own edge, on every face; the ink
                 ring outside it is the one that is in front. */
              boxShadow: front
                ? "0 0 0 2px #ffffff, 0 0 0 3px rgba(7,41,41,0.45), 0 2px 6px rgba(47,43,61,0.18)"
                : "0 0 0 2px #ffffff, 0 1px 3px rgba(47,43,61,0.14)",
            }}
          >
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
              src={contact.avatar}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Variation10DeckInteractive(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;

  /* The modal is Variation 3's, unchanged — this concept is the card's. */
  if (layout === "modal") return <Variation3Deck {...props} />;

  if (!count) return null;

  /* Opened: the deck, and nothing beside it. */
  if (flow.revealed) {
    return (
      <div
        className="content-stretch flex items-center justify-end relative shrink-0 w-[310px]"
        style={{ height: deckHeight(count) }}
        data-name="Contact Deck"
      >
        <InteractiveDeck contacts={contacts} />
      </div>
    );
  }

  /* Sealed: Variation 3's stack, card for card — each face sitting
     `height - peek` over the one before it, dimmed and stepped back behind the
     front, with the one control on the face of the stack. The cost line that
     sat under it is the only thing missing. */
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0 w-[310px]"
      data-name="Contact Deck"
    >
      <div className="flex flex-col items-start relative shrink-0 w-full">
        {contacts.map((contact, i) => {
          const front = i === 0;
          return (
            <div
              key={contact.name}
              className="reveal-deck-card relative w-full"
              style={{
                marginTop: front ? 0 : -(CARD_H - PEEK),
                transform: front ? "none" : `scale(${1 - i * SCALE_STEP})`,
                transformOrigin: "top center",
                zIndex: count - i,
                opacity: front ? 1 : 0.75,
                filter: "drop-shadow(0 1px 2px rgba(47,43,61,0.16))",
              }}
            >
              <ContactPreviewCard
                variant={contact.variant}
                avatar={contact.avatar}
                name={contact.name}
                jobTitle={contact.jobTitle}
                phone={contact.phone}
                email={contact.email}
                locked
                settled={false}
                onRevealRequest={flow.reveal}
                layout="prospect"
                className="w-full"
                reveal={
                  /* One control, on the face of the stack. */
                  front ? (
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
    </div>
  );
}
