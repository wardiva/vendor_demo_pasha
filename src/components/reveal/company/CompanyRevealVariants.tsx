import { useState, type ReactElement } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import type { RevealContact } from "@/data/companyReveal";
import type { RevealExperience } from "@/context/RevealExperienceContext";
import {
  useCompanyRevealFlow,
  RevealAllButton,
  RevealCostNote,
  OutOfRevealsNote,
  ContactAvatarStack,
  BlurBar,
  contactCountLabel,
} from "./shared";

/**
 * The seven company-based reveal concepts, one card renderer and one modal
 * renderer per concept. All seven run the same spend — `useCompanyRevealFlow`
 * — and differ only in how they present the "N available" and "revealed"
 * states around it, which is what makes them comparable on the same data.
 */

type Props = {
  companyKey: string;
  companyName: string;
  contacts: RevealContact[];
};

/* Text row: the primary contact's job title, kept visible pre-reveal — the
   thing every concept agrees is safe and useful to show before spending a
   reveal — while the name stays a blurred bar. */
function TitleLine({ contact, locked }: { contact: RevealContact; locked: boolean }) {
  return locked ? (
    <span className="inline-flex items-center gap-[6px]">
      <BlurBar w={72} />
      <span className="text-[rgba(47,43,61,0.5)]">·</span>
      <span className="truncate text-[rgba(47,43,61,0.7)]">{contact.jobTitle}</span>
    </span>
  ) : (
    <span className="truncate text-[#2f2b3d]">
      {contact.name} <span className="text-[rgba(47,43,61,0.7)]">· {contact.jobTitle}</span>
    </span>
  );
}

/* ═══════════════════════════ V1 — Your design ═══════════════════════════ */
/* A single, calm summary row: who the company's found contacts are (an
   avatar stack plus the lead contact's title), how many there are, and one
   button that reveals the group. No per-contact controls anywhere, so the
   one-company-one-reveal model has nothing to contradict it. */

