import type { ReactNode } from "react";
import ContactTag, { type ContactVariant } from "@/components/ContactTag";
import IntentTag from "@/components/IntentTag";
import LinkedInMark from "@/components/LinkedInMark";
import MailIcon from "@/components/MailIcon";
import PhoneIcon from "@/components/PhoneIcon";
import avatarOlivia from "./assets/avatar-olivia.png";
import avatarDaniel from "./assets/avatar-daniel.png";
import logoBambooHR from "./assets/logo-bamboohr.png";
import { FONT } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, seg, useLoopClock } from "./kit";
import { INK } from "./ProspectCards";

/**
 * Locked V3, Variation 3 — Reveal the contact.
 *
 * One company at a time, and a card that becomes the people behind it — card
 * choreography after the way polished feature films turn one card into another
 * and then bring a second in beside it:
 *
 *   1. A prospect arrives: the product's prospect row reduced to one company —
 *      logo, name, industry and date, Intent.
 *   2. "Your Sales Team" — a violet collaborative cursor with its named label —
 *      comes to it, hovers, and presses it.
 *   3. The card itself becomes the first contact: it grows to a contact card's
 *      height and takes on the contact card's rim while the company lifts out
 *      and the person settles in.
 *   4. A second contact rises in and tucks in front of it, the first easing up
 *      and back to make room; the two hold as one pair — two distinct cards,
 *      the one behind still readable.
 *
 * A contact card: a white card in a faint translucent shell, no stroke, under
 * a soft lifted shadow. The company is its colour — a purple or blue bar down
 * the left and a compact tag of the same tint, top-left, naming the company —
 * and the product's Verified or Recommended tag sits opposite it on the same
 * line. The name leads at 17px with LinkedIn right beside it; the role
 * follows at 13px with email and phone beside that. Plain icons, no wells.
 * The company tag is the Intent tag's box exactly — the product's 11/18 medium
 * on 2px and 10px padding at radius 6 — in the company's colour, so the two
 * are one tag in two variants. The prospect card is set on the
 * same scale, so the card that turns and the cards it turns into are one
 * system.
 *   5. The pair lifts away, and the next company arrives.
 *
 * No button, no blur, no confetti: the reveal is the transformation. One
 * example, designed to fit: BambooHR, and the two people behind it,
 * every loop. Every position is a function of time, so the loop is seamless.
 */

const MUTE = "rgba(47,43,61,0.62)";
/** Software Finder's violet — the "verified" colour in the reveal bundles. */
const VIOLET = "#8C57FF";
/** The company card's lift under the cursor: a touch more air, still Calendly-quiet. */
const ELEVATION_UP = "0 4px 12px -4px rgba(7,41,41,0.10)";

const PW = 389;
const MID = 264;
const CARD = { x: 24, w: PW - 48 };
/** The prospect: the same rimmed card as the contacts it becomes, one row at the card's
    20px padding all round — the 42px text block plus 20 above and below, in the 5px rim. */
const PROSPECT_H = 92;
/** A contact card: its outer size, and the translucent rim around the white card. */
const CONTACT_H = 112;
const RIM = 5;
/** How far the front contact tucks over the one behind: its rim and padding, never its text. */
const OVER = 16;
/** The one behind sits a little back. */
const BACK_SCALE = 0.96;
/* The shell, to Calendly's measure: a band within a few levels of the gradient behind it,
   no ring and no hairline; the only edge is the white card's own faint shadow onto it. */
/* The company tag in BambooHR's own colours: the wordmark green for the text, a pale tint
   of the app-icon green behind it. */
const COMPANY_TAG = { tint: "rgba(140,198,63,0.18)", text: "#599D15" };
/* The shadows, to Calendly's measure — one language for all three cards. Their cards throw
   almost nothing onto the gradient (two or three levels, gone within a few pixels); what
   keeps each card off the background is a low, even halo at its edge, and the one shadow
   that does more is the front card's onto the card behind it — about 12 levels at the seam,
   fading over 16px — which alone separates the pair. So every card carries the same halo,
   and the front card adds only that upward ambient, so it is the layering that differs and
   never the card. On our pale gradient the halo sits a few levels above theirs, since the
   white has far less to stand off from than their blue. */
