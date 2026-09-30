import IntentTag from "@/components/IntentTag";
import { FONT, LIME, useCompanies, type Company } from "../shared";
import { clamp01, easeInOut, easeOut, lerp, pick, ProfileGlyph, seg, useLoopClock } from "./kit";
import { INK } from "./ProspectCards";

/**
 * Locked V3, Variation 2 — Signal to prospect.
 *
 * A new picture of what a prospect is, read top to bottom in a few seconds:
 *
 *   1. Your product on Software Finder — a small browser card: the address,
 *      your mark, your stars, and the pages buyers open: Pricing, Reviews,
 *      Demo. Anonymous visitors hover about it.
 *   2. One of them looks closer. It goes to a page; the page lights lime, and
 *      the look leaves as a signal — a lime spark that falls to the lens below.
 *      A second page, a second signal.
 *   3. Buyer Intelligence — the lens. Each signal lights a third of its ring.
 *      The visitor follows its signals down into it; the ring closes, a lime
 *      line passes over, and the anonymous silhouette resolves into a company.
 *   4. The prospect — a card grows out of the lens and fills in as you watch:
 *      who they are, how strong their intent is, what they looked at. It lands
 *      on the vendor's stack of prospects, and the stack steps back.
 *
 * Then the pages dim, another visitor takes the empty place, and the next one
 * looks closer. Every position is a function of time, so the loop is seamless.
 */

const MUTE = "rgba(47,43,61,0.62)";
const HAIR = "rgba(7,41,41,0.08)";
const GREY = "#98A2A2";

const PW = 389;

/** Your product's page on Software Finder. */
const LIST = { x: 72, y: 50, w: 245, h: 118, bar: 24 };
const TABS = [
  { label: "Pricing", x: 16, w: 62 },
  { label: "Reviews", x: 84, w: 66 },
  { label: "Demo", x: 156, w: 50 },
] as const;
const TAB_Y = 84;
const TAB_H = 22;
const tabCentre = (i: number) => ({ x: LIST.x + TABS[i].x + TABS[i].w / 2, y: LIST.y + TAB_Y + TAB_H / 2 });

/** Buyer Intelligence: the lens. */
const LENS = { x: PW / 2, y: 262, r: 30 };
/** The prospect, and the vendor's stack of them. */
const CARD = { w: 300, h: 92, x: (PW - 300) / 2, y: 338 };

/** Where the anonymous visitors wait, and the size of one. */
const SPOTS = [
  { x: 38, y: 132, phase: 0 },
  { x: 356, y: 92, phase: 0.33 },
  { x: 352, y: 176, phase: 0.66 },
] as const;
const AV = 28;

/** Which two pages each visitor looks at. */
const LOOKS = [
  [0, 1],
  [1, 2],
  [0, 2],
] as const;

const LOOP = 5600;
const REST_T = 4400;
const T = {
  toFirst: [0, 700] as const,
  firstHit: 760,
  toSecond: [1000, 1400] as const,
  secondHit: 1460,
  toLens: [1800, 2600] as const,
  identify: [2600, 3150] as const,
  emerge: [3150, 3750] as const,
  details: [3450, 3700] as const,
  count: [3550, 4150] as const,
  chips: [3850, 4000] as const,
  badge: [4150, 4400] as const,
  step: [3300, 3800] as const,
  refill: [4400, 5000] as const,
  reset: [4900, 5500] as const,
};
const SPARK_FLIGHT = 850;

type Pt = { x: number; y: number };
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, p: number): Pt => {
  const q = 1 - p;
  return {
    x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
    y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y,
  };
};
const easeOutBack = (p: number) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);

/** An anonymous visitor: a silhouette in a white disc. */
function Visitor({ at, size = AV, opacity = 1, ring = 0 }: { at: Pt; size?: number; opacity?: number; ring?: number }) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-[100px] bg-white"
      style={{
        left: at.x - size / 2,
        top: at.y - size / 2,
        width: size,
        height: size,
        opacity,
        boxShadow: `0 0 0 1px ${HAIR}, 0 0 0 ${(4 * ring).toFixed(1)}px rgba(177,250,99,${(0.45 * ring).toFixed(3)}), 0 6px 14px -6px rgba(7,41,41,0.25)`,
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="5.6" r="2.9" fill={GREY} />
        <path d="M2.6 14.2c.6-3 2.8-4.6 5.4-4.6s4.8 1.6 5.4 4.6" fill={GREY} />
      </svg>
    </span>
  );
}