function V1Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const lead = contacts[0];
  const locked = !isRevealed;

  return (
    <div className="flex w-[310px] flex-col gap-[8px] rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] px-[12px] py-[10px]">
      <div className="flex items-center gap-[10px]">
        <ContactAvatarStack contacts={contacts} revealed={!locked} size={28} />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px] font-['Inter',sans-serif] text-[12px] leading-[16px]">
          <TitleLine contact={lead} locked={locked} />
          <span className="text-[11px] text-[rgba(47,43,61,0.55)]">
            {contactCountLabel(contacts.length, !locked)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-[8px]">
        {locked ? (
          hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />
        ) : (
          <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">
            All contacts revealed
          </span>
        )}
        {locked && (
          <RevealAllButton
            btnRef={btnRef}
            count={contacts.length}
            loading={loading}
            hasBalance={hasBalance}
            onClick={revealAll}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

function V1Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center justify-between gap-[12px] rounded-[10px] bg-[rgba(7,41,41,0.04)] px-[12px] py-[10px]">
        <div className="flex flex-col gap-[2px]">
          <p className="font-['Inter',sans-serif] text-[13px] font-medium text-[#2f2b3d]">
            {contactCountLabel(contacts.length, !locked)}
          </p>
          {locked ? (
            hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />
          ) : (
            <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">
              Revealed together — no extra reveals spent
            </span>
          )}
        </div>
        {locked && (
          <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />
        )}
      </div>
      <div className="flex flex-col gap-[12px]">
        {contacts.map(c => (
          <ContactPreviewCard
            key={c.id}
            variant={c.variant}
            avatar={c.avatar}
            name={c.name}
            jobTitle={c.jobTitle}
            phone={c.phone}
            email={c.email}
            locked={locked}
            settled={settled}
            layout="modal"
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ V2 — Grouped Contacts ═══════════════════════════ */
/* The literal reading of "grouped": every available contact lives inside one
   bordered group card with its own header and a single footer action, so the
   frame itself says these three are one unit and one spend. */

function V2Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div
      className="flex w-[310px] flex-col overflow-hidden rounded-[12px] bg-white"
      style={{ border: "1px solid rgba(7,41,41,0.14)" }}
    >
      <div className="flex items-center justify-between px-[12px] py-[8px]" style={{ borderBottom: "1px solid rgba(7,41,41,0.1)" }}>
        <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#072929]">
          Contact group · {contacts.length}
        </span>
        {!locked && <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">Revealed</span>}
      </div>
      <div className="flex flex-col gap-[6px] px-[12px] py-[8px]">
        {contacts.map(c => (
          <div key={c.id} className="flex items-center gap-[8px]">
            <ContactAvatarStack contacts={[c]} revealed={!locked} size={20} />
            <TitleLine contact={c} locked={locked} />
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between gap-[8px] px-[12px] py-[8px]"
        style={{ borderTop: "1px solid rgba(7,41,41,0.1)", background: "rgba(7,41,41,0.03)" }}
      >
        {locked ? (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />) : <RevealCostNote className="opacity-0" />}
        {locked && (
          <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} size="sm" className="w-full justify-center" />
        )}
      </div>
    </div>
  );
}

function V2Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[12px]" style={{ border: "1px solid rgba(7,41,41,0.14)" }}>
      <div className="flex items-center justify-between px-[14px] py-[10px]" style={{ borderBottom: "1px solid rgba(7,41,41,0.1)" }}>
        <span className="font-['Inter',sans-serif] text-[13px] font-medium text-[#072929]">
          Contact group · {contacts.length} of 3 available
        </span>
        {!locked && <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">All revealed</span>}
      </div>
      <div className="flex flex-col gap-[10px] p-[12px]">
        {contacts.map(c => (
          <ContactPreviewCard
            key={c.id}
            variant={c.variant}
            avatar={c.avatar}
            name={c.name}
            jobTitle={c.jobTitle}
            phone={c.phone}
            email={c.email}
            locked={locked}
            settled={settled}
            layout="modal"
            className="w-full"
          />
        ))}
      </div>
      {locked && (
        <div
          className="flex items-center justify-between gap-[12px] px-[14px] py-[10px]"
          style={{ borderTop: "1px solid rgba(7,41,41,0.1)", background: "rgba(7,41,41,0.03)" }}
        >
          {hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />}
          <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ V3 — Stacked contact cards ═══════════════════════════ */
/* Contacts start visually stacked, like a small deck — one card sits mostly
   behind the next. Revealing doesn't just unblur them, it un-stacks them: the
   transform that offsets each card animates back to flat, so the group
   settling into three separate, sharp cards is the same motion as the reveal
   itself. */

function V3Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;
  const lead = contacts[0];

  return (
    <div className="flex w-[310px] flex-col items-center gap-[8px] py-[6px]">
      <div className="relative w-full" style={{ height: locked ? 52 : contacts.length * 26 + 30 }}>
        {contacts.map((c, i) => (
          <div
            key={c.id}
            className="absolute left-0 right-0 flex items-center gap-[8px] rounded-[10px] bg-white bg-[linear-gradient(rgba(244,242,240,0.7),rgba(244,242,240,0.7))] px-[10px] py-[8px] shadow-[0px_1px_3px_rgba(47,43,61,0.12)] transition-all duration-300 ease-out"
            style={{
              top: locked ? i * 6 : i * 30,
              transform: locked ? `scale(${1 - i * 0.035})` : "scale(1)",
              zIndex: contacts.length - i,
            }}
          >
            <ContactAvatarStack contacts={[c]} revealed={!locked} size={24} />
            <TitleLine contact={c} locked={locked} />
          </div>
        ))}
        {locked && contacts.length > 1 && (
          <span
            className="absolute -right-[4px] -top-[4px] z-10 flex size-[18px] items-center justify-center rounded-full bg-[#072929] font-['Inter',sans-serif] text-[10px] font-medium text-white"
          >
            {contacts.length}
          </span>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-[8px]">
        {locked ? (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />) : (
          <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">Unstacked — all revealed</span>
        )}
        {locked && <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} size="sm" />}
      </div>
    </div>
  );
}

function V3Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center justify-between gap-[12px]">
        <p className="font-['Inter',sans-serif] text-[13px] font-medium text-[#2f2b3d]">
          {contactCountLabel(contacts.length, !locked)} — stacked as one card until revealed
        </p>
        {locked && <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />}
      </div>
      {locked && (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />)}
      <div className="relative" style={{ height: locked ? 90 : contacts.length * 87 }}>
        {contacts.map((c, i) => (
          <div
            key={c.id}
            className="absolute left-0 right-0 transition-all duration-300 ease-out"
            style={{
              top: locked ? i * 10 : i * 87,
              transform: locked ? `scale(${1 - i * 0.03})` : "scale(1)",
              zIndex: contacts.length - i,
            }}
          >
            <ContactPreviewCard
              variant={c.variant}
              avatar={c.avatar}
              name={c.name}
              jobTitle={c.jobTitle}
              phone={c.phone}
              email={c.email}
              locked={locked}
              settled={settled}
              layout="modal"
              className="w-full shadow-[0px_2px_8px_rgba(47,43,61,0.1)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ V4 — Expandable group ═══════════════════════════ */
/* Collapsed to a single summary pill by default — "3 contacts available" — so
   the card stays as compact as any other prospect card. Expanding is a
   separate, free action from revealing: opening the group costs nothing and
   only previews it; the reveal itself stays its own explicit button inside. */

function V4Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const [open, setOpen] = useState(false);
  const locked = !isRevealed;

  return (
    <div className="flex w-[310px] flex-col rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.55),rgba(244,242,240,0.55))]">
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-[8px] px-[12px] py-[10px]"
      >
        <span className="flex items-center gap-[8px]">
          <ContactAvatarStack contacts={contacts} revealed={!locked} size={24} />
          <span className="font-['Inter',sans-serif] text-[12px] font-medium text-[#2f2b3d]">
            {contactCountLabel(contacts.length, !locked)}
          </span>
        </span>
        <span
          className="font-['Inter',sans-serif] text-[11px] text-[rgba(47,43,61,0.6)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-[8px] px-[12px] pb-[10px]">
          <div className="flex flex-col gap-[6px] rounded-[8px] bg-white/60 p-[8px]">
            {contacts.map(c => (
              <div key={c.id} className="flex items-center gap-[8px]">
                <ContactAvatarStack contacts={[c]} revealed={!locked} size={20} />
                <TitleLine contact={c} locked={locked} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-[8px]">
            {locked ? (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />) : (
              <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">All contacts revealed</span>
            )}
            {locked && <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} size="sm" />}
          </div>
        </div>
      )}
    </div>
  );
}

function V4Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const [open, setOpen] = useState(true);
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col rounded-[12px]" style={{ border: "1px solid rgba(7,41,41,0.12)" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-[8px] px-[14px] py-[10px]"
      >
        <span className="font-['Inter',sans-serif] text-[13px] font-medium text-[#2f2b3d]">
          {contactCountLabel(contacts.length, !locked)}
        </span>
        <span className="font-['Inter',sans-serif] text-[12px] text-[rgba(47,43,61,0.6)]">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-[10px] px-[12px] pb-[12px]">
          {contacts.map(c => (
            <ContactPreviewCard
              key={c.id}
              variant={c.variant}
              avatar={c.avatar}
              name={c.name}
              jobTitle={c.jobTitle}
              phone={c.phone}
              email={c.email}
              locked={locked}
              settled={settled}
              layout="modal"
              className="w-full"
            />
          ))}
          {locked && (
            <div className="flex items-center justify-between gap-[12px] pt-[2px]">
              {hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />}
              <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ V5 — Progressive reveal ═══════════════════════════ */
/* Closest to the original card at rest: one contact's title shown, name
   blurred, nothing else. The other contacts stay implicit behind a plain-text
   link until asked for, and only once they are previewed does the group
   action appear — disclosure in two deliberate steps rather than one. */

function V5Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const [expanded, setExpanded] = useState(false);
  const locked = !isRevealed;
  const lead = contacts[0];
  const rest = contacts.slice(1);
  const showGroup = expanded || !locked;

  return (
    <div className="flex w-[310px] flex-col gap-[6px] rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] px-[12px] py-[10px]">
      <div className="flex items-center gap-[10px]">
        <ContactAvatarStack contacts={[lead]} revealed={!locked} size={28} />
        <div className="min-w-0 flex-1 font-['Inter',sans-serif] text-[12px] leading-[16px]">
          <TitleLine contact={lead} locked={locked} />
        </div>
      </div>

      {!showGroup && rest.length > 0 && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="cursor-pointer self-start font-['Inter',sans-serif] text-[11px] font-medium text-[#072929] underline decoration-[rgba(7,41,41,0.35)] underline-offset-2"
        >
          +{rest.length} more {rest.length === 1 ? "contact" : "contacts"} at this company
        </button>
      )}

      {showGroup && rest.length > 0 && (
        <div className="flex flex-col gap-[4px] border-t border-[rgba(47,43,61,0.08)] pt-[6px]">
          {rest.map(c => (
            <div key={c.id} className="flex items-center gap-[8px]">
              <ContactAvatarStack contacts={[c]} revealed={!locked} size={20} />
              <TitleLine contact={c} locked={locked} />
            </div>
          ))}
        </div>
      )}

      {showGroup && (
        <div className="flex items-center justify-between gap-[8px] pt-[2px]">
          {locked ? (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />) : (
            <span className="font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">All contacts revealed</span>
          )}
          {locked && <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} size="sm" />}
        </div>
      )}
    </div>
  );
}

function V5Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;
  const lead = contacts[0];
  const rest = contacts.slice(1);

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <ContactPreviewCard
        variant={lead.variant}
        avatar={lead.avatar}
        name={lead.name}
        jobTitle={lead.jobTitle}
        phone={lead.phone}
        email={lead.email}
        locked={locked}
        settled={settled}
        layout="modal"
        className="w-full"
      />
      {rest.length > 0 && (
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Inter',sans-serif] text-[12px] font-medium text-[#2f2b3d]">
            +{rest.length} more {rest.length === 1 ? "contact" : "contacts"} available at this company
          </p>
          <div className="flex flex-col gap-[6px] rounded-[8px] bg-[rgba(7,41,41,0.03)] p-[8px]">
            {rest.map(c => (
              <div key={c.id} className="flex items-center gap-[8px]">
                <ContactAvatarStack contacts={[c]} revealed={!locked} size={22} />
                <TitleLine contact={c} locked={locked} />
              </div>
            ))}
          </div>
        </div>
      )}
      {locked && (
        <div className="flex items-center justify-between gap-[12px]">
          {hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />}
          <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />
        </div>
      )}
      {!locked && rest.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          {rest.map(c => (
            <ContactPreviewCard
              key={c.id}
              variant={c.variant}
              avatar={c.avatar}
              name={c.name}
              jobTitle={c.jobTitle}
              phone={c.phone}
              email={c.email}
              locked={locked}
              settled={settled}
              layout="modal"
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ V6 — CTA with contact previews ═══════════════════════════ */
/* Names and photos stay fully withheld pre-reveal — only job titles surface,
   as plain text pills — and the button itself carries the cost ("Reveal All
   Contacts · 1 reveal") rather than a caption beside it. The action is the
   loudest thing on the card. */

function TitlePill({ title }: { title: string }) {
  return (
    <span className="truncate rounded-[100px] bg-[rgba(7,41,41,0.06)] px-[8px] py-[3px] font-['Inter',sans-serif] text-[10px] text-[#072929]">
      {title}
    </span>
  );
}

function V6Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-[310px] flex-col gap-[8px] rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] px-[12px] py-[10px]">
      <p className="font-['Inter',sans-serif] text-[12px] font-medium text-[#2f2b3d]">
        {contactCountLabel(contacts.length, !locked)}
      </p>
      {locked ? (
        <div className="flex flex-wrap gap-[6px]">
          {contacts.map(c => (
            <TitlePill key={c.id} title={c.jobTitle} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-[4px]">
          {contacts.map(c => (
            <div key={c.id} className="flex items-center gap-[8px]">
              <ContactAvatarStack contacts={[c]} revealed size={20} />
              <span className="truncate font-['Inter',sans-serif] text-[11px] text-[#2f2b3d]">{c.name} · {c.jobTitle}</span>
            </div>
          ))}
        </div>
      )}
      {locked && !hasBalance && <OutOfRevealsNote />}
      {locked && (
        <RevealAllButton
          btnRef={btnRef}
          count={contacts.length}
          loading={loading}
          hasBalance={hasBalance}
          onClick={revealAll}
          size="sm"
          className="w-full justify-center"
        />
      )}
    </div>
  );
}

function V6Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <p className="font-['Inter',sans-serif] text-[13px] font-medium text-[#2f2b3d]">
        {contactCountLabel(contacts.length, !locked)} at this company
      </p>
      {locked && (
        <div className="flex flex-wrap gap-[8px]">
          {contacts.map(c => (
            <TitlePill key={c.id} title={c.jobTitle} />
          ))}
        </div>
      )}
      {locked && !hasBalance && <OutOfRevealsNote />}
      {locked && (
        <RevealAllButton
          btnRef={btnRef}
          count={contacts.length}
          loading={loading}
          hasBalance={hasBalance}
          onClick={revealAll}
          className="w-full justify-center"
        />
      )}
      {!locked && (
        <div className="flex flex-col gap-[10px]">
          {contacts.map(c => (
            <ContactPreviewCard
              key={c.id}
              variant={c.variant}
              avatar={c.avatar}
              name={c.name}
              jobTitle={c.jobTitle}
              phone={c.phone}
              email={c.email}
              locked={locked}
              settled={settled}
              layout="modal"
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ V7 — Reveal bundle ═══════════════════════════ */
/* A distinct, ticket-like motif: the company's contacts are framed as one
   bundle with a dashed stub between the "who" side and the "spend" side, and
   a single round icon button unlocks the whole thing. Furthest in tone from
   the other six, on purpose — it is the one concept that names the unit
   ("bundle") rather than describing it. */

function V7Card({ companyKey, contacts }: Props) {
  const { isRevealed, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-[310px] flex-col rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))]">
      <div className="flex items-center gap-[10px] px-[12px] py-[10px]">
        <ContactAvatarStack contacts={contacts} revealed={!locked} size={26} />
        <div className="min-w-0 flex-1 font-['Inter',sans-serif] text-[12px]">
          <p className="truncate font-medium text-[#2f2b3d]">{locked ? "Contact bundle" : "Contacts revealed"}</p>
          <p className="text-[11px] text-[rgba(47,43,61,0.6)]">
            {contacts.length} {contacts.length === 1 ? "person" : "people"}
            {locked ? " · 1 reveal" : ""}
          </p>
        </div>
        <div
          aria-hidden
          className="h-[36px] shrink-0"
          style={{ borderLeft: "1.5px dashed rgba(7,41,41,0.25)" }}
        />
        {locked ? (
          <button
            ref={btnRef}
            type="button"
            onClick={revealAll}
            data-loading={loading || undefined}
            title={hasBalance ? `Unlock ${contacts.length} contacts · 1 reveal` : "No company reveals left"}
            className={`lead-reveal-btn flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full ${
              hasBalance ? "bg-[#072929] text-white" : "bg-[rgba(7,41,41,0.08)] text-[#072929]"
            }`}
          >
            {loading ? (
              <span
                aria-hidden
                className="inline-block rounded-full"
                style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "currentColor", animation: "lead-reveal-spin 1s linear infinite" }}
              />
            ) : (
              "🔓"
            )}
          </button>
        ) : (
          <span className="shrink-0 font-['Inter',sans-serif] text-[11px] font-medium text-[#2f9e6f]">Unlocked</span>
        )}
      </div>
      {locked && !hasBalance && (
        <p className="px-[12px] pb-[8px] font-['Inter',sans-serif] text-[11px] text-[#FF4C51]">No company reveals left</p>
      )}
    </div>
  );
}

function V7Modal({ companyKey, contacts }: Props) {
  const { isRevealed, settled, loading, hasBalance, revealAll, btnRef } = useCompanyRevealFlow(
    companyKey,
    contacts,
  );
  const locked = !isRevealed;

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <div className="flex items-center gap-[12px] rounded-[12px] bg-[linear-gradient(rgba(7,41,41,0.05),rgba(7,41,41,0.05))] px-[14px] py-[12px]">
        <ContactAvatarStack contacts={contacts} revealed={!locked} size={30} />
        <div className="min-w-0 flex-1 font-['Inter',sans-serif]">
          <p className="text-[13px] font-medium text-[#2f2b3d]">
            {locked ? "Contact bundle" : "Bundle unlocked"} · {contacts.length} {contacts.length === 1 ? "person" : "people"}
          </p>
          {locked && (hasBalance ? <RevealCostNote /> : <OutOfRevealsNote />)}
        </div>
        {locked && (
          <RevealAllButton btnRef={btnRef} count={contacts.length} loading={loading} hasBalance={hasBalance} onClick={revealAll} />
        )}
      </div>
      <div className="flex flex-col gap-[10px]">
        {contacts.map(c => (
          <ContactPreviewCard
            key={c.id}
            variant={c.variant}
            avatar={c.avatar}
            name={c.name}
            jobTitle={c.jobTitle}
            phone={c.phone}
            email={c.email}
            locked={locked}
            settled={settled}
            layout="modal"
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ dispatch ═══════════════════════════ */

const CARD_VARIANTS: Partial<Record<RevealExperience, (p: Props) => ReactElement>> = {
  v1: V1Card,
  v2: V2Card,
  v3: V3Card,
  v4: V4Card,
  v5: V5Card,
  v6: V6Card,
  v7: V7Card,
};

const MODAL_VARIANTS: Partial<Record<RevealExperience, (p: Props) => ReactElement>> = {
  v1: V1Modal,
  v2: V2Modal,
  v3: V3Modal,
  v4: V4Modal,
  v5: V5Modal,
  v6: V6Modal,
  v7: V7Modal,
};

export function CompanyRevealCardBlock({
  experience,
  ...props
}: Props & { experience: RevealExperience }) {
  const Cmp = CARD_VARIANTS[experience] ?? V1Card;
  return <Cmp {...props} />;
}

export function CompanyRevealModalBlock({
  experience,
  ...props
}: Props & { experience: RevealExperience }) {
  const Cmp = MODAL_VARIANTS[experience] ?? V1Modal;
  return <Cmp {...props} />;
}
