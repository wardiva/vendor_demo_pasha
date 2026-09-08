import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { getCompanyNote } from "@/data/companyDetails";
import noteGripGlyph from "./assets/icon-note-grip.svg";
import {
  TECH_LOGOS,
  type ActivityEntry,
  type ContactEntry,
  type TechEntry,
} from "@/data/companyDetails";
import verifiedBadge from "@/components/assets/verified-badge.png";
import CompanyFieldIcon from "./CompanyFieldIcon";
import activityDot from "./assets/activity-dot.svg";
import linkedinGlyph from "./assets/contact-linkedin.svg";
import ContactTag, { type ContactVariant } from "@/components/ContactTag";
import CopyableValue from "@/components/CopyableValue";
import { contactId, useProspectReveal } from "@/context/ProspectRevealContext";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import RevealContactButton from "@/components/reveal/RevealContactButton";
import { REVEAL_DELAY, showButtonLoader } from "@/components/reveal/revealMechanics";
import { fireConfettiFrom } from "@/components/reveal/confetti";

/**
 * The three non-default panels of the Company Info modal.
 * Figma: 23:1556 (Tech Stack), 23:1689 (Activity), 23:1841 (Recommended Contacts).
 */

/* ─────────────────────── Company Tech Stack ─────────────────────── */

