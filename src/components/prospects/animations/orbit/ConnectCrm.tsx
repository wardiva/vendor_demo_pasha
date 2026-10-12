/**
 * Connect your CRM — the Integrations lock's animation.
 *
 * The same stage and card system as Reveal the contact, telling the other half
 * of the story: an API key is generated, copied, and pasted into the buyer's
 * CRM, and the prospects arrive there. One loop, time-driven:
 *
 *   0.0s  the API-key card rises to the middle — one row, like the company card:
 *         key tile, "API key / Connect your CRM", Generate where Intent sits
 *   0.9s  Your Sales Team's cursor comes in, hovers, presses the card
 *   2.1s  the card grows in place into the key: Active, Never expires, the
 *         masked token with a copy mark beside it
 *   2.8s  the cursor moves to the copy mark and presses it: a tick, "Copied",
 *         and the token lifts off as a chip that travels with the cursor
 *   3.6s  Your CRM tucks in front, overlapping by the same 16px; the chip is
 *         carried to its empty field and dropped in
 *   4.4s  the field fills, Not connected turns to Connected, "Syncing"
 *   4.6s  the CRM card grows and the prospects arrive inside it 80ms apart,
 *         the count climbing
 *   7.3s  the pair glides up and away, and the loop returns to the key card
 */

import IntentTag from "@/components/IntentTag";
import logoBambooHR from "./assets/logo-bamboohr.png";
import logoNorthvane from "@/data/assets/logo-northvane.png";
import { FONT } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, seg, useLoopClock } from "./kit";
import { INK } from "./ProspectCards";
import {
  BACK_SCALE,
  CARD,
  CARD_SHADOW,
  COMPANY_TAG,
  CONTACT_H,
  ELEVATION_UP,
  FRONT_SHADOW,
  MID,
  MUTE,
  OVER,
  PROSPECT_H,
  REST,
  Shell,
  TeamCursor,
  bez,
  easeOutBack,
  type Pt,
} from "./RevealContact";

const LIME = "#B1FA63";
const GREEN = COMPANY_TAG.text;
const GREEN_TINT = COMPANY_TAG.tint;
const GREY_TINT = "rgba(47,43,61,0.06)";
const VIOLET = "#8C57FF";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** The key, as the product masks it: the prefix, the first four, and the tail. */
const KEY = "vpk_ffa1••••7d_";
/** The CRM card, once the prospects are in: the field row and two prospect rows. */
const CRM_TALL = 224;

const LOOP = 8000;
const REST_T = 6200;
const T = {
  enter: [0, 550] as const,
  cursorIn: [900, 1650] as const,
  hover: [1600, 1900] as const,
  press: [1950, 2090] as const,
  out: [2090, 2300] as const,
  morph: [2090, 2620] as const,
  in: [2260, 2620] as const,
  toCopy: [2800, 3300] as const,
  copyPress: [3350, 3490] as const,
  carry: [3560, 4160] as const,
  join: [3560, 4160] as const,
  drop: [4160, 4380] as const,
  connect: [4380, 4640] as const,
  away: [4500, 5100] as const,
  grow: [4640, 5040] as const,
  row1: [5040, 5440] as const,
  row2: [5120, 5520] as const,
  exit: [7300, 7800] as const,
};

const PRESS_AT: Pt = { x: 236, y: MID + 4 };
/** The copy mark beside the token, while the key card is centred on its own. */
const COPY_AT: Pt = { x: 238, y: MID + 4 };
/** The CRM card's field, once the pair has settled at its first height. */
const FIELD_AT: Pt = { x: 150, y: MID + 82 };

/** The guide: in to the card, a press; across to the copy mark, a press; down to the field; then out of the way. */
function cursorAt(t: number): Pt {
  if (t < T.cursorIn[0]) return REST;
  if (t < T.cursorIn[1]) {
    const p = easeInOut(seg(t, T.cursorIn[0], T.cursorIn[1]));
    return bez(REST, { x: REST.x - 16, y: REST.y - 110 }, { x: PRESS_AT.x + 8, y: PRESS_AT.y + 64 }, PRESS_AT, p);
  }
  if (t < T.toCopy[0]) {
    const w = Math.sin(seg(t, T.cursorIn[1], T.press[0]) * Math.PI);
    return { x: PRESS_AT.x + w * 2.5, y: PRESS_AT.y + w * 1.2 };
  }
  if (t < T.toCopy[1]) {
    const p = easeInOut(seg(t, T.toCopy[0], T.toCopy[1]));
    return bez(PRESS_AT, { x: PRESS_AT.x + 10, y: PRESS_AT.y + 10 }, { x: COPY_AT.x - 8, y: COPY_AT.y + 6 }, COPY_AT, p);
  }
  if (t < T.carry[0]) return COPY_AT;
  if (t < T.carry[1]) {
    const p = easeInOut(seg(t, T.carry[0], T.carry[1]));
    return bez(COPY_AT, { x: COPY_AT.x - 10, y: COPY_AT.y + 40 }, { x: FIELD_AT.x + 30, y: FIELD_AT.y - 30 }, FIELD_AT, p);
  }
  if (t < T.away[0]) return FIELD_AT;
  const p = easeInOut(seg(t, T.away[0], T.away[1]));
  return bez(FIELD_AT, { x: FIELD_AT.x + 10, y: FIELD_AT.y + 60 }, { x: REST.x - 10, y: REST.y - 50 }, REST, p);
}