const CARD_SHADOW = "0 1px 6px -1px rgba(7,41,41,0.08), 0 0 2px 0 rgba(7,41,41,0.05)";
const FRONT_SHADOW = `${CARD_SHADOW}, 0 -3px 12px -3px rgba(7,41,41,0.10)`;
const PAIR_TOP = MID - (2 * CONTACT_H - OVER) / 2;

const LOOP = 5900;
const REST_T = 4400;
const T = {
  enter: [0, 550] as const,
  cursorIn: [900, 1650] as const,
  hover: [1600, 1900] as const,
  press: [1950, 2090] as const,
  out: [2090, 2300] as const,
  morph: [2090, 2620] as const,
  in: [2260, 2620] as const,
  away: [2250, 2900] as const,
  second: [2720, 3320] as const,
  exit: [5250, 5750] as const,
};

type Pt = { x: number; y: number };
/** Where the cursor waits between companies: low, clear of the cards. */
const REST: Pt = { x: 232, y: 462 };
const PRESS_AT: Pt = { x: 236, y: MID + 4 };

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt => {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
};
const easeOutBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);

/** The guide: in to the prospect, a press, then out of the way while the card turns. */
function cursorAt(t: number): Pt {
  if (t < T.cursorIn[0]) return REST;
  if (t < T.cursorIn[1]) {
    const p = easeInOut(seg(t, T.cursorIn[0], T.cursorIn[1]));
    /* Arcs stay left of x ≈ 250, so the label never meets the panel's edge. */
    return bez(REST, { x: REST.x - 16, y: REST.y - 110 }, { x: PRESS_AT.x + 8, y: PRESS_AT.y + 64 }, PRESS_AT, p);
  }
  if (t < T.away[0]) {
    /* A small drift while it hovers — a hand, not a pin. */
    const w = Math.sin(seg(t, T.cursorIn[1], T.press[0]) * Math.PI);
    return { x: PRESS_AT.x + w * 2.5, y: PRESS_AT.y + w * 1.2 };
  }
  const p = easeInOut(seg(t, T.away[0], T.away[1]));
  return bez(PRESS_AT, { x: PRESS_AT.x + 8, y: PRESS_AT.y + 56 }, { x: REST.x + 8, y: REST.y - 56 }, REST, p);
}

