import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import StackCount from "./StackCount";
import { GroupHeading, RevealCta, RevealedBadge, revealAllCountLabel } from "./variations/parts";

/**
 * The company's contacts on a prospect row — the finalised design.
 *
 * Built from four Figma nodes, which agree on one rule set:
 *
 *   1:50    three contacts, sealed
 *   3:52    two contacts, sealed
 *   0:1817  one contact, sealed
 *   3:53    three contacts, disclosed
 *
 * Every card is the panel's full 310 x 59 and the stack is drawn by stepping
 * the ones behind out to the left, down a little, and shorter:
 *
 *   sealed     left 0, 6, 12      3:52 and 1:50
 *   disclosed  left 0, 7, 14      3:53
 *   both       top 0, 3, 6 and height 59, 54, 49
 *
 * So the panel is one card tall whatever the company holds, and the prospect
 * row never changes height — not between one contact and three, not when a
 * company is revealed, and not when a card is brought forward. The stack
 * spends width, which the row has to spare, instead of height, which it does
 * not.
 *
 * A company with one contact is node 0:1817: the card by itself, with no
 * offset, no second card and nothing behind it to suggest one.
 *
 * Nothing carries a shadow. The nodes draw none, and the cards separate on
 * their own — a sealed card is the ash tint against the row's white, and a
 * disclosed one is white with the tint inset two pixels inside it, so the edge
 * that shows at the left is a change of fill rather than an effect.
 */

/* ── the nodes' geometry ── */
const CARD_H = 59;
const PANEL_W = 310;
/** 1:50 and 3:52 step 6; 3:53 steps 7, the disclosed stack opening a little. */
const STEP_SEALED = 6;
const STEP_OPEN = 7;
const SHRINK = 5;
const DROP = 3;

/**
 * The status tag, at the size each node draws it.
 *
 * Sealed, the word is beside the mark — 8.5px mark, 9.5px label in medium,
 * 8px in from the card's right (0:1536, 0:1817). Disclosed, the mark stands
 * alone at 9.5px against the inner card's own 8px right padding, which is 10
 * from the card's edge (3:53). The top offsets put each mark on the centre
 * line its node puts it on; see the note on the sealed one in leftStack.
 */
const TAG_SEALED = {
  size: 8.5,
  labelSize: 9.5,
  medium: true,
  durationMs: 300,
  /* The tag is pinned by its right edge, and that edge moves by two between
     the two states. Transitioning it is what carries the mark across rather
     than teleporting it there while the word is still closing. */
  /* 3, not the node's own 6. The node's tag box is 16 tall and starts at 6, so
     its contents centre on 14; this one is 22 tall, because the label's line
     box is 20 rather than the node's 11. Matching the box tops would put the
     mark three pixels below where the design has it — what has to agree is
     the centre line, and 3 is what puts it on 14. */
  className: "absolute right-[8px] top-[3px] transition-[right] duration-[300ms] ease-[cubic-bezier(0.4,0.05,0.2,1)]",
};
const TAG_OPEN = {
  size: 9.5,
  durationMs: 300,
  className: "absolute right-[10px] top-[3px] transition-[right] duration-[300ms] ease-[cubic-bezier(0.4,0.05,0.2,1)]",
};

/**
 * The motion.
 *
 * One curve, no overshoot: the brief asks for polished and subtle rather than
 * playful, and a card that passes its mark and comes back is the opposite of
 * that on a row being scanned.
 *
 * The curve matters more than the number. An ease-out whose control points
 * both sit at 1 puts nearly the whole move into the first quarter of its
 * duration — measured frame by frame, the card was at its mark inside 80ms
 * of a 280ms transition, which is a jump with a long tail rather than a
 * movement. This one eases in as well as out and keeps its middle, so the
 * 300ms is 300ms of card actually travelling.
 */
const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
const DUR = 300;

