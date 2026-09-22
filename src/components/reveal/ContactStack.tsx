import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import { RevealCta, revealCountLabel } from "./variations/parts";

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
const TAG_SEALED = { size: 8.5, labelSize: 9.5, medium: true, className: "absolute right-[8px] top-[3px]" };
const TAG_OPEN = { size: 9.5, className: "absolute right-[10px] top-[3px]" };

/**
 * The motion.
 *
 * One curve, no overshoot: the brief asks for polished and subtle rather than
 * playful, and a card that passes its mark and comes back is the opposite of
 * that on a row being scanned. Fast out and long on the settle is what keeps
 * it from reading as mechanical without anything bouncing.
 */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUR = 280;

const slotStyle = (slot: number, open: boolean) => ({
  width: PANEL_W,
  height: CARD_H - slot * SHRINK,
  right: 0,
  top: slot * DROP,
  transform: `translateX(${-slot * (open ? STEP_OPEN : STEP_SEALED)}px)`,
  /* Cut to the slot's height rather than scaled into it, so the corner showing
     at the left keeps the node's 12px round and the contact is never squashed. */
  overflow: "hidden",
  transition: `transform ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, top ${DUR}ms ${EASE}`,
});

/** One card in the stack, and the press that brings it to the front. */
function StackedCard({
  contact,
  flow,
  slot,
  count,
  open,
  onSelect,
}: {
  contact: ProspectContact;
  flow: ReturnType<typeof useCompanyRevealFlow>;
  slot: number;
  count: number;
  open: boolean;
  onSelect: () => void;
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
      className={`absolute rounded-[12px] ${open && !front ? "cursor-pointer" : ""}`}
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
  const [frontName, setFrontName] = useState(contacts[0]?.name ?? "");

  /* A row can be re-used for another company as the list filters or sorts, so
     the front follows whoever this company's first contact now is. */
  useEffect(() => {
    if (!contacts.some(c => c.name === frontName)) setFrontName(contacts[0]?.name ?? "");
  }, [contacts, frontName]);

  if (!count) return null;

  /* Sealed there is nothing to choose between, so the dataset's order stands
     and a press means "reveal". Disclosed, the front is whoever was pressed. */
  const frontIndex = open ? Math.max(0, contacts.findIndex(c => c.name === frontName)) : 0;
  const order = [frontIndex, ...contacts.map((_, i) => i).filter(i => i !== frontIndex)];

  return (
    <div
      className="content-stretch flex flex-col items-end relative shrink-0"
      style={{ width: PANEL_W, height: CARD_H }}
      data-name="Contact Stack"
    >
      {contacts.map((contact, i) => (
        <StackedCard
          key={contact.name}
          contact={contact}
          flow={flow}
          slot={order.indexOf(i)}
          count={count}
          open={open}
          onSelect={() => setFrontName(contact.name)}
        />
      ))}
    </div>
  );
}
