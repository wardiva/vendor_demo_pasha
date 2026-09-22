import { useEffect, useRef, useState } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import avatarUnrevealed from "@/components/contacts/assets/avatar-unrevealed.svg";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import Variation3Deck from "./Variation3Deck";
import { CARD_H, DUR, EASE, LoneCard, PANEL_W, SHADOW_FRONT, useFrontContact } from "./leftStack";
import { RevealCta, revealCountLabel, type RevealPanelProps } from "./parts";

/**
 * Variation 13 — the left rail.
 *
 * The other two overlap three cards and let the vendor dig one out. This asks
 * whether three cards is the right idea at all: at any moment the vendor is
 * reading one contact, and the other two are not information — they are a
 * control for changing which contact is being read.
 *
 * So the panel is one card, whole and unobstructed, with the company's other
 * people as a small rail of faces at its left shoulder. The card never moves
 * and never resizes; pressing a face in the rail crossfades the contact inside
 * it and lifts that face into the card's place. Nothing overlaps the card,
 * nothing peeks out from under it, and the contact being read has the entire
 * panel to itself.
 *
 * What this buys over a stack: a stack has to be un-stacked before the second
 * contact can be read, and every card in it is partly hidden by the one in
 * front. A rail shows every face at once, at a size that is plainly a control,
 * and costs one card's width to do it.
 *
 * What it costs: the rail's faces carry no name. That is the trade the concept
 * is making — the identity lives in the card, one at a time — and it is the
 * thing to judge it on.
 *
 * Sealed, the rail is the withheld portrait repeated, which reads as "and two
 * more" without claiming to say who. The card behind its veil and the single
 * company control are unchanged.
 */

/** The rail's faces, and how far each sits from the last. */
const FACE = 26;
const FACE_STEP = 19;
const RAIL_GAP = 10;

/** How long the card's contents take to cross. Half the move, so it reads as
    one gesture rather than as a fade waiting on a slide. */
const CROSS = 150;

export default function Variation13Rail(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;
  const { frontIndex, setFront } = useFrontContact(contacts, open);

  /**
   * The contact the card is currently drawing, which lags the selection by
   * half a beat: the outgoing contact has to fade before the incoming one can
   * take its place, and swapping the record immediately would cut the first
   * frame of that.
   */
  const [shown, setShown] = useState(frontIndex);
  const [crossing, setCrossing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* The selection changing for any reason — a press, or the dataset handing
     this card another company — takes the card through the same crossing. */
  useEffect(() => {
    if (frontIndex === shown) return;
    setCrossing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setShown(frontIndex);
      setCrossing(false);
    }, CROSS);
  }, [frontIndex, shown]);

  if (layout === "modal") return <Variation3Deck {...props} />;
  if (!count) return null;
  if (count === 1) return <LoneCard contact={contacts[0]} flow={flow} />;

  /* The rail holds everyone who is not in the card. */
  const others = contacts.map((_, i) => i).filter(i => i !== frontIndex);
  const railW = FACE + (others.length - 1) * FACE_STEP;
  const cardW = PANEL_W - railW - RAIL_GAP;
  const contact = contacts[shown] ?? contacts[0];

  return (
    <div
      className="content-stretch flex items-center justify-end relative shrink-0"
      style={{ width: PANEL_W, height: CARD_H }}
      data-name="Contact Deck"
    >
      {/* The rail. Faces in the dataset's order, minus whoever is in the card,
          so a press swaps two positions and leaves the rest alone. */}
      <div className="relative shrink-0" style={{ width: railW, height: FACE }}>
        {contacts.map((c, i) => {
          const place = others.indexOf(i);
          const inCard = place === -1;
          return (
            <button
              key={c.name}
              type="button"
              disabled={!open}
              aria-label={open ? `Show ${c.name}` : undefined}
              onClick={e => {
                e.stopPropagation();
                setFront(c.name);
              }}
              /* The page's click delegate runs on the capture phase and would
                 open the Prospect Details modal before this handler ran. */
              data-contact-select={open ? "" : undefined}
              className={`absolute block rounded-[100px] top-0 ${open ? "cursor-pointer" : "cursor-default"}`}
              style={{
                width: FACE,
                height: FACE,
                left: 0,
                /* A face that has just moved into the card leaves the rail by
                   sliding toward it and fading, rather than vanishing from
                   under the pointer. */
                transform: `translateX(${(inCard ? others.length : place) * FACE_STEP}px) scale(${inCard ? 0.72 : 1})`,
                opacity: inCard ? 0 : 1,
                pointerEvents: inCard ? "none" : undefined,
                zIndex: others.length - place,
                boxShadow: "0 0 0 2px #ffffff, 0 1px 1.5px rgba(47,43,61,0.05)",
                transition: `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`,
              }}
            >
              <img
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
                src={open ? c.avatar : avatarUnrevealed}
              />
            </button>
          );
        })}
      </div>

      {/* The card. One contact, the whole width the rail leaves, and never
          moved by a selection — only its contents cross. */}
      <div
        className="relative shrink-0"
        style={{
          width: cardW,
          height: CARD_H,
          marginLeft: RAIL_GAP,
          filter: SHADOW_FRONT,
          /* Out to the left and slightly back on the way out, in from the
             right on the way in: the contact arrives from the rail it was
             pressed in, which is the only cue that says where it came from. */
          opacity: crossing ? 0 : 1,
          transform: crossing ? "translateX(-6px) scale(0.985)" : "translateX(0) scale(1)",
          transition: `opacity ${CROSS}ms ${EASE}, transform ${CROSS}ms ${EASE}`,
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
    </div>
  );
}

/* Referenced for the type only, so the import above earns its place. */
export type RailContact = ProspectContact;