/**
 * What each layer is filled and edged with, from Figma 32:1414.
 *
 * The node draws the depth rather than implying it. Every card in the deck is
 * the same 310-wide card with a 2px frame; what changes with depth is what is
 * inside the frame, and it darkens as the layer recedes — so the two slivers
 * showing at the left are two distinct greys, not one edge repeated. The
 * front card is the only one whose contents are drawn at all.
 *
 *   sealed    slot 0  #f4f2f0 behind a 2px white ring
 *             slot 1  #efefef
 *             slot 2  #e7e7e7
 *   revealed  slot 0  #f4f2f0 at 60%   (the card's own rim, already drawn)
 *             slot 1  #ebebeb at 80%
 *             slot 2  #d8d8d8 at 60%
 *
 * Slot 0 is absent from this table in both states because the card draws its
 * own interior — the veil while sealed, the rim once open. Everything behind
 * it is a flat panel, which is also why the deck costs nothing to render: two
 * of the three cards are never read.
 */
const DEPTH_FILL: ReadonlyArray<{ sealed: string; open: string } | null> = [
  null,
  { sealed: "#efefef", open: "rgba(235,235,235,0.8)" },
  { sealed: "#e7e7e7", open: "rgba(216,216,216,0.6)" },
];


const slotStyle = (slot: number, open: boolean) => ({
  width: PANEL_W,
  height: CARD_H - slot * SHRINK,
  right: 0,
  top: slot * DROP,
  transform: `translateX(${-slot * (open ? STEP_OPEN : STEP_SEALED)}px)`,
  /* Cut to the slot's height rather than scaled into it, so the corner showing
     at the left keeps the node's 12px round and the contact is never squashed. */
  overflow: "hidden",
  /* z-index is in the list on purpose. A card sent to the back of the deck
     whose depth changed on the first frame would vanish behind the others
     while still standing at the front — the pop this interaction is meant to
     avoid. Animated, the browser steps it at the midpoint, so the card travels
     halfway back before it slips under, which is what a hand does with a card
     it is pushing into a deck. */
  transition: `transform ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, top ${DUR}ms ${EASE}, z-index ${DUR}ms ${EASE}`,
});

/** One card in the stack, and the press that brings it to the front. */
function StackedCard({
  contact,
  flow,
  slot,
  count,
  open,
  onSelect,
  label,
}: {
  contact: ProspectContact;
  flow: ReturnType<typeof useCompanyRevealFlow>;
  slot: number;
  count: number;
  open: boolean;
  onSelect: () => void;
  /** What the press does, for anyone not reading the deck with their eyes. */
  label: string;
}) {
  const front = slot === 0;
  const select = (e: MouseEvent<HTMLDivElement>) => {
    /* A press on a channel copies it; that is the value's press, not the
       stack's, so it never brings the card forward. */
    const target = e.target as HTMLElement;
    if (target.closest("[data-copy-row]") || target.closest(".lead-copy-icon")) return;
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      role={open ? "button" : undefined}
      /* Every disclosed card is a control now, the one in front included —
         pressing it deals the next contact — so every one of them can be
         reached from the keyboard. */
      tabIndex={open ? 0 : undefined}
      aria-pressed={open ? front : undefined}
      aria-label={open ? label : undefined}
      onClick={open ? select : undefined}
      onKeyDown={
        open
          ? (e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
      /* The page's click delegate runs on the capture phase and would open the
         Prospect Details modal before this card's own handler ran. */
      data-contact-select={open ? "" : undefined}
      /* Every sealed card's face is the flat #f4f2f0 — a lone one (32:1618) as
         much as the front of a deck (32:1537). What only the deck's front card
         takes is the white ring, and with it the 14 radius and the frost inset
         4, so the two cases are told apart by value rather than by presence.
         The layers behind are filled pure white, which is what makes the 2px
         rim past the grey panel read as the edge between them. See index.css. */
      data-stack-front={front && flow.locked ? (count > 1 ? "deck" : "lone") : undefined}
      data-stack-behind={!front ? "" : undefined}
      className={`absolute rounded-[12px] ${open ? "cursor-pointer" : ""}`}
      style={{ ...slotStyle(slot, open), zIndex: count - slot }}
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
        frame
        tag={flow.locked ? TAG_SEALED : TAG_OPEN}
        className="w-full"
        reveal={
          /* One control for the company, on the face of the stack. */
          front && flow.locked ? (
            <RevealCta
              flow={flow}
              count={count}
              label={revealAllCountLabel(count)}
              size="sm"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]"
            />
          ) : undefined
        }
      />

      {/* The layer's own interior, over the contact rather than under it: the
          node draws no content on the cards behind the front one, only a flat
          panel darkening with depth. Inset 2 at radius 10 is the frame the
          design gives every card — the same 2 and the same 10 the revealed
          card's rim already uses, so the edge showing at the left is the
          card's white and the panel is what sits in it. */}
      {!front && DEPTH_FILL[slot] && (
        <span
          aria-hidden
          className="absolute inset-[2px] pointer-events-none rounded-[10px]"
          style={{
            background: open ? DEPTH_FILL[slot]!.open : DEPTH_FILL[slot]!.sealed,
            zIndex: 5,
          }}
        />
      )}

      {/* The one stroke in the whole stack.

          Every card in 32:1414 carries a 1px rgba(47,43,61,0.2) stroke that is
          switched off — `visible: false` on all of them, back layers and
          revealed cards alike. Read the stroke array without checking that
          flag and you draw a dozen hairlines the design does not have, which
          on a revealed card reads as a doubled outline around the contact.
          The only strokes actually painted are 2px white: on the front of a
          three-card stack (32:1537), the front of a two-card stack (32:2277),
          and the count badge. A lone sealed card (32:1618) has none.

          So this is not "the card's border" — it is the cut between the front
          card and the layers showing past its left edge, which is why a
          company with nothing behind it does not get one.

          Drawn here rather than on the card so the veil and the hover stroke
          underneath are untouched. */}
      {front && flow.locked && count > 1 && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ border: "2px solid #ffffff", borderRadius: 14, zIndex: 6 }}
        />
      )}
    </div>
  );
}