/* ── glyphs, 1.5 stroke, in the card's own colours ── */

function KeyGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7" cy="12" r="3.2" stroke={LIME} strokeWidth="1.6" />
      <path d="M9.6 9.6 15.5 3.7M13 6.2l2 2M11 8.2l2 2" stroke={LIME} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CrmGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="3" width="14" height="14" rx="3" stroke={LIME} strokeWidth="1.6" />
      <path d="M3 8h14M8 8v9" stroke={LIME} strokeWidth="1.6" />
    </svg>
  );
}

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke={INK} strokeWidth="1.4" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

function TickGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className="block">
      <path d="M7 1.2 12 3v3.6c0 3-2.1 5.2-5 6.2-2.9-1-5-3.2-5-6.2V3l5-1.8Z" fill={VIOLET} />
      <path d="M4.8 7.1 6.3 8.6 9.3 5.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className="block">
      <path d="M7 1.5 8.4 5.6 12.5 7 8.4 8.4 7 12.5 5.6 8.4 1.5 7l4.1-1.4Z" fill="#3fb950" />
    </svg>
  );
}

/* ── the pieces of a card ── */

/** The Intent tag's own box, in a colour: the company tag of the contact cards. */
function Tag({ tint, color, children, style }: { tint: string; color: string; children: string; style?: React.CSSProperties }) {
  return (
    <span className="absolute left-[20px] top-[12px] flex min-w-[24px] max-w-[170px] items-center justify-center rounded-[6px] px-[10px] py-[2px]" style={{ background: tint, ...style }}>
      <span className={`${FONT} min-w-0 truncate font-medium leading-[18px] text-[11px]`} style={{ color }}>
        {children}
      </span>
    </span>
  );
}

/** A status at the card's top right, as the contact tag sits: a 12px mark and a 12px medium label. */
function Status({ glyph, children, style }: { glyph: React.ReactNode; children: string; style?: React.CSSProperties }) {
  return (
    <span className="absolute right-[16px] top-[12px] flex h-[18px] items-center gap-[5px]" style={style}>
      {glyph}
      <span className={`${FONT} whitespace-nowrap font-medium leading-[18px] text-[12px]`} style={{ color: INK }}>
        {children}
      </span>
    </span>
  );
}

function Tile({ top, children }: { top: number; children: React.ReactNode }) {
  return (
    <span className="absolute left-[20px] flex size-[40px] items-center justify-center rounded-[10px]" style={{ top, background: INK }}>
      {children}
    </span>
  );
}

/** The integration, before a key exists: one row at the card's padding, Generate where Intent sits. */
function IntegrationBody() {
  return (
    <>
      <Tile top={21}>
        <KeyGlyph />
      </Tile>
      <span className="absolute right-[20px] top-[27px] flex h-[28px] items-center rounded-[9px] px-[12px]" style={{ background: INK }}>
        <span className={`${FONT} whitespace-nowrap font-medium leading-[18px] text-[12px] text-white`}>Generate</span>
      </span>
      <span className="absolute left-[72px] right-[116px] top-[20px] flex flex-col gap-[2px]">
        <span className={`${FONT} truncate font-medium leading-[22px] text-[17px] tracking-[-0.2px]`} style={{ color: INK }}>
          API key
        </span>
        <span className={`${FONT} truncate leading-[18px] text-[13px]`} style={{ color: MUTE }}>
          Connect your CRM
        </span>
      </span>
    </>
  );
}

