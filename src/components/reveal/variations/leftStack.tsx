import { useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import type { CompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import { RevealCta, revealCountLabel } from "./parts";

/**
 * What the left-stacking concepts are built from.
 *
 * Three designs share one set of decisions, because the decisions are what the
 * brief is about and only the arrangement is being compared. They all stack
 * from the left rather than from below, they all keep the row to the height of
 * a single card, they all carry the same soft elevation, and they all move on
 * the same curve. What differs between them is where a card that is not in
 * front goes and what it looks like when it gets there.
 *
 * Stacking sideways is the substantive change. A stack that grew downward paid
 * for every extra contact in row height and pushed the list below it around;
 * these spend width instead — of which the row has plenty, the panel sitting
 * against the right edge with the company block far off to the left — so a
 * company with three contacts takes exactly as much of the page as a company
 * with one.
 */

/** The contact card's own height. Every one of these keeps the row to it. */
export const CARD_H = 59;

/** The panel's slot on the prospect row. */
export const PANEL_W = 310;

/**
 * The curve everything moves on.
 *
 * Fast out of the gate and long on the settle, which is what makes a card read
 * as something with weight arriving rather than a box being repositioned. The
 * overshoot curve is for the card being brought forward — a few pixels past
 * its mark and back is the whole of the "fun", and it is deliberately not
 * applied to the cards moving out of the way, which should feel like they are
 * yielding rather than competing.
 */
export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_BACK = "cubic-bezier(0.34, 1.4, 0.64, 1)";
export const DUR = 320;

/**
 * The elevation, at the weight a card resting on a surface actually has.
 *
 * The previous stack read as cards floating over the row rather than lying on
 * it. These are a contact shadow and a soft ambient one, both at a fraction of
 * the old opacity: enough to tell two overlapping cards apart, not enough to
 * lift either of them off the page.
 */
export const SHADOW_FRONT =
  "drop-shadow(0 1px 1px rgba(47,43,61,0.06)) drop-shadow(0 3px 6px rgba(47,43,61,0.05))";
export const SHADOW_BACK = "drop-shadow(0 1px 1.5px rgba(47,43,61,0.05))";

/**
 * The status tag as Figma 0:1536 draws it on this card.
 *
 * An 8.5px mark beside a 9.5px label in medium, 8px in from the right —
 * smaller than the tag the contact card carries elsewhere in the product. The
 * design is deciding that the word sits quietly beside the contact rather than
 * competing with it, which is what lets it stay sharp above the veil without
 * reading as the loudest thing on a sealed card.
 *
 * The top offset is 3 rather than the node's 6 because the two boxes are not
 * the same height. The node's tag is 16 tall and starts at 6, which puts the
 * mark's centre at 14; the tag here is 22 — the label's line box, which the
 * component sets and the node leaves at normal — and centres its contents, so
 * it has to start at 3 to land that same 14. The mark is what should read as
 * 8px in from the corner, so the mark is what is matched.
 */
export const NODE_TAG = {
  size: 8.5,
  labelSize: 9.5,
  medium: true,
  className: "absolute right-[8px] top-[3px]",
};

/**
 * Which contact is in front, and the order the rest sit in behind them.
 *
 * Sealed, the question does not arise: there is nothing to choose between yet,
 * so the dataset's order stands and the press means "reveal". Opened, the
 * front is whoever was last pressed.
 */
export function useFrontContact(contacts: ProspectContact[], open: boolean) {
  const [frontName, setFrontName] = useState(contacts[0]?.name ?? "");

  /* A card can be re-used for another company as the list filters or sorts,
     so the front follows whoever this company's first contact now is. */
  useEffect(() => {
    if (!contacts.some(c => c.name === frontName)) setFrontName(contacts[0]?.name ?? "");
  }, [contacts, frontName]);

  const frontIndex = open ? Math.max(0, contacts.findIndex(c => c.name === frontName)) : 0;
  /* The front, then the others in their own order — a press promotes one card
     and disturbs nothing else. */
  const order = [frontIndex, ...contacts.map((_, i) => i).filter(i => i !== frontIndex)];
  /** A contact's place in the stack: 0 is in front. */
  const slotOf = (i: number) => order.indexOf(i);

  return { frontIndex, slotOf, setFront: setFrontName };
}

/**
 * A contact card in a stack, with the press that brings it forward.
 *
 * The card itself is the product's own — the same component, the same veil
 * while the company is sealed, the same contents once it is open — and this
 * only places it and decides what a press on it means. Sealed, a press is the
 * reveal, which is the card's own behaviour and is left alone; opened, it is
 * the selection.
 */
export function StackCard({
  contact,
  flow,
  front,
  open,
  count,
  onSelect,
  style,
  tag,
  children,
}: {
  contact: ProspectContact;
  flow: CompanyRevealFlow;
  front: boolean;
  open: boolean;
  count: number;
  onSelect: () => void;
  style: CSSProperties;
  /** The status tag's scale, for a concept whose design sets its own. */
  tag?: { size?: number; labelSize?: number; medium?: boolean; className?: string };
  /** Anything the concept draws over the card — a scrim, a grip, a label. */
  children?: ReactNode;
}) {
  const select = (e: MouseEvent<HTMLDivElement>) => {
    /* The channels on a disclosed card copy when pressed. That press is the
       value's, not the stack's, so it never promotes the card. */
    const target = e.target as HTMLElement;
    if (target.closest("[data-copy-row]") || target.closest(".lead-copy-icon")) return;
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      role={open ? "button" : undefined}
      tabIndex={open && !front ? 0 : undefined}
      aria-pressed={open ? front : undefined}
      aria-label={open ? `Show ${contact.name}` : undefined}
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
      className={`absolute rounded-[12px] top-0 ${open && !front ? "cursor-pointer" : ""}`}
      style={style}
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
        tag={tag}
        className="w-full"
        reveal={
          /* One control, on the face of the stack, while the company is sealed. */
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
      {children}
    </div>
  );
}

/**
 * A company with one contact: a card, and nothing done to it.
 *
 * No stack to suggest, so no offset, no scale and no shadow — a single contact
 * is an ordinary contact card in the row, which is what every other surface in
 * the product shows. Shared by all three concepts so they cannot disagree
 * about it.
 */
export function LoneCard({
  contact,
  flow,
  tag,
}: {
  contact: ProspectContact;
  flow: CompanyRevealFlow;
  /** The status tag's scale, so a lone card matches the concept's stack. */
  tag?: { size?: number; labelSize?: number; medium?: boolean; className?: string };
}) {
  return (
    /* The panel's own width, stated here rather than inherited: this is
       rendered straight into the prospect row, where `w-full` would let the
       card run the length of it. */
    <div className="relative shrink-0" style={{ width: PANEL_W, height: CARD_H }}>
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
        tag={tag}
        className="w-full"
        reveal={
          flow.locked ? (
            <RevealCta
              flow={flow}
              count={1}
              label={revealCountLabel(1)}
              size="sm"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]"
            />
          ) : undefined
        }
      />
    </div>
  );
}

/** The panel every one of these sits in: the row's slot, one card tall. */
export function StackFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ width: PANEL_W }}
      data-name="Contact Deck"
    >
      <div className="relative shrink-0 w-full" style={{ height: CARD_H }}>
        {children}
      </div>
    </div>
  );
}
