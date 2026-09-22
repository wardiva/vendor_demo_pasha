import { type ReactNode } from "react";
import ContactPreviewCard from "@/components/contacts/ContactPreviewCard";
import ContactTag from "@/components/ContactTag";
import revealEye from "@/components/company/assets/contact-reveal-eye.svg";
import avatarUnrevealed from "@/components/contacts/assets/avatar-unrevealed.svg";
import type { CompanyRevealFlow } from "@/components/reveal/useCompanyRevealFlow";
import type { ProspectContact } from "@/data/prospects";

/**
 * The pieces every company-reveal design is built from.
 *
 * The concepts differ in how they arrange a company's contacts and where they
 * put the action; they do not differ in what a reveal costs, what it is called,
 * or what a sealed contact is allowed to show. Those answers live here once, so
 * seven designs cannot drift into seven different vocabularies for the same
 * transaction — and so a change to the wording of the cost lands in all of them.
 */

/** What each design is handed. */
export type RevealPanelProps = {
  company: string;
  /** One to three people. Empty companies never reach a panel. */
  contacts: ProspectContact[];
  /**
   * Where the panel is drawn. "card" is the prospect card's 310px slot on the
   * Prospects and Signals lists; "modal" is the Prospect Details Contacts tab,
   * which has the width and height to set a company's contacts out in full.
   */
  layout: "card" | "modal";
};

/* ─────────────────────────── the vocabulary ─────────────────────────── */

const plural = (n: number) => (n === 1 ? "contact" : "contacts");

/** "3 contacts available" — what the company holds, before anything is spent. */
export const availableLabel = (n: number) => `${n} ${plural(n)} available`;

/** The action, named by what it opens rather than by what it charges. */
export const revealAllLabel = (n: number) => (n === 1 ? "Reveal contact" : "Reveal all contacts");

/** The action with its count in it, for controls that stand on their own. */
export const revealCountLabel = (n: number) => (n === 1 ? "Reveal contact" : `Reveal ${n} contacts`);

/**
 * The same thing said in full — "Reveal all 3 contacts".
 *
 * What the shipped surfaces use. The count on its own leaves open the question
 * the whole model exists to answer: is that three contacts for one reveal, or
 * three reveals? "All" settles it in the control itself, which is where the
 * vendor is looking at the moment they ask.
 */
export const revealAllCountLabel = (n: number) =>
  n === 1 ? "Reveal contact" : `Reveal all ${n} contacts`;

/** The cost, stated in the unit the plan counts. */
export const COST_NOTE = "Uses 1 contact reveal";

/** After the fact: every contact the company had is open, and nothing is left to buy. */
export const revealedLabel = (n: number) =>
  n === 1 ? "Contact revealed" : `All ${n} contacts revealed`;

/** The wall. Stated as a fact about the plan, not as a fault of the click. */
export const EXHAUSTED_NOTE = "No reveals left on your plan";
export const EXHAUSTED_ACTION = "Get more reveals";

/**
 * What the control says, for whichever state the flow is in.
 *
 * One rule for every design: a reveal in flight names the thing being bought,
 * an exhausted plan offers the way out of it, and everything else is the
 * action itself.
 */
export function ctaLabel(flow: CompanyRevealFlow, count: number, label?: string): string {
  if (flow.pending) return count === 1 ? "Revealing…" : `Revealing ${count} contacts…`;
  if (flow.exhausted) return EXHAUSTED_ACTION;
  return label ?? revealCountLabel(count);
}

/* ─────────────────────────── the control ─────────────────────────── */

export type CtaTone = "primary" | "soft" | "outline" | "invert" | "invert-outline";
export type CtaSize = "sm" | "md" | "lg";

const SIZES: Record<CtaSize, { pad: string; text: string; icon: number; gap: string }> = {
  sm: { pad: "px-[8px] py-[4px]", text: "text-[11px] leading-[18px]", icon: 12, gap: "gap-[4px]" },
  md: { pad: "px-[12px] py-[6px]", text: "text-[12px] leading-[18px]", icon: 14, gap: "gap-[6px]" },
  lg: { pad: "px-[14px] py-[8px]", text: "text-[13px] leading-[20px]", icon: 14, gap: "gap-[6px]" },
};

const TONES: Record<CtaTone, string> = {
  primary: "bg-[#072929] text-white",
  soft: "bg-[rgba(7,41,41,0.12)] text-[#072929]",
  outline: "border border-[#072929] border-solid text-[#072929]",
  /* On a primary-ink surface, where the filled treatment would disappear. */
  invert: "bg-white text-[#072929]",
  "invert-outline": "border border-white border-solid text-white",
};