/** The key, in the contact card's language: a tag and a status above, the token and its copy mark beside. */
function KeyBody({ copied }: { copied: number }) {
  return (
    <>
      <Tag tint={GREEN_TINT} color={GREEN}>
        Active
      </Tag>
      <Status glyph={<ShieldGlyph />}>Never expires</Status>
      <Tile top={48}>
        <KeyGlyph />
      </Tile>
      <span className="absolute left-[72px] right-[18px] top-[46px] flex flex-col gap-[2px]">
        <span className="flex h-[22px] items-center gap-[6px]">
          <span className="whitespace-nowrap font-medium leading-[22px] text-[14px] tracking-[-0.1px]" style={{ color: INK, fontFamily: MONO }}>
            {KEY}
          </span>
          <span className="relative block size-[15px] shrink-0">
            <span className="absolute inset-0 block" style={{ opacity: 1 - copied }}>
              <CopyGlyph />
            </span>
            <span className="absolute inset-0 block" style={{ opacity: copied, transform: `scale(${lerp(0.7, 1, copied).toFixed(3)})` }}>
              <TickGlyph />
            </span>
          </span>
        </span>
        <span className="relative block h-[18px]">
          <span className={`${FONT} absolute left-0 top-0 whitespace-nowrap leading-[18px] text-[13px]`} style={{ color: MUTE, opacity: 1 - copied }}>
            Created today
          </span>
          <span className={`${FONT} absolute left-0 top-0 whitespace-nowrap leading-[18px] text-[13px]`} style={{ color: GREEN, opacity: copied }}>
            Copied
          </span>
        </span>
      </span>
    </>
  );
}

type Prospect = { logo: string; name: string; industry: string; intentPct: number };
const PROSPECTS: readonly [Prospect, Prospect] = [
  { logo: logoBambooHR, name: "BambooHR", industry: "HR Software", intentPct: 90 },
  { logo: logoNorthvane, name: "Northvane Technologies", industry: "Cloud Infrastructure", intentPct: 81 },
];

/** A prospect as it lands in the CRM: the list row, small. */
function ProspectRow({ p, top, at }: { p: Prospect; top: number; at: number }) {
  return (
    <span
      className="absolute left-[20px] right-[20px] flex h-[44px] items-center gap-[10px]"
      style={{ top, opacity: at, transform: `translateY(${(8 * (1 - at)).toFixed(2)}px)` }}
    >
      <img alt="" src={p.logo} className="block size-[32px] shrink-0 rounded-[8px] object-cover" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`${FONT} truncate font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          {p.name}
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11px]`} style={{ color: MUTE }}>
          {p.industry}
        </span>
      </span>
      <IntentTag score={p.intentPct} />
    </span>
  );
}

/** The buyer's CRM: a tag and a status, the tile and name, the field the key goes into — and, once connected, the prospects. */
function CrmBody({ filled, connected, rows, synced }: { filled: number; connected: number; rows: readonly [number, number]; synced: number }) {
  const label = synced === 0 ? "Syncing" : synced === 1 ? "1 prospect synced" : `${synced} prospects synced`;
  return (
    <>
      <Tag tint={GREY_TINT} color={MUTE} style={{ opacity: 1 - Math.min(1, connected * 2.5) }}>
        Not connected
      </Tag>
      <Tag tint={GREEN_TINT} color={GREEN} style={{ opacity: connected }}>
        Connected
      </Tag>
      <Status glyph={<SparkleGlyph />} style={{ opacity: connected }}>
        {label}
      </Status>
      <Tile top={48}>
        <CrmGlyph />
      </Tile>
      <span className={`${FONT} absolute left-[72px] top-[46px] whitespace-nowrap font-medium leading-[22px] text-[15px] tracking-[-0.2px]`} style={{ color: INK }}>
        Your CRM
      </span>
      <span
        className="absolute left-[72px] right-[20px] top-[72px] block h-[26px] overflow-hidden rounded-[8px]"
        style={{
          border: `1px solid ${filled > 0.5 ? "rgba(7,41,41,0.22)" : "rgba(47,43,61,0.14)"}`,
          background: `rgba(47,43,61,${(0.025 * (1 - filled)).toFixed(4)})`,
        }}
      >
        <span className={`${FONT} absolute left-[10px] top-0 whitespace-nowrap leading-[24px] text-[12px]`} style={{ color: "rgba(47,43,61,0.45)", opacity: 1 - filled }}>
          Paste your API key
        </span>
        <span className="absolute left-[10px] top-0 whitespace-nowrap leading-[24px] text-[12px]" style={{ color: INK, fontFamily: MONO, opacity: filled }}>
          {KEY}
        </span>
      </span>
      <span className="absolute left-[20px] right-[20px] top-[114px] block h-px" style={{ background: "rgba(47,43,61,0.08)", opacity: rows[0] }} />
      <ProspectRow p={PROSPECTS[0]} top={122} at={rows[0]} />
      <ProspectRow p={PROSPECTS[1]} top={168} at={rows[1]} />
    </>
  );
}

/** The token, lifted off the card and carried by the cursor. */
function KeyChip({ at, lift, drop }: { at: Pt; lift: number; drop: number }) {
  return (
    <span
      className="absolute flex h-[24px] items-center rounded-[8px] bg-white px-[10px]"
      style={{
        left: at.x - 110,
        top: at.y + 12 + 6 * drop,
        opacity: lift * (1 - drop),
        transform: `scale(${lerp(0.9, 1, lift).toFixed(3)})`,
        transformOrigin: "100% 0",
        boxShadow: "0 10px 24px -10px rgba(7,41,41,0.26), 0 1px 3px rgba(7,41,41,0.08)",
        zIndex: 40,
      }}
    >
      <span className="whitespace-nowrap leading-[16px] text-[11px]" style={{ color: INK, fontFamily: MONO }}>
        {KEY}
      </span>
    </span>
  );
}