/** A signal on its way: a lime spark with a short tail. */
function Spark({ path, p }: { path: [Pt, Pt, Pt, Pt]; p: number }) {
  if (p <= 0 || p >= 1) return null;
  return (
    <>
      {[0.12, 0.06, 0].map((lag, i) => {
        const q = clamp01(p - lag);
        const at = bez(...path, easeInOut(q));
        const s = [3, 4.5, 7][i];
        return (
          <span
            key={i}
            className="absolute block rounded-[100px]"
            style={{
              left: at.x - s / 2,
              top: at.y - s / 2,
              width: s,
              height: s,
              background: LIME,
              opacity: [0.35, 0.6, 1][i],
              boxShadow: i === 2 ? "0 0 8px 2px rgba(177,250,99,0.7), 0 0 0 1px rgba(7,41,41,0.12)" : undefined,
              zIndex: 40,
            }}
          />
        );
      })}
    </>
  );
}

/** The prospect card; `reveal` brings in its details, `chips` its signals one by one. */
function ProspectCard({
  company,
  looks,
  score,
  details = 1,
  chips = [1, 1],
  badge = 1,
}: {
  company: Company;
  looks: readonly number[];
  score: number;
  details?: number;
  chips?: number[];
  badge?: number;
}) {
  return (
    <span className="absolute inset-0 block">
      <span className="absolute left-[14px] top-[14px] block size-[36px]">
        <img alt="" src={company.logo} className="block size-full rounded-[10px] object-cover" />
        {badge > 0 && (
          <span
            className="absolute -bottom-[3px] -right-[3px] flex size-[15px] items-center justify-center rounded-[100px]"
            style={{ background: LIME, boxShadow: "0 0 0 2px #ffffff", transform: `scale(${badge.toFixed(3)})` }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 5.2L4.1 7.2L8 3.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
      <span className="absolute left-[62px] right-[108px] top-[14px] flex flex-col gap-[1px]" style={{ opacity: details, transform: `translateY(${((1 - details) * 4).toFixed(2)}px)` }}>
        <span className={`${FONT} truncate font-medium leading-[18px] text-[13.5px]`} style={{ color: INK }}>
          {company.name}
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTE }}>
          {company.industry}
        </span>
      </span>
      <span className="absolute right-[14px] top-[16px]" style={{ opacity: details }}>
        <IntentTag score={score} />
      </span>
      <span className="absolute left-[62px] top-[58px] flex gap-[6px]">
        {looks.map((l, i) => (
          <span
            key={l}
            className={`${FONT} flex h-[20px] items-center gap-[5px] rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
            style={{
              background: "rgba(177,250,99,0.32)",
              color: INK,
              opacity: chips[i],
              transform: `scale(${(0.8 + 0.2 * easeOutBack(chips[i])).toFixed(3)})`,
              transformOrigin: "0 50%",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 6s1.8-3.5 5-3.5S11 6 11 6s-1.8 3.5-5 3.5S1 6 1 6Z" stroke={INK} strokeWidth="1.1" />
              <circle cx="6" cy="6" r="1.4" fill={INK} />
            </svg>
            {TABS[l].label}
          </span>
        ))}
      </span>
    </span>
  );
}

const CARD_SHADOW = "0 0 0 1px rgba(7,41,41,0.05), 0 1px 2px 0 rgba(7,41,41,0.06), 0 10px 24px -8px rgba(7,41,41,0.2)";

export default function ProspectSignal() {
  const companies = useCompanies(80);
  const { t, cycle } = useLoopClock(LOOP, REST_T);
  if (companies.length < 4) return null;

  const company = (k: number) => pick(companies, k + 1);
  const looksOf = (k: number) => LOOKS[((k % 3) + 3) % 3];
  const cur = company(cycle);
  const looks = looksOf(cycle);
  const active = ((cycle % 3) + 3) % 3;
  const home = SPOTS[active];

  /* A slow drift for everything waiting, once a loop, so the stage is never still. */
  const drift = (phase: number, amp = 3) => Math.sin((t / LOOP + phase) * Math.PI * 2) * amp;

  /* The visitor: to the first page, the second, then down into the lens. */
  const first = tabCentre(looks[0]);
  const second = tabCentre(looks[1]);
  const perch = (c: Pt) => ({ x: c.x + 10, y: c.y + 16 });
  const homeAt = { x: home.x, y: home.y + drift(home.phase) };
  let visitor: Pt;
  if (t < T.toFirst[1]) {
    const p = easeInOut(seg(t, T.toFirst[0], T.toFirst[1]));
    visitor = bez(homeAt, { x: homeAt.x, y: homeAt.y - 30 }, { x: perch(first).x + 30, y: perch(first).y + 30 }, perch(first), p);
  } else if (t < T.toSecond[0]) visitor = perch(first);
  else if (t < T.toSecond[1]) {
    const p = easeInOut(seg(t, T.toSecond[0], T.toSecond[1]));
    visitor = bez(perch(first), { x: perch(first).x, y: perch(first).y + 14 }, { x: perch(second).x, y: perch(second).y + 14 }, perch(second), p);
  } else if (t < T.toLens[0]) visitor = perch(second);
  else {
    const p = easeInOut(seg(t, T.toLens[0], T.toLens[1]));
    visitor = bez(perch(second), { x: perch(second).x + 30, y: perch(second).y + 60 }, { x: LENS.x + 40, y: LENS.y - 50 }, LENS, p);
  }
  const inLens = seg(t, T.toLens[1] - 200, T.toLens[1]);
  const visitorSize = lerp(AV, 40, inLens);
  const hitRing = (at: number) => Math.sin(seg(t, at, at + 360) * Math.PI);

  /* The pages: lit by the visitor's look, dimmed again at the end. */
  const reset = 1 - easeInOut(seg(t, T.reset[0], T.reset[1]));
  const lit = (i: number) => {
    const at = i === looks[0] ? T.firstHit : i === looks[1] ? T.secondHit : Infinity;
    return easeOut(seg(t, at, at + 220)) * reset;
  };

  /* The signals: sparks from each page to the lens. */
  const sparkPath = (from: Pt): [Pt, Pt, Pt, Pt] => [from, { x: from.x, y: from.y + 70 }, { x: LENS.x + (from.x < LENS.x ? -50 : 50), y: LENS.y - 60 }, LENS];
  const spark1 = seg(t, T.firstHit, T.firstHit + SPARK_FLIGHT);
  const spark2 = seg(t, T.secondHit, T.secondHit + SPARK_FLIGHT);
  const arrived = (spark1 >= 1 ? 1 : 0) + (spark2 >= 1 ? 1 : 0);

  /* The lens: a third of the ring per signal, closed by the identification. */
  const identify = seg(t, T.identify[0], T.identify[1]);
  const ringFill = (identify > 0 ? (2 + identify) / 3 : arrived / 3) * reset;
  const flash = Math.max(
    Math.sin(seg(t, T.firstHit + SPARK_FLIGHT, T.firstHit + SPARK_FLIGHT + 300) * Math.PI),
    Math.sin(seg(t, T.secondHit + SPARK_FLIGHT, T.secondHit + SPARK_FLIGHT + 300) * Math.PI),
    Math.sin(seg(t, T.identify[1] - 150, T.identify[1] + 250) * Math.PI),
  );
  const morph = easeInOut(seg(t, T.identify[0] + 150, T.identify[1] - 50));
  const scanY = seg(t, T.identify[0] + 100, T.identify[1] - 50);
  const spin = (t / LOOP) * 360;

  /* The prospect: out of the lens, filling in, onto the stack. */
  const emerge = seg(t, T.emerge[0], T.emerge[1]);
  const grow = emerge <= 0 ? 0 : easeOutBack(emerge);
  const details = easeOut(seg(t, T.details[0], T.details[1]));
  const counted = easeOut(seg(t, T.count[0], T.count[1]));
  const score = Math.round(lerp(30, cur.score, counted));
  const chips = [easeOut(seg(t, T.chips[0], T.chips[0] + 250)), easeOut(seg(t, T.chips[1], T.chips[1] + 250))];
  const badge = t < T.badge[0] ? 0 : easeOutBack(seg(t, T.badge[0], T.badge[1]));
  const lensLogo = t < T.emerge[0] + 150 ? 1 : 1 - seg(t, T.emerge[0] + 150, T.emerge[0] + 300);
  const step = easeInOut(seg(t, T.step[0], T.step[1]));

  /* The vendor's stack: earlier prospects, stepping back as the new one lands. */
  const stack = [3, 2, 1].map(i => ({ k: cycle - i, depth: i - 1 + step }));

  /* The empty place is taken again by another anonymous visitor. */
  const refill = easeOut(seg(t, T.refill[0], T.refill[1]));

  const cardCentre = { x: CARD.x + CARD.w / 2, y: CARD.y + CARD.h / 2 };
  const cardAt = { x: lerp(LENS.x, cardCentre.x, clamp01(grow)), y: lerp(LENS.y, cardCentre.y, grow) };
  const cardScale = lerp(0.2, 1, grow);

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Signal to prospect">
      {/* The route: page to lens to prospect, a faint dashed thread. */}
      <svg className="absolute inset-0" width={PW} height={528} style={{ zIndex: 1 }}>
        <path
          d={`M ${LENS.x} ${LIST.y + LIST.h + 6} L ${LENS.x} ${LENS.y - LENS.r - 10} M ${LENS.x} ${LENS.y + LENS.r + 10} L ${LENS.x} ${CARD.y - 8}`}
          stroke="rgba(7,41,41,0.14)"
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
      </svg>

      {/* 1 — Your product on Software Finder. */}
      <div
        className="absolute overflow-hidden rounded-[12px] bg-white"
        style={{ left: LIST.x, top: LIST.y + drift(0.1, 1.5), width: LIST.w, height: LIST.h, boxShadow: CARD_SHADOW, zIndex: 10 }}
      >
        <div className="flex items-center gap-[4px] px-[10px]" style={{ height: LIST.bar, borderBottom: `1px solid ${HAIR}`, background: "rgba(7,41,41,0.02)" }}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block size-[5px] rounded-[100px]" style={{ background: "rgba(7,41,41,0.16)" }} />
          ))}
          <span className={`${FONT} ml-[8px] flex h-[14px] flex-1 items-center rounded-[4px] px-[6px] leading-[12px] text-[9.5px]`} style={{ background: "rgba(7,41,41,0.05)", color: MUTE }}>
            softwarefinder.com/your-product
          </span>
        </div>
        <span className="absolute left-[16px] top-[34px] flex size-[32px] items-center justify-center rounded-[9px]" style={{ background: "#072929" }}>
          <ProfileGlyph size={16} />
        </span>
        <span className={`${FONT} absolute left-[58px] top-[33px] font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Your product
        </span>
        <span className="absolute left-[58px] top-[53px] flex gap-[2px]">
          {[0, 1, 2, 3, 4].map(i => (
            <svg key={i} width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <path d="M5 .6l1.3 2.8 3 .3-2.3 2 .7 3L5 7.2 2.3 8.7l.7-3-2.3-2 3-.3L5 .6Z" fill="#F4B63F" />
            </svg>
          ))}
        </span>
        {TABS.map((tab, i) => {
          const l = lit(i);
          return (
            <span
              key={tab.label}
              className={`${FONT} absolute flex items-center justify-center rounded-[7px] font-medium leading-[14px] text-[11px]`}
              style={{
                left: tab.x,
                top: TAB_Y,
                width: tab.w,
                height: TAB_H,
                color: INK,
                background: l > 0 ? `rgba(177,250,99,${(0.12 + 0.88 * l).toFixed(3)})` : "rgba(7,41,41,0.05)",
                boxShadow: l > 0 ? `0 0 0 ${(3 * l).toFixed(1)}px rgba(177,250,99,${(0.25 * l).toFixed(3)})` : undefined,
              }}
            >
              {tab.label}
            </span>
          );
        })}
      </div>

      {/* The anonymous visitors, waiting — and the empty place filled again. */}
      {SPOTS.map((s, i) => {
        if (i === active) {
          if (t < T.refill[0]) return null;
          return <Visitor key={`wait-${i}`} at={{ x: s.x, y: s.y + drift(s.phase) + (1 - refill) * 8 }} opacity={refill} />;
        }
        return <Visitor key={`wait-${i}`} at={{ x: s.x, y: s.y + drift(s.phase) }} />;
      })}

      {/* 2 — The signals, falling to the lens. */}
      <Spark path={sparkPath(first)} p={spark1} />
      <Spark path={sparkPath(second)} p={spark2} />

      {/* 3 — Buyer Intelligence: the lens. */}
      <div className="absolute" style={{ left: LENS.x - 60, top: LENS.y - 60, width: 120, height: 120, zIndex: 20 }}>
        <span
          className="absolute inset-0 rounded-[100px]"
          style={{ background: `radial-gradient(circle, rgba(177,250,99,${(0.28 + 0.3 * flash).toFixed(3)}) 0%, rgba(177,250,99,0) 62%)` }}
        />
        <svg className="absolute inset-0" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="40" stroke="rgba(7,41,41,0.18)" strokeWidth="1" strokeDasharray="1.5 5" fill="none" transform={`rotate(${spin.toFixed(2)} 60 60)`} />
          <circle cx="60" cy="60" r={LENS.r} fill="rgba(255,255,255,0.86)" stroke="rgba(7,41,41,0.08)" strokeWidth="1" />
          {/* A focus reticle while the lens waits; lime while it identifies. */}
          <g stroke={identify > 0 && identify < 1 ? LIME : "rgba(7,41,41,0.28)"} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={morph > 0 || inLens > 0.5 ? 0 : 1}>
            <path d="M48 52v-4h4M68 48h4v4M72 68v4h-4M52 72h-4v-4" />
          </g>
          {ringFill > 0.01 && <circle
            cx="60"
            cy="60"
            r={LENS.r}
            stroke={LIME}
            strokeWidth={2.5 + 1.5 * flash}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${(2 * Math.PI * LENS.r * ringFill).toFixed(2)} ${(2 * Math.PI * LENS.r).toFixed(2)}`}
            transform="rotate(-90 60 60)"
          />}
        </svg>
      </div>

      {/* The visitor, on its way and in the lens — resolving into the company. */}
      {t < T.emerge[0] + 300 && (
        <div className="absolute" style={{ zIndex: 30, opacity: lensLogo }}>
          {morph < 1 && <Visitor at={visitor} size={visitorSize} opacity={1 - morph} ring={t < T.toLens[0] ? Math.max(hitRing(T.firstHit), hitRing(T.secondHit)) : 0} />}
          {morph > 0 && (
            <span
              className="absolute block overflow-hidden rounded-[100px]"
              style={{ left: LENS.x - 20, top: LENS.y - 20, width: 40, height: 40, opacity: morph, boxShadow: "0 0 0 2px #ffffff, 0 6px 14px -6px rgba(7,41,41,0.3)" }}
            >
              <img alt="" src={cur.logo} className="block size-full object-cover" />
            </span>
          )}
          {scanY > 0 && scanY < 1 && (
            <span
              className="absolute block h-[2px]"
              style={{ left: LENS.x - 24, width: 48, top: LENS.y - 22 + 44 * scanY, background: LIME, boxShadow: "0 0 6px 1px rgba(177,250,99,0.7)" }}
            />
          )}
        </div>
      )}

      {/* 4 — The vendor's stack of prospects. */}
      {stack.map(({ k, depth }) => {
        const d = Math.max(0, depth);
        const gone = clamp01(d - 2);
        if (gone >= 1) return null;
        return (
          <div
            key={`stack-${k}`}
            className="absolute overflow-hidden rounded-[14px] bg-white"
            style={{
              left: CARD.x,
              top: CARD.y + d * 11,
              width: CARD.w,
              height: CARD.h,
              transform: `scale(${(1 - d * 0.05).toFixed(4)})`,
              transformOrigin: "50% 100%",
              opacity: 1 - gone,
              zIndex: 24 - Math.round(d * 2),
              boxShadow: CARD_SHADOW,
            }}
          >
            <ProspectCard company={company(k)} looks={looksOf(k)} score={company(k).score} />
          </div>
        );
      })}

      {/* The new prospect, grown out of the lens. */}
      {grow > 0 && (
        <div
          className="absolute overflow-hidden rounded-[14px] bg-white"
          style={{
            left: cardAt.x - CARD.w / 2,
            top: cardAt.y - CARD.h / 2,
            width: CARD.w,
            height: CARD.h,
            transform: `scale(${cardScale.toFixed(4)})`,
            opacity: clamp01(emerge * 4),
            zIndex: 26,
            boxShadow: CARD_SHADOW,
          }}
        >
          <ProspectCard company={cur} looks={looks} score={score} details={details} chips={chips} badge={badge} />
        </div>
      )}

    </div>
  );
}