/**
 * The company reveal control.
 *
 * Every design's primary action, whatever shape it takes around it: the eye
 * mark the product already uses for a reveal, the label the vocabulary above
 * decides, and the loader swapping into the mark's own slot so the button
 * neither resizes nor moves while a reveal runs.
 *
 * An exhausted plan is not a disabled button. The control stays live and says
 * what it now does — the press opens the Buy More flow, which is the only thing
 * that can make the original action possible again.
 */
export function RevealCta({
  flow,
  count,
  label,
  tone = "soft",
  size = "md",
  className = "",
  icon = true,
}: {
  flow: CompanyRevealFlow;
  count: number;
  label?: string;
  tone?: CtaTone;
  size?: CtaSize;
  className?: string;
  icon?: boolean;
}) {
  const s = SIZES[size];
  const exhausted = flow.exhausted;
  /* Out of allowance the control steps back to an outline: the action it now
     offers — buying more — is not the one the design was emphasising. */
  const shown: CtaTone = exhausted ? (tone === "invert" ? "invert-outline" : "outline") : tone;
  /* The eye is drawn in the primary ink, so it is turned white wherever it
     sits on a dark surface. */
  const lightMark = shown === "primary" || shown === "invert-outline";
  return (
    <button
      ref={flow.btnRef}
      type="button"
      onClick={flow.reveal}
      /* The hover wash is the product's own: the tinted treatment takes the
         heavier of the two washes, and the other tones have their own. */
      data-variant={shown === "soft" ? "label" : undefined}
      data-tone={shown}
      title={exhausted ? `${EXHAUSTED_NOTE} — buy more to keep revealing` : COST_NOTE}
      className={`lead-reveal-btn content-stretch cursor-pointer flex ${s.gap} items-center justify-center overflow-clip ${s.pad} rounded-[6px] ${TONES[shown]} ${className}`}
    >
      {icon && (
        /* The mark keeps a relative box of its own: the loader hides it and
           drops the spinner in here, so the label never shifts. */
        <span className="relative shrink-0 block" style={{ width: s.icon, height: s.icon }}>
          <img
            alt=""
            className="absolute block inset-0 max-w-none size-full"
            src={revealEye}
            style={lightMark ? { filter: "brightness(0) invert(1)" } : undefined}
          />
        </span>
      )}
      <p
        className={`[word-break:break-word] font-['Inter',sans-serif] font-medium not-italic relative shrink-0 whitespace-nowrap ${s.text}`}
      >
        {ctaLabel(flow, count, label)}
      </p>
    </button>
  );
}

/* ─────────────────────────── the small print ─────────────────────────── */

/**
 * The cost, beside the action that spends it.
 *
 * Always the same sentence, and always one reveal however many contacts are in
 * the group — which is the whole point of the model and the one thing the
 * vendor has to be able to read before they press.
 */