export default function ContactStack({
  company,
  contacts,
}: {
  company: string;
  contacts: ProspectContact[];
}) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  const open = flow.revealed;

  /**
   * How far the deck has been cut, rather than who is in front.
   *
   * A deck is cycled, not addressed: pressing the card on top sends it to the
   * bottom and brings the next one up, and pressing any card takes the cut to
   * it. Holding the cut instead of a name is what makes that a rotation — the
   * order behind the front is always the dataset's own, continuing from
   * whoever is showing, so no card ever jumps a place it did not need to.
   */
  const [cut, setCut] = useState(0);

  /* A row can be re-used for another company as the list filters or sorts, so
     the deck goes back to its own top whenever the company changes. */
  useEffect(() => {
    setCut(0);
  }, [company, count]);

  if (!count) return null;

  /* Sealed there is nothing to choose between: the dataset's order stands and
     a press means "reveal". Disclosed, the cut decides where the order starts
     and the rest follow it round. */
  const start = open ? cut % count : 0;
  /** A contact's place in the deck, counting from whoever is showing. */
  const slotOf = (i: number) => (i - start + count) % count;

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ width: PANEL_W, height: CARD_H }}
      data-name="Contact Stack"
    >
      {contacts.map((contact, i) => {
        const slot = slotOf(i);
        return (
          <StackedCard
            key={contact.name}
            contact={contact}
            flow={flow}
            slot={slot}
            count={count}
            open={open}
            /* The card on top deals the next one; any card behind it takes the
               cut to itself. Both are the same move — the deck turns by however
               many places the press asked for — so a press on the front and a
               press on the back card animate identically. */
            onSelect={() => setCut(c => (c + (slot === 0 ? 1 : slot)) % count)}
            label={
              slot === 0
                ? count > 1
                  ? "Show the next contact"
                  : contact.name
                : `Show ${contact.name}`
            }
          />
        );
      })}

      {/* How many cards are in the deck, on the deck. Drawn last so it sits
          over every layer, and positioned against the stack's own geometry
          rather than the panel's — see StackCount. */}
      <StackCount count={count} open={open} />

      {/* The treatments are decorative to a screen reader, which cannot see a
          stack at all. The button used to carry the number — "Reveal all 3
          contacts" — and no longer does, so the fact is stated here instead of
          being lost with the label. */}
      {count > 1 && <span className="sr-only">{`${count} contacts at this company`}</span>}
    </div>
  );
}

