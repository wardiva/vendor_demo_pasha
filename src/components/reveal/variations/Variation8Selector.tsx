import { useEffect, useState } from "react";
import ContactTag from "@/components/ContactTag";
import CopyableValue from "@/components/CopyableValue";
import LinkedInMark from "@/components/LinkedInMark";
import MailIcon from "@/components/MailIcon";
import PhoneIcon from "@/components/PhoneIcon";
import avatarUnrevealed from "@/components/contacts/assets/avatar-unrevealed.svg";
import { useCompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";
import Variation2Grouped from "./Variation2Grouped";
import { RevealCta, RevealedBadge, availableLabel, type RevealPanelProps } from "./parts";

/**
 * Variation 8 — grouped, then a contact selector.
 *
 * Variation 2's structure, carried forward: the company is the unit, its
 * people are one object, and one control opens all of them. What changes is
 * everything after the press.
 *
 * Sealed, the group is drawn as three positions whatever the company actually
 * holds. A company with one contact shows one portrait and two empty seats, so
 * the ceiling is legible before anything is spent: this is a company that can
 * hold up to three, and this is how many of them we have. Three cards that
 * happen to be one card tell the vendor nothing about what they are buying;
 * one filled seat beside two empty ones tells them exactly.
 *
 * The cost line is gone. It said "uses 1 contact reveal" beside a control that
 * opens three people, which is a sentence the reader has to reconcile rather
 * than one that helps them. The single action over the whole group says the
 * same thing structurally — there is no per-person control to press, so there
 * is no per-person price to wonder about — and the stack above it says how many
 * that action covers.
 *
 * Opened, the group becomes a selector rather than a list of cards. One contact
 * holds the primary position with their details out in full; the others sit
 * beneath as rows the vendor can press to bring up. Nothing is hidden behind a
 * click — every name and title is on screen the whole time — so the press is a
 * focus change, not a disclosure, and it costs nothing.
 *
 * Card only. The Prospect Details modal is Variation 2's, untouched: the model
 * being tried here is about the row, and changing the modal underneath it would
 * make the comparison between this concept and its parent unreadable.
 */

/* The ceiling the group is drawn against, filled or not. */
const SEATS = 3;

/* ── the opened list's geometry ──
   The active row carries a name, a title and two channels; the others carry a
   name and a title. Fixed heights because the rows are placed rather than
   flowed — see ContactSelector — and a row has to know where it is going. */
const ACTIVE_H = 44;
const IDLE_H = 26;
const ROW_GAP = 4;

/** Where row `slot` sits, counting the taller active row at the top. */
const slotOffset = (slot: number) => (slot === 0 ? 0 : ACTIVE_H + ROW_GAP + (slot - 1) * (IDLE_H + ROW_GAP));

/** The whole list's height, so the card reserves exactly what it uses. */
const listHeight = (n: number) => (n ? slotOffset(n - 1) + (n === 1 ? ACTIVE_H : IDLE_H) : 0);

/* ─────────────────────────── sealed ─────────────────────────── */

/**
 * The group as three seats.
 *
 * The filled ones are the company's people behind the placeholder portrait —
 * the same withheld avatar every sealed contact in the product shows. The empty
 * ones are drawn as outlines in the card's own ink: present enough to count,
 * quiet enough that nobody mistakes a seat for a person.
 */
function SeatStack({ contacts, size = 26 }: { contacts: ProspectContact[]; size?: number }) {
  const overlap = Math.round(size * 0.32);
  const seats = Array.from({ length: SEATS }, (_, i) => contacts[i] ?? null);
  return (
    <div className="flex items-center shrink-0" aria-hidden data-name="Seat Stack">
      {seats.map((contact, i) => (
        <span
          key={contact ? contact.name : `empty-${i}`}
          className="relative block rounded-[100px] shrink-0 bg-white"
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: SEATS - i,
            boxShadow: "0 0 0 2px #ffffff",
          }}
        >
          {contact ? (
            <img
              alt=""
              className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
              src={avatarUnrevealed}
            />
          ) : (
            /* An unfilled seat. A dashed ring on the card's tint rather than a
               greyed portrait: there is no person here to grey out, and drawing
               one would promise a contact the reveal cannot deliver. */
            <span
              className="absolute inset-0 rounded-[100px]"
              style={{
                border: "1px dashed rgba(47,43,61,0.22)",
                background: "rgba(244,242,240,0.6)",
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────── opened ─────────────────────────── */

/**
 * One contact, in whichever position the selection has put them.
 *
 * The row draws both states and crosses between them rather than swapping its
 * contents: the avatar scales, the channels fade up, and the whole row slides
 * to its new slot. Nothing is mounted or unmounted on a selection change, so
 * there is no reflow to see and the transition is the browser's own — two
 * properties on each row, which is what keeps this a focus change rather than
 * a re-render the eye has to follow.
 */
function ContactRow({
  contact,
  active,
  slot,
  onSelect,
}: {
  contact: ProspectContact;
  active: boolean;
  slot: number;
  onSelect: () => void;
}) {
  const size = active ? 32 : 22;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`Show ${contact.name}`}
      onClick={e => {
        /* The card behind opens the Prospect Details modal; picking a contact
           inside the panel is not a press on the card. */
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={e => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }}
      data-name="Contact Row"
      data-no-row-hover
      /* The page's click delegate runs on the capture phase and would open the
         Prospect Details modal before this row's own handler could pick a
         contact. This is what tells it the press belongs here. */
      data-contact-select
      className={`absolute content-stretch flex gap-[8px] items-center left-0 px-[6px] rounded-[8px] top-0 transition-[transform,height,background-color] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full ${
        active ? "bg-[rgba(244,242,240,0.6)]" : "cursor-pointer hover:bg-[rgba(244,242,240,0.45)]"
      }`}
      style={{
        height: active ? ACTIVE_H : IDLE_H,
        transform: `translateY(${slotOffset(slot)}px)`,
      }}
    >
      {/* The portrait. It is the control the brief asks for — the thing a
          vendor presses to bring a contact up — so it carries the selected
          state itself: a ring in the product's ink, at the weight the module
          uses for a quiet emphasis rather than a highlight. */}
      <span
        className="relative block rounded-[100px] shrink-0 transition-[width,height,box-shadow] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          width: size,
          height: size,
          boxShadow: active ? "0 0 0 2px #ffffff, 0 0 0 3px rgba(7,41,41,0.45)" : "0 0 0 2px #ffffff",
        }}
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
          src={contact.avatar}
        />
      </span>

      <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-w-px relative">
        <div className="content-stretch flex gap-[4px] items-center max-w-full min-w-px relative shrink-0 w-full">
          <p
            className={`[word-break:break-word] font-['Inter',sans-serif] leading-[18px] overflow-hidden relative shrink text-ellipsis whitespace-nowrap transition-[color,font-size] duration-[260ms] ${
              active ? "font-medium text-[#2f2b3d] text-[13px]" : "font-normal text-[rgba(47,43,61,0.75)] text-[12px]"
            }`}
          >
            {contact.name}
          </p>
          {/* Both marks stay mounted and cross on opacity: a row that is being
              brought up should change, not be rebuilt. */}
          <span
            className="shrink-0 transition-[opacity,max-width] duration-[220ms] ease-out overflow-hidden"
            style={{ opacity: active ? 1 : 0, maxWidth: active ? 13 : 0 }}
          >
            <LinkedInMark size={13} />
          </span>
          {/* The title, for a row that is not in the primary position: on the
              name's own line, because the row only has one. The active row
              takes it down to the line below, beside the channels. */}
          <p
            className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[16px] min-w-0 not-italic overflow-hidden relative shrink text-[11px] text-[rgba(47,43,61,0.55)] text-ellipsis transition-[opacity,max-width] duration-[220ms] ease-out whitespace-nowrap"
            style={{ opacity: active ? 0 : 1, maxWidth: active ? 0 : 168 }}
          >
            {contact.jobTitle}
          </p>
        </div>

        {/* The title, and — for the contact in the primary position — the two
            channels after it. The channels are height-animated rather than
            mounted, so bringing a contact up opens their details in place
            instead of growing the row from nothing. */}
        <div
          className="content-stretch flex gap-[10px] items-center max-w-full min-w-px overflow-hidden relative shrink-0 transition-[max-height,opacity] duration-[260ms] ease-out w-full"
          style={{ maxHeight: active ? 18 : 0, opacity: active ? 1 : 0 }}
        >
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[18px] not-italic overflow-hidden relative shrink text-[11px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
            {contact.jobTitle}
          </p>
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-no-row-hover>
            <CopyableValue value={contact.phone} className="lead-copy-icon relative shrink-0 size-[14px]">
              <PhoneIcon size={14} />
            </CopyableValue>
            <CopyableValue value={contact.email} className="lead-copy-icon relative shrink-0 size-[14px]">
              <MailIcon size={14} />
            </CopyableValue>
          </div>
        </div>

      </div>

      <ContactTag variant={contact.variant} size={11} labelSize={11} showLabel={false} className="shrink-0" />
    </div>
  );
}

/**
 * The opened group: one contact up, the rest a press away.
 *
 * The rows are placed rather than flowed — each one absolutely positioned and
 * translated to its slot — so a selection change moves them instead of
 * re-ordering the document. That is what makes the swap animate at all: the
 * same three elements stay mounted in the same order and only their transforms
 * and heights differ between one selection and the next.
 */
function ContactSelector({ contacts, count }: { contacts: ProspectContact[]; count: number }) {
  const [activeName, setActiveName] = useState(contacts[0]?.name ?? "");
  /* A card can be re-used for another company as the list filters or sorts,
     so the selection follows whoever the group's first contact now is. */
  useEffect(() => {
    if (!contacts.some(c => c.name === activeName)) setActiveName(contacts[0]?.name ?? "");
  }, [contacts, activeName]);

  const activeIndex = Math.max(0, contacts.findIndex(c => c.name === activeName));
  /* The active contact takes slot 0 — the primary position — and the others
     keep their own order beneath it. */
  const order = [activeIndex, ...contacts.map((_, i) => i).filter(i => i !== activeIndex)];

  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[310px]">
      <RevealedBadge count={count} size="sm" className="pl-[6px]" />
      <div className="relative shrink-0 w-full" style={{ height: listHeight(contacts.length) }}>
        {contacts.map((contact, i) => (
          <ContactRow
            key={contact.name}
            contact={contact}
            active={i === activeIndex}
            slot={order.indexOf(i)}
            onSelect={() => setActiveName(contact.name)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── the panel ─────────────────────────── */

export default function Variation8Selector(props: RevealPanelProps) {
  const { company, contacts, layout } = props;
  const flow = useCompanyRevealFlow(company, contacts.length);
  const count = contacts.length;

  /* The modal is Variation 2's, unchanged — this concept is the card's. */
  if (layout === "modal") return <Variation2Grouped {...props} />;

  if (!count) return null;

  if (flow.revealed) return <ContactSelector contacts={contacts} count={count} />;

  return (
    <div
      onClick={() => flow.reveal()}
      className="bg-[rgba(244,242,240,0.6)] content-stretch cursor-pointer flex gap-[10px] h-[59px] items-center px-[12px] py-[8px] relative rounded-[12px] shrink-0 w-[310px]"
      data-name="Contact Group"
    >
      <SeatStack contacts={contacts} />
      <div className="content-stretch flex flex-col items-start min-w-px relative shrink">
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic overflow-hidden shrink-0 text-[#2f2b3d] text-[13px] text-ellipsis whitespace-nowrap">
          {availableLabel(count)}
        </p>
        {/* What the seats mean, where the cost line used to be: the ceiling the
            stack is drawn against, so three portraits and one portrait are read
            against the same scale. */}
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[18px] not-italic shrink-0 text-[11px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          {`of up to ${SEATS} at this company`}
        </p>
      </div>
      <RevealCta
        flow={flow}
        count={count}
        label={count === 1 ? "Reveal" : "Reveal all"}
        size="sm"
        className="ml-auto shrink-0"
      />
    </div>
  );
}