export default function ConnectCrm() {
  const { t } = useLoopClock(LOOP, REST_T);

  /* In from below, and away above as a pair. */
  const enter = easeOut(seg(t, T.enter[0], T.enter[1]));
  const exitA = easeInOut(seg(t, T.exit[0], T.exit[1]));
  const exitB = easeInOut(seg(t, T.exit[0] + 70, T.exit[1] + 70));

  /* Hover and press on the card. */
  const hover = easeOut(seg(t, T.hover[0], T.hover[1])) * (1 - seg(t, T.press[0], T.press[1]));
  const pressed = Math.sin(seg(t, T.press[0], T.press[1]) * Math.PI) + Math.sin(seg(t, T.copyPress[0], T.copyPress[1]) * Math.PI) + Math.sin(seg(t, T.drop[0], T.drop[0] + 140) * Math.PI);

  /* The turn: the card grows to the key while its content changes over. */
  const morph = seg(t, T.morph[0], T.morph[1]);
  const grow = morph <= 0 ? 0 : easeOutBack(morph);
  const outP = easeInOut(seg(t, T.out[0], T.out[1]));
  const inP = easeOut(seg(t, T.in[0], T.in[1]));

  /* Copied: the mark turns to a tick, and the chip lifts. */
  const copied = easeOut(seg(t, T.copyPress[1] - 40, T.copyPress[1] + 160));
  /* The chip lifts as the cursor leaves the copy mark, so it never sits over the card's own text. */
  const lift = easeOut(seg(t, T.carry[0], T.carry[0] + 220));
  const drop = easeInOut(seg(t, T.drop[0], T.drop[1]));

  /* The CRM joins, and the key card eases up and back to make room. */
  const sp = seg(t, T.join[0], T.join[1]);
  const join = sp <= 0 ? 0 : easeOutBack(sp);
  const settle = easeInOut(sp);

  /* Connected, and the prospects arrive. */
  const filled = easeOut(seg(t, T.drop[0] + 80, T.drop[1] + 80));
  const connected = easeOut(seg(t, T.connect[0], T.connect[1]));
  const tall = easeInOut(seg(t, T.grow[0], T.grow[1]));
  const rows: [number, number] = [easeOut(seg(t, T.row1[0], T.row1[1])), easeOut(seg(t, T.row2[0], T.row2[1]))];
  const synced = (rows[0] > 0.5 ? 1 : 0) + (rows[1] > 0.5 ? 1 : 0);

  const h1 = lerp(PROSPECT_H, CONTACT_H, grow);
  const h2 = lerp(CONTACT_H, CRM_TALL, tall);
  const pairTop = MID - (CONTACT_H + h2 - OVER) / 2;
  const top1 = lerp(MID - h1 / 2, pairTop, settle) + (1 - enter) * 18 - exitA * 44 - 2 * hover;
  const scale1 = (1 + 0.008 * hover - 0.015 * Math.min(1, pressed)) * lerp(1, BACK_SCALE, settle);
  const top2 = lerp(pairTop + CONTACT_H - OVER + 46, pairTop + CONTACT_H - OVER, join) - exitB * 44;

  const cursor = cursorAt(t);

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Connect your CRM">
      {/* The card: the integration, turning into its key. */}
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
              <IntegrationBody />
            </span>
          )}
          {inP > 0 && (
            <span className="absolute inset-0 block" style={{ opacity: inP, transform: `translateY(${(8 * (1 - inP)).toFixed(2)}px)` }}>
              <KeyBody copied={copied} />
            </span>
          )}
        </Shell>
      </div>

      {/* The CRM, tucking in front of the key. */}
      {sp > 0 && (
        <div
          className="absolute"
          style={{
            left: CARD.x,
            top: top2,
            width: CARD.w,
            height: h2,
            opacity: clamp01(sp * 3) * (1 - exitB),
            transform: `scale(${lerp(0.95, 1, clamp01(join)).toFixed(4)})`,
            transformOrigin: "50% 100%",
            zIndex: 25,
          }}
        >
          <Shell rim={1} shadow={FRONT_SHADOW}>
            <CrmBody filled={filled} connected={connected} rows={rows} synced={synced} />
          </Shell>
        </div>
      )}

      {/* The token, carried from the copy mark to the field. */}
      {lift > 0 && drop < 1 && <KeyChip at={cursor} lift={lift} drop={drop} />}

      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 200 }}>
        <TeamCursor at={cursor} pressed={Math.min(1, pressed)} />
      </div>
    </div>
  );
}