/* ── the modal ──────────────────────────────────────────────────────
   Figma 5:133 — the same company's contacts in the Prospect Details modal,
   where the panel has the width to set a contact out in full.

   The stack is drawn differently there, and the difference is the point. On
   the row it steps sideways, because the row has width to spare and no height
   to give. In the modal it steps down and narrows — the front card at the
   panel's full width, each card behind 11 narrower and 7 lower:

     front   left  0   top  0   452 wide
     middle  left  5   top  7   441 wide
     back    left 11   top 14   430 wide

   Every card keeps its own 75px height, so the cards behind show as edges at
   the foot of the one in front rather than as shorter cards. Nothing is
   scaled, dimmed or shadowed; each carries its own veil, and the tint of one
   card against the white of the next is what separates them. */

const MODAL_CARD_H = 75;
const MODAL_DROP = 7;
/** Narrower by 11 a card, which the node centres — 5.5 a side. */
const MODAL_NARROW = 11;

export function ContactStackModal({
  company,
  contacts,
}: {
  company: string;
  contacts: ProspectContact[];
}) {
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;
  if (!count) return null;

  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Contact Deck">
      <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
        <GroupHeading company={company} count={count} revealed={flow.revealed} />
        {flow.revealed && <RevealedBadge count={count} />}
      </div>

      {/* Sealed, the node's stack. Opened, the modal has the room to show every
          contact at once and does — the cards fall into an ordinary list, which
          is what the panel is for. The margins are what animate, so the stack
          opens into the list rather than being replaced by it. */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        {contacts.map((contact, i) => {
          const behind = i > 0;
          const stacked = flow.locked;
          return (
            <div
              key={contact.name}
              className="relative w-full"
              /* 43:3335's own treatment, and it is the row's argument again at
                 the modal's scale: the front card takes the flat #f4f2f0 and a
                 2px white ring, and the layers behind take a flat grey that
                 darkens with depth. The ring is the reason the front card's
                 contents start 4 in rather than 2 — 2 for the ring and 2 for
                 the band beside it — which is what puts its avatar on the
                 node's own x of 14. Only while stacked: opened, the cards fall
                 into a plain list and there is no deck left to cut away from.
                 See index.css. */
              data-modal-front={stacked && !behind ? "" : undefined}
              data-modal-behind={stacked && behind ? Math.min(i, 2) : undefined}
              style={{
                width: stacked && behind ? `calc(100% - ${i * MODAL_NARROW}px)` : "100%",
                marginLeft: stacked && behind ? (i * MODAL_NARROW) / 2 : 0,
                marginTop: !behind ? 0 : stacked ? -(MODAL_CARD_H - MODAL_DROP) : 12,
                zIndex: count - i,
                transition: `margin-top ${DUR}ms ${EASE}, margin-left ${DUR}ms ${EASE}, width ${DUR}ms ${EASE}`,
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
                layout="modal"
                className="w-full"
                reveal={
                  /* On the face of the stack, not under it — the same slot and
                     the same centring the prospect row already uses, so one
                     button sits on the thing it unlocks in both places.

                     Below the stack it was a second object to find, and it
                     left a band of empty panel between the cards and itself
                     that read as the tab having run out of content. Inside
                     the front card that space closes on its own; nothing here
                     sets a height.

                     The card behind the front one keeps no button of its own:
                     the reveal is the company's, one press for all of them,
                     so only i === 0 is given it. */
                  i === 0 && flow.locked ? (
                    /* Figma 8:434 "Label Button" — and it is the CTA the
                       module already builds, not a new one. The node is a
                       12% tint of the product's ink behind ink-coloured
                       text, 8 by 4 at radius 6, 4px to a 12px eye-off, 11 on
                       18: which is `soft` at `sm` exactly, both of them
                       already in RevealCta's own tables. The eye-off is the
                       component's own mark, the same glyph the node exports,
                       so nothing was downloaded to draw it.

                       It was primary at md — a solid dark pill. Sitting on
                       the face of a card rather than under it, that was the
                       heaviest thing in the panel, and it covered the
                       contact it is offering to show. The tinted one reads
                       as something laid over the card instead of something
                       blocking it, which is also what the prospect row has
                       always drawn here. */
                    <RevealCta
                      flow={flow}
                      count={count}
                      label={revealAllCountLabel(count)}
                      tone="soft"
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