function TechLogoMark({ tool }: { tool: string }) {
  const logo = TECH_LOGOS[tool];
  if (!logo) return null;
  const { src, box, mask, flip, clip } = logo;

  /* The glyph sits inside its designed outer box rather than filling a
     single shared square, so marks keep their intended proportions. */
  return (
    <div
      className={`relative shrink-0 ${clip ? "overflow-clip" : ""}`}
      style={{ width: box.w, height: box.h }}
    >
      {mask ? (
        <div
          className="absolute inset-0"
          style={{
            maskImage: `url("${mask}")`,
            maskSize: `${box.w}px ${box.h}px`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        >
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={src} />
        </div>
      ) : (
        <img
          alt=""
          className="absolute block inset-0 max-w-none size-full"
          src={src}
          style={flip ? { transform: "rotate(180deg) scaleX(-1)" } : undefined}
        />
      )}
    </div>
  );
}

function TechCell({ entry, fixedWidth }: { entry: TechEntry; fixedWidth: boolean }) {
  return (
    <div
      className={`content-stretch flex flex-col gap-[6px] items-start relative ${
        fixedWidth ? "shrink-0 w-[202px]" : "flex-[1_0_0] min-w-px"
      }`}
    >
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        <p className="leading-[19px]">{entry.category}</p>
      </div>
      <div className="content-stretch flex gap-[6px] h-[24px] items-center relative shrink-0">
        <TechLogoMark tool={entry.tool} />
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[#2f2b3d] whitespace-nowrap">
          <p className="leading-[22px]">{entry.tool}</p>
        </div>
      </div>
    </div>
  );
}

export function TechStackPanel({ entries }: { entries: TechEntry[] }) {
  if (!entries.length) return <PanelEmptyState label="tech stack" />;

  /* Two columns per row, matching the design's 202px + flexible split. */
  const rows: TechEntry[][] = [];
  for (let i = 0; i < entries.length; i += 2) rows.push(entries.slice(i, i + 2));

  return (
    <div className="bg-white content-stretch flex flex-col items-start relative rounded-[6px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
        {rows.map((row, i) => (
          <div key={i} className="content-stretch flex gap-[44px] items-center relative shrink-0 w-full">
            {row.map((entry, j) => (
              <TechCell key={entry.category} entry={entry} fixedWidth={j === 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Activity ─────────────────────────── */

export function ActivityPanel({ entries }: { entries: ActivityEntry[] }) {
  if (!entries.length) return <PanelEmptyState label="activity" />;

  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      {entries.map((entry, i) => (
        <div key={i} className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
          {/* The connector, one segment per gap rather than one rail down the
              whole list. The rail was a single element run to the bottom of the
              container, which is the foot of the last entry's text — so it
              carried on well past the final dot with nothing to join.

              A segment belongs to the entry above the gap it spans, so the last
              entry has none and the line ends exactly on the last dot. Each one
              runs centre to centre: the marker is an 8x15 box holding a circle
              at cy=11 r=4, so 11px down is the middle of the dot, and the next
              one sits a row plus the list's 24px gap below — hence the height.
              It is drawn before the marker, so the dot covers the end of it.

              Same 2px width, same #DDDDE0, same 4-on-4-off dashes, and the same
              left-[3px] that centres it on the circle at x=4. */}
          {i < entries.length - 1 && (
            <div
              aria-hidden
              className="absolute left-[3px] w-[2px] pointer-events-none"
              style={{
                top: 11,
                /* This dot's centre to the next one's: the rest of this row
                   below the centre, the 24px the list gaps by, then the same
                   11px down into the next row — (H - 11) + 24 + 11. */
                height: "calc(100% + 24px)",
                backgroundImage: "repeating-linear-gradient(to bottom, #DDDDE0 0 4px, transparent 4px 8px)",
              }}
            />
          )}
          <div className="h-[15px] relative shrink-0 w-[8px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={activityDot} />
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[0] min-w-px not-italic relative">
            <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
              <div className="flex flex-col font-['Inter',sans-serif] font-medium justify-center relative shrink-0 text-[13px] text-[#2f2b3d]">
                <p className="leading-[21px]">{entry.title}</p>
              </div>
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                <p className="leading-[20px]">{entry.ago}</p>
              </div>
            </div>
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
              <p className="leading-[20px]">{entry.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── Recommended Contacts ─────────────────── */

/** The LinkedIn mark, sized as the card design places it beside the name. */
/* The glyph keeps the export's 5/6 height ratio at whatever size the caller
   asks for, so it never squashes. */
function LinkedInMark({ size = 18 }: { size?: number }) {
  return (
    <div className="relative shrink-0" data-name="linkedin-svgrepo-com 3" style={{ width: size, height: size }}>
      <div
        className="-translate-y-1/2 absolute left-[8.33%] right-[8.33%] top-1/2"
        style={{ height: (size * 14.999) / 18 }}
      >
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={linkedinGlyph} />
      </div>
    </div>
  );
}

function ContactCard({
  company,
  contact,
  variant,
}: {
  company: string;
  contact: ContactEntry;
  variant: ContactVariant;
}) {
  const { revealed: revealedIds, requestReveal, completeReveal } = useProspectReveal();
  /* Keyed by the contact rather than by this card, so a person already
     disclosed on their prospect card opens here already disclosed — and
     revealing them here shows on that card without a second credit. */
  const id = contactId(company, contact.name);
  const revealed = !contact.locked || revealedIds.has(id);
  /* Held until the ring and shadow have faded, then the card is byte-identical
     to a normal Recommended Contact card. */
  const [settled, setSettled] = useState(revealed);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);
  const locked = !revealed;

  /* The modal can close mid-reveal, so nothing lands after unmount. */
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* Same sequence as a Leads page contact card: loader in the button, then the
     reveal, the burst from the button, and the locked treatment fading out.
     Each card owns its own state, so revealing one leaves the others locked. */
  const handleReveal = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pending.current || revealed) return;
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
        completeReveal(id, variant === "verified" ? contact.phone : contact.email);
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  const verified = variant === "verified";

  return (
    /* The same card the Prospects page renders, at the panel's width and with
       the modal's lighter wash under the veil. Which value it discloses is
       still the variant's: the phone for a verified contact, the email for a
       recommended one. */
    <ContactPreviewCard
      variant={variant}
      avatar={contact.avatar}
      name={contact.name}
      jobTitle={contact.jobTitle}
      /* Both channels now, for every contact in the section rather than the
         one its variant used to disclose. */
      phone={contact.phone}
      email={contact.email}
      locked={locked}
      settled={settled}
      layout="modal"
      className="w-full"
      reveal={
        locked ? (
          <RevealContactButton
            ref={btnRef}
            onClick={handleReveal}
            variant="label"
            className="absolute left-1/2 top-[22px] -translate-x-1/2 z-[3]"
          />
        ) : undefined
      }
    />
  );
}

function ContactSection({
  company,
  title,
  heading,
  contacts,
  variant,
}: {
  company: string;
  title: string;
  /**
   * The heading the section shows. Figma 266:1005 writes one over the
   * recommended contacts and none over the verified ones — the tag on each
   * card already says which kind it is, and the recommended group is the one
   * that reads as a group rather than as the contacts themselves. Where there
   * is none, `title` still names the group for assistive tech.
   */
  heading?: string;
  contacts: ContactEntry[];
  variant: ContactVariant;
}) {
  return (
    <div
      role="group"
      aria-label={title}
      className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full"
    >
      {/* 266:1005 — Inter medium 13/20 in the primary ink. */}
      {heading && (
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
          {heading}
        </p>
      )}
      {contacts.length ? (
        /* 266:1006 — the cards, 12px apart. */
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          {contacts.map(contact => (
            <ContactCard key={contact.name} company={company} contact={contact} variant={variant} />
          ))}
        </div>
      ) : (
        <PanelEmptyState label={title.toLowerCase()} />
      )}
    </div>
  );
}

/**
 * The Contacts tab: verified contacts first, then the AI recommended ones.
 * A hairline rule separates the two without breaking the panel into cards of
 * its own, and each contact still reveals on its own.
 */
/** The tab surfaces a single verified contact, however many the company has. */
const VERIFIED_CONTACT_LIMIT = 1;

export function ContactsPanel({
  company,
  verified,
  recommended,
}: {
  company: string;
  verified: ContactEntry[];
  recommended: ContactEntry[];
}) {
  return (
    /* 266:966 — 20px between the disclosed contacts and the recommended group
       below them, which is what sets that group apart from the cards above it
       now that it carries a heading of its own. */
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
      {/* A section a company has nothing for is left out entirely rather than
          rendering an empty heading — a prospect with only AI recommended
          contacts shows no verified section at all. */}
      {verified.length > 0 && (
        <ContactSection
          company={company}
          title="Verified Contacts"
          contacts={verified.slice(0, VERIFIED_CONTACT_LIMIT)}
          variant="verified"
        />
      )}
      {recommended.length > 0 && (
        <ContactSection
          company={company}
          title="AI Recommended Contacts"
          heading="AI Recommended"
          contacts={recommended}
          variant="recommended"
        />
      )}
      {verified.length === 0 && recommended.length === 0 && (
        <PanelEmptyState label="contacts" />
      )}
    </div>
  );
}

/* ─────────────────────────── notes ─────────────────────────── */

/**
 * The Notes tab — Figma 181:6779.
 *
 * The heading and the column's own padding come from DetailModal, as they do
 * for every other tab; this is the card beneath it. That card is the framed
 * shell the disclosed contact cards use — a 2px tint showing around a white
 * inner at 10px — held at the design's 159px with the note at the top and the
 * resize grip pinned to the bottom right.
 *
 * The prose is the design's, but the tool it names and the category it
 * compares against are the prospect's own, so the note reads about the company
 * whose modal is open rather than about the sample in the file.
 */
export function NotesPanel({ company }: { company: string }) {
  const note = getCompanyNote(company);
  if (!note) return <PanelEmptyState label="notes" />;

  return (
    <div
      className="bg-[rgba(244,242,240,0.6)] content-stretch flex h-[159px] items-start p-[2px] relative rounded-[12px] shrink-0 w-full"
      data-name="Card"
    >
      <div className="bg-white content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-w-px pb-[8px] pt-[12px] px-[10px] relative rounded-[10px]">
        {/* whitespace-normal: the detail column sets nowrap for the label rows
            that fill every other tab, and this is a paragraph. */}
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[0px] text-[rgba(47,43,61,0.7)] w-full">
          <p className="font-['Inter',sans-serif] font-normal not-italic text-[14px] whitespace-normal">
            <span className="leading-[19px]">{`The buyer currently uses `}</span>
            <span className="leading-[19px] text-black">{note.tool}</span>
            <span className="leading-[19px]">
              {` but is facing challenges with reporting and workflow complexity. They are researching other ${note.category} tools and showing strong intent to switch to a solution that better fits their needs. `}
            </span>
          </p>
        </div>
        <div className="content-stretch flex items-center justify-end pb-[2px] pt-px relative shrink-0 w-full">
          <div className="relative shrink-0 size-[16px]" data-name="Frame">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={noteGripGlyph} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── shared ─────────────────────────── */

function PanelEmptyState({ label }: { label: string }) {
  return (
    <p className="font-['Inter',sans-serif] font-normal leading-[22px] shrink-0 text-[14px] text-[rgba(47,43,61,0.7)]">
      No {label} recorded for this company yet.
    </p>
  );
}

/* ─────────────────── Company Information table ─────────────────── */

/**
 * Label/value rows shared by the Company Info modal and the Contact Info
 * modal's Company Information tab.
 *
 * Figma 287:1079 puts the rows inside the module's framed card — the same 2px
 * tint around a white inner at 10px that the Notes panel and the disclosed
 * contact cards use — so Company Information reads as a panel rather than as
 * text ruled straight onto the modal.
 */
export function DetailRows({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    /* 287:1081 */
    <div
      className="bg-[rgba(244,242,240,0.6)] content-stretch flex items-start p-[2px] relative rounded-[12px] shrink-0 w-full"
      data-name="Card"
    >
      <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-w-px pb-[8px] pt-[12px] px-[10px] relative rounded-[10px]">
        <div className="flex flex-col font-['Inter',sans-serif] font-normal items-start leading-[0] shrink-0 text-[14px] w-full">
          {rows.map((row, i) => {
            const last = i === rows.length - 1;
            /* The node closes the divided run 2px tighter than the rows above
               it, then hangs the final row off that rule with nothing beneath
               it — the card's own 8px is what sits under the last row. */
            const padding = last
              ? "pt-[14px]"
              : i === 0
                ? "pb-[14px]"
                : i === rows.length - 2
                  ? "pb-[12px] pt-[14px]"
                  : "py-[14px]";
            return (
              <div
                key={row.label}
                /* The row is the hover zone for whatever copy affordance it
                   holds. The button hangs in the gap before the value — inside
                   this row, outside the value's own box — so hovering the value
                   alone hid it the moment the pointer set off towards it. An
                   attribute only: nothing about the row's layout, spacing or
                   divider changes. */
                data-detail-row
                /* Inset shadow rather than border-b, in the node's own ash
                   white: Figma draws the stroke inside the row, so it does not
                   add to the row height, and a border would. */
                className={`flex items-center justify-between relative shrink-0 w-full ${padding} ${
                  last ? "" : "shadow-[inset_0_-1px_0_0_#f4f2f0]"
                }`}
              >
                {/* 287:1085 — the row's mark and its label, 8px apart. The
                    label keeps its own type and colour; the mark is drawn
                    beside it. */}
                <div className="flex gap-[8px] items-center relative shrink-0 text-[rgba(47,43,61,0.7)]">
                  <CompanyFieldIcon label={row.label} />
                  <p className="leading-[19px]">{row.label}</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 text-[#2f2b3d]">
                  {typeof row.value === "string" ? <p className="leading-[22px]">{row.value}</p> : row.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** A value paired with the verified badge, as used for email and phone. */
export function VerifiedValue({ value }: { value: string }) {
  return (
    <CopyableValue value={value} className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="leading-[22px]">{value}</p>
      <div className="relative shrink-0 size-[16px]">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={verifiedBadge} />
      </div>
    </CopyableValue>
  );
}
