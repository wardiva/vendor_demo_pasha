import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import svgPaths from "@/imports/BuyerActivityLeads/svg-ry772luhk7";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import RevealContactButton from "@/components/reveal/RevealContactButton";
import { REVEAL_DELAY, showButtonLoader } from "@/components/reveal/revealMechanics";
import { fireConfettiFrom } from "@/components/reveal/confetti";
import IntentTag from "@/components/IntentTag";
import LinkedInMark from "@/components/LinkedInMark";

import visitedGlyph from "./assets/icon-visited.svg";
import { contactId, useProspectReveal } from "@/context/ProspectRevealContext";
import { withoutYear } from "@/data/demoDates";
import type { Prospect, ProspectContact } from "@/data/prospects";

/**
 * A prospect card on the Prospects page.
 *
 * Every prospect is company-level, so the card is the imported company card —
 * logo, name, domain, intent meter, firmographics and date — rendered from
 * data instead of seven copies of static markup. Prospects with an identified
 * contact carry the Contact Reveal section on the right; the rest do not.
 *
 * Structure and classes are the export's own, so the card renders exactly as
 * the imported company cards did.
 */

/* ─────────────────────────── icons ─────────────────────────── */

function IndustryIcon() {
  return (
    /* #2F2B3D at 70% — rgba(47, 43, 61, 0.7) — matching the muted text beside
       it. The 70% sits on the group rather than on a path or the wrapper: the
       glyph composites once, so the roofline strokes that overlap stay the
       same weight as the rest of the mark. */
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <div className="absolute inset-[9.38%_18.75%_14.24%_12.5%]">
        <div className="absolute inset-[-4.91%_-5.45%]">
          <svg
            className="block size-full"
            fill="none"
            height="13.421"
            preserveAspectRatio="none"
            viewBox="0 0 12.2 13.421"
            width="12.2"
          >
            <g opacity="0.7">
              <path d={svgPaths.p3e38d580} stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              <path d={svgPaths.pbe01f80} stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              <path d="M8.54385 0.600008H9.15496" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

/** The calendar mark the design puts beside the visited date. */
function VisitedIcon() {
  return (
    /* #2F2B3D at 70% — rgba(47, 43, 61, 0.7) — matching the muted text beside
       it, and applied once. The export already draws every stroke at that
       colour and that alpha, so the wrapper's own 70% on top of it composited
       to 0.49 and the mark read lighter than the date it labels and than the
       industry mark next to it. The alpha lives in the asset; nothing here
       dims it again. */
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={visitedGlyph} />
    </div>
  );
}

/* ─────────────────────── firmographic detail row ─────────────────────── */

function DetailRow({ icon, value, leading = "19px" }: { icon: ReactNode; value: string; leading?: string }) {
  return (
    /* The whole card is one clickable surface, so its rows opt out of the
       selectable-row hover. */
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Row" data-no-row-hover>
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Row" data-no-row-hover>
        {icon}
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          <p style={{ lineHeight: leading }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── contact reveal section ─────────────────────── */

/**
 * The locked contact beside a company prospect.
 *
 * Locked, it shows nothing but the avatar, phone number and verification mark
 * under the shared veil, with the Reveal Contact control sharp above it — the
 * same treatment the contact-level cards carried. Name, job title, email,
 * LinkedIn and notes are not in this card at all.
 */
function ContactRevealSection({ company, contact }: { company: string; contact: ProspectContact }) {
  const { revealed, requestReveal, completeReveal } = useProspectReveal();
  /* Keyed by the contact, not the card, so the modal's copy of this person
     reads the same revealed state. */
  const id = contactId(company, contact.name);
  const isRevealed = revealed.has(id);
  /* Held until the ring and shadow have faded, after which the section is
     styled like any other settled card. */
  const [settled, setSettled] = useState(isRevealed);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);
  const locked = !isRevealed;

  /* Filters can hide a card mid-reveal, so nothing lands after unmount. */
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* Same sequence as the contact card it replaces: loader in the button, then
     the reveal, the burst from the button, and the locked treatment fading
     out. The card itself never moves — the button is absolutely positioned
     and the revealed fields were always in the layout. */
  const handleReveal = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pending.current || isRevealed) return;
    /* Out of allowance — this opens the Buy More flow and leaves it locked. */
    if (!requestReveal(id)) return;
    pending.current = true;

    const btn = btnRef.current;
    const restore = btn ? showButtonLoader(btn) : () => {};

    timers.current.push(
      window.setTimeout(() => {
        pending.current = false;
        restore();
        /* Measured while the button is still on screen, so the burst launches
           from the button rather than the card. */
        const origin = btn?.getBoundingClientRect();
        if (origin) fireConfettiFrom(origin);
        completeReveal(id, contact.phone);
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  return (
    <ContactPreviewCard
      variant={contact.variant}
      avatar={contact.avatar}
      name={contact.name}
      jobTitle={contact.jobTitle}
      phone={contact.phone}
      email={contact.email}
      locked={locked}
      settled={settled}
      className="w-[310px]"
      reveal={
        locked ? (
          /* 219:1041 centres the control on the panel in both axes, half a
             pixel left and half a pixel down, which is the design's own
             rounding of a 111x26 button inside a 310x59 card. */
          <RevealContactButton
            ref={btnRef}
            onClick={handleReveal}
            variant="label-sm"
            className="absolute left-[calc(50%-0.5px)] top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 z-[3]"
          />
        ) : undefined
      }
    />
  );
}

/* ─────────────────────────── the card ─────────────────────────── */

export default function ProspectCard({ prospect }: { prospect: Prospect }) {
  return (
    <div
      className="bg-white content-stretch cursor-pointer flex items-center justify-between pl-[8px] pr-[4px] py-[4px] relative rounded-[16px] shrink-0 w-full"
      data-name="Card"
      data-prospect-id={prospect.id}
    >
      {/* The design fixes the company block at 554px and the contact panel at
          381px, so justify-between leaves a constant gap between the two
          rather than letting the company block stretch. */}
      <div
        className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-[554px]"
        data-name="Populer Plan"
      >
        <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-center min-w-px relative">
          {/* 219:981 — the logo comes down to 48px, on the same 8px radius. */}
          <div className="relative rounded-[8px] shrink-0 size-[48px]" data-name="Logo">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[8px] size-full"
              src={prospect.logo}
            />
          </div>

          {/* 219:982 — two lines now, 5px apart: the design drops the domain
              from the card and leaves the name over the firmographics. */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start min-w-px relative">
            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                  <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[21px] relative shrink-0 text-[#2f2b3d] text-[15px] whitespace-nowrap">
                    {prospect.name}
                  </p>
                  <LinkedInMark size={16} />
                </div>
              </div>
            </div>

            {/* Industry, visited date and Intent Score share one row */}
            <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
              <DetailRow icon={<IndustryIcon />} value={prospect.industry} />
              {/* The year is dropped on the card — the record keeps it, so
                  sorting and the date filter still read the full value. */}
              <DetailRow icon={<VisitedIcon />} value={withoutYear(prospect.date)} />
              <IntentTag score={prospect.intentPct} compact />
            </div>
          </div>
        </div>
      </div>

      {prospect.contact && <ContactRevealSection company={prospect.name} contact={prospect.contact} />}
    </div>
  );
}