export function CostNote({
  flow,
  className = "",
  showRemaining = false,
}: {
  flow: CompanyRevealFlow;
  className?: string;
  showRemaining?: boolean;
}) {
  const text = flow.exhausted
    ? EXHAUSTED_NOTE
    : showRemaining
      ? `${COST_NOTE} · ${flow.remaining} left`
      : COST_NOTE;
  return (
    <p
      className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[18px] not-italic shrink-0 text-[11px] whitespace-nowrap ${
        flow.exhausted ? "text-[#b13a3f]" : "text-[rgba(47,43,61,0.7)]"
      } ${className}`}
    >
      {text}
    </p>
  );
}

/** The mark drawn beside an opened company. */
export function CheckMark({ size = 12, color = "#072929" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 block">
      <path
        d="M2.5 6.4L4.8 8.7L9.5 3.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The settled state, said once.
 *
 * A company that is open shows what it cost nothing further to keep: every
 * contact it had. It is a statement rather than a control — there is nothing
 * left here to press, which is exactly what stops a second reveal being spent
 * on a company already bought.
 */
export function RevealedBadge({
  count,
  className = "",
  size = "md",
}: {
  count: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const small = size === "sm";
  return (
    <div
      className={`content-stretch flex gap-[4px] items-center shrink-0 ${className}`}
      data-name="Revealed"
    >
      <CheckMark size={small ? 11 : 12} />
      <p
        className={`[word-break:break-word] font-['Inter',sans-serif] font-medium not-italic shrink-0 text-[#072929] whitespace-nowrap ${
          small ? "text-[11px] leading-[18px]" : "text-[12px] leading-[20px]"
        }`}
      >
        {revealedLabel(count)}
      </p>
    </div>
  );
}

/* ─────────────────────────── the group, at a glance ─────────────────── */

/**
 * The company's people as one object.
 *
 * Sealed, the portraits are the placeholder rather than the real faces — a
 * count and a shape, which is what the vendor is being asked to buy. Opened,
 * the same stack carries the photographs, so the group reads as the same group
 * before and after and nothing about it has to be re-learnt.
 */
export function AvatarStack({
  contacts,
  locked,
  size = 28,
  className = "",
}: {
  contacts: ProspectContact[];
  locked: boolean;
  size?: number;
  className?: string;
}) {
  const overlap = Math.round(size * 0.32);
  return (
    <div
      className={`flex items-center shrink-0 ${className}`}
      aria-hidden
      data-name="Avatar Stack"
    >
      {contacts.map((c, i) => (
        <span
          key={c.name}
          className="relative block rounded-[100px] shrink-0 bg-white"
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: contacts.length - i,
            boxShadow: "0 0 0 2px #ffffff",
          }}
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
            src={locked ? avatarUnrevealed : c.avatar}
          />
        </span>
      ))}
    </div>
  );
}

/**
 * What a sealed contact is allowed to say about themselves.
 *
 * The job title, and whether they are verified or model-suggested. Both are
 * facts about the role rather than about the person, so neither gives away what
 * the reveal is for — and together they are what lets a vendor judge whether a
 * company is worth a reveal before spending one.
 */
export function RoleRow({
  contact,
  locked,
  className = "",
  showTag = true,
}: {
  contact: ProspectContact;
  locked: boolean;
  className?: string;
  showTag?: boolean;
}) {
  return (
    <div
      className={`content-stretch flex gap-[8px] items-center min-w-px relative w-full ${className}`}
      data-name="Role"
      data-no-row-hover
    >
      <span className="relative block rounded-[100px] shrink-0 size-[24px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
          src={locked ? avatarUnrevealed : contact.avatar}
        />
      </span>
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] min-w-px not-italic overflow-hidden relative shrink text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
        {locked ? contact.jobTitle : contact.name}
      </p>
      {showTag && <ContactTag variant={contact.variant} size={11} labelSize={11} showLabel={false} className="ml-auto" />}
    </div>
  );
}

/**
 * The list row, once the company is open.
 *
 * Several concepts put a group summary in the card's slot while the company is
 * sealed — a stack, a deck, a banner — and none of them should still be there
 * afterwards: the vendor bought contact details, so contact details are what the
 * row shows. The line above says the group is open and whose faces are in it;
 * the rest are a press away in the modal, which is where three people fit.
 */
export function RevealedCardState({
  contacts,
  settled,
  onRevealRequest,
}: {
  contacts: ProspectContact[];
  settled: boolean;
  onRevealRequest?: () => void;
}) {
  const primary = contacts[0];
  const rest = contacts.slice(1);
  if (!primary) return null;
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end relative shrink-0 w-[310px]">
      <div className="content-stretch flex gap-[8px] items-center justify-between relative shrink-0 w-full">
        <RevealedBadge count={contacts.length} size="sm" />
        {rest.length > 0 && <AvatarStack contacts={rest} locked={false} size={20} />}
      </div>
      <ContactPreviewCardLazy
        contact={primary}
        settled={settled}
        onRevealRequest={onRevealRequest}
      />
    </div>
  );
}

/** The preview card, filled from a contact record. */
export function ContactPreviewCardLazy({
  contact,
  settled,
  locked = false,
  reveal,
  onRevealRequest,
  layout = "prospect",
  className = "w-full",
}: {
  contact: ProspectContact;
  settled: boolean;
  locked?: boolean;
  reveal?: ReactNode;
  onRevealRequest?: () => void;
  layout?: "prospect" | "modal";
  className?: string;
}) {
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
      reveal={reveal}
      onRevealRequest={onRevealRequest}
      layout={layout}
      className={className}
    />
  );
}

/** A framed panel in the module's own card treatment — 2px tint, white inner. */
export function FramedPanel({
  children,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={`bg-[rgba(244,242,240,0.6)] content-stretch flex items-start p-[2px] relative rounded-[12px] shrink-0 w-full ${className}`}
      data-name="Card"
    >
      <div
        className={`bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative rounded-[10px] ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The company's own line above a group of contacts.
 *
 * "3 contacts available at Meridian Supply Co." — the count, the company, and
 * nothing that could be mistaken for a per-person price.
 */
export function GroupHeading({
  company,
  count,
  revealed,
  className = "",
}: {
  company: string;
  count: number;
  revealed: boolean;
  className?: string;
}) {
  return (
    <p
      className={`[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic shrink-0 text-[#2f2b3d] text-[13px] ${className}`}
    >
      {/* Opened, the count alone: the badge beside it is what says they are
          revealed, and the heading saying it too read as a stutter. */}
      {revealed ? `${count} ${plural(count)}` : availableLabel(count)}
      <span className="font-normal text-[rgba(47,43,61,0.7)]">{` at ${company}`}</span>
    </p>
  );
}