/** The collaborative cursor: a violet pointer with its named label. */
function TeamCursor({ at, pressed }: { at: Pt; pressed: number }) {
  const s = 1 - 0.12 * pressed;
  return (
    <span className="absolute block" style={{ left: at.x, top: at.y, transform: `scale(${s.toFixed(3)})`, transformOrigin: "0 0", zIndex: 200 }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="absolute" style={{ left: -2, top: -2, filter: "drop-shadow(0 2px 4px rgba(76,40,160,0.35))" }}>
        <path d="M2.5 2.2L15.4 7.3L9.6 9.2L7.5 15.1L2.5 2.2Z" fill={VIOLET} stroke="#ffffff" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      <span
        className={`${FONT} absolute flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-[7px] pl-[6px] pr-[8px] font-medium leading-[14px] text-[11px] text-white`}
        style={{ left: 13, top: 15, background: VIOLET, boxShadow: "0 4px 12px -4px rgba(76,40,160,0.45)" }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="6" cy="5" r="2.4" fill="white" />
          <path d="M1.6 13c.5-2.6 2.3-4 4.4-4s3.9 1.4 4.4 4" fill="white" />
          <circle cx="11.4" cy="5.6" r="1.9" fill="white" opacity="0.75" />
          <path d="M10.2 9.2c2 .1 3.5 1.4 4 3.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
        </svg>
        Your Sales Team
      </span>
    </span>
  );
}

type Company = { name: string; industry: string; intentPct: number; logo: string };
type Contact = { avatar: string; name: string; jobTitle: string; variant: ContactVariant };

/** The logo is BambooHR's own app icon, set in the card's 40px tile at its rounding. */
const COMPANY: Company = { name: "BambooHR", industry: "HR Software", intentPct: 90, logo: logoBambooHR };
const CONTACTS: readonly [Contact, Contact] = [
  { avatar: avatarOlivia, name: "Jessa Call", jobTitle: "VP of Human Resources", variant: "verified" },
  { avatar: avatarDaniel, name: "Jeff Smith", jobTitle: "Director of People Operations", variant: "recommended" },
];

/** The company, as the prospect row shows it: logo, name and industry, and the Intent
    tag at the right, one row centred on the card. */
function ProspectBody({ p }: { p: Company }) {
  return (
    <>
      <span className="absolute left-[20px] top-[21px] block size-[40px]">
        <img alt="" src={p.logo} className="block size-full rounded-[10px] object-cover" />
      </span>
      <span className="absolute right-[20px] top-[30px]">
        <IntentTag score={p.intentPct} />
      </span>
      <span className="absolute left-[72px] right-[116px] top-[20px] flex flex-col gap-[2px]">
        <span className={`${FONT} truncate font-medium leading-[22px] text-[17px] tracking-[-0.2px]`} style={{ color: INK }}>
          {p.name}
        </span>
        <span className={`${FONT} truncate leading-[18px] text-[13px]`} style={{ color: MUTE }}>
          {p.industry}
        </span>
      </span>
    </>
  );
}

/** A contact, in the product's contact language, set for the stage. */
function ContactBody({ c, company }: { c: Contact; company: string }) {
  return (
    <>
      {/* The company tag: the Intent tag's own box — 11/18 medium, 2px and 10px padding,
          radius 6 — in the company's colour, so the two read as one tag in two variants. */}
      <span
        className="absolute left-[20px] top-[12px] flex min-w-[24px] max-w-[170px] items-center justify-center gap-[4px] rounded-[6px] px-[10px] py-[2px]"
        style={{ background: COMPANY_TAG.tint }}
      >
        <span className={`${FONT} min-w-0 truncate font-medium leading-[18px] text-[11px]`} style={{ color: COMPANY_TAG.text }}>
          {company}
        </span>
      </span>
      <span className="absolute right-[16px] top-[12px]">
        <ContactTag variant={c.variant} size={12} labelSize={12} medium />
      </span>

            <img alt="" src={c.avatar} className="absolute left-[20px] top-[48px] block size-[40px] rounded-[100px] object-cover" />
      <span className="absolute left-[72px] right-[18px] top-[46px] flex flex-col gap-[2px]">
        <span className="flex h-[22px] items-center gap-[4px]">
          <span className={`${FONT} min-w-0 truncate font-medium leading-[22px] text-[17px] tracking-[-0.2px]`} style={{ color: INK }}>
            {c.name}
          </span>
          <LinkedInMark size={16} />
        </span>
        <span className="flex h-[18px] items-center gap-[8px]">
          <span className={`${FONT} min-w-0 truncate leading-[18px] text-[13px]`} style={{ color: MUTE }}>
            {c.jobTitle}
          </span>
          <span className="flex shrink-0 items-center gap-[12px]">
            <MailIcon size={15} />
            <PhoneIcon size={15} />
          </span>
        </span>
      </span>
    </>
  );
}

/** A card's shell: the white card, and the rim that grows around it as it becomes a contact. */
function Shell({ rim, shadow, children }: { rim: number; shadow: string; children: ReactNode }) {
  const pad = RIM * rim;
  return (
    <span
      className="absolute inset-0 block"
      style={{
        borderRadius: 14 + pad,
        background: `rgba(255,255,255,${(0.18 * rim).toFixed(3)})`,
        backdropFilter: rim > 0 ? `blur(${(4 * rim).toFixed(1)}px)` : undefined,
        WebkitBackdropFilter: rim > 0 ? `blur(${(4 * rim).toFixed(1)}px)` : undefined,
        boxShadow: shadow,
      }}
    >
      <span
        className="absolute block overflow-hidden rounded-[14px] bg-white"
        style={{ inset: pad, boxShadow: `0 1px 3px 0 rgba(7,41,41,${(0.06 * rim).toFixed(3)})` }}
      >
        {children}
      </span>
    </span>
  );
}

export default function RevealContact() {
  const { t } = useLoopClock(LOOP, REST_T);
  const p = COMPANY;
  const [first, second] = CONTACTS;

  /* In from below, and away above as a pair. */
  const enter = easeOut(seg(t, T.enter[0], T.enter[1]));
  const exitA = easeInOut(seg(t, T.exit[0], T.exit[1]));
  const exitB = easeInOut(seg(t, T.exit[0] + 70, T.exit[1] + 70));

  /* Hover and press on the prospect. */
  const hover = easeOut(seg(t, T.hover[0], T.hover[1])) * (1 - seg(t, T.press[0], T.press[1]));
  const pressed = Math.sin(seg(t, T.press[0], T.press[1]) * Math.PI);

  /* The turn: the card grows to a contact card while its content changes over. */
  const morph = seg(t, T.morph[0], T.morph[1]);
  const grow = morph <= 0 ? 0 : easeOutBack(morph);
  const outP = easeInOut(seg(t, T.out[0], T.out[1]));
  const inP = easeOut(seg(t, T.in[0], T.in[1]));

  /* The second contact joins, and the first eases up and back to make room. */
  const sp = seg(t, T.second[0], T.second[1]);
  const join = sp <= 0 ? 0 : easeOutBack(sp);
  const settle = easeInOut(sp);

  const h1 = lerp(PROSPECT_H, CONTACT_H, grow);
  const top1 = lerp(MID - h1 / 2, PAIR_TOP, settle) + (1 - enter) * 18 - exitA * 44 - 2 * hover;
  const scale1 = (1 + 0.008 * hover - 0.015 * pressed) * lerp(1, BACK_SCALE, settle);
  const top2 = lerp(PAIR_TOP + CONTACT_H - OVER + 46, PAIR_TOP + CONTACT_H - OVER, join) - exitB * 44;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Reveal the contact">
      {/* The card: a prospect, turning into its first contact. */}
      <div
        className="absolute"
        style={{
          left: CARD.x,
          top: top1,
          width: CARD.w,
          height: h1,
          opacity: enter * (1 - exitA),
          transform: `scale(${scale1.toFixed(4)})`,
          transformOrigin: "50% 0",
          zIndex: 20,
        }}
      >
        <Shell rim={1} shadow={hover > 0.01 && morph <= 0 ? `${CARD_SHADOW}, ${ELEVATION_UP}` : CARD_SHADOW}>
          {outP < 1 && (
            <span className="absolute inset-0 block" style={{ opacity: 1 - outP, transform: `translateY(${(-8 * outP).toFixed(2)}px)` }}>
              <ProspectBody p={p} />
            </span>
          )}
          {inP > 0 && (
            <span className="absolute inset-0 block" style={{ opacity: inP, transform: `translateY(${(8 * (1 - inP)).toFixed(2)}px)` }}>
              <ContactBody c={first} company={p.name} />
            </span>
          )}
        </Shell>
      </div>

      {/* The second contact, tucking in front of the first. */}
      {sp > 0 && (
        <div
          className="absolute"
          style={{
            left: CARD.x,
            top: top2,
            width: CARD.w,
            height: CONTACT_H,
            opacity: clamp01(sp * 3) * (1 - exitB),
            transform: `scale(${lerp(0.95, 1, clamp01(join)).toFixed(4)})`,
            transformOrigin: "50% 100%",
            zIndex: 25,
          }}
        >
          <Shell rim={1} shadow={FRONT_SHADOW}>
            <ContactBody c={second} company={p.name} />
          </Shell>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 200 }}>
        <TeamCursor at={cursorAt(t)} pressed={pressed} />
      </div>
    </div>
  );
}
