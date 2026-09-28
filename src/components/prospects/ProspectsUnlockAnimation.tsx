import { useEffect, useMemo, useRef, useState } from "react";
import { PROSPECTS } from "@/data/prospects";
import { intentTagColor } from "@/components/IntentTag";

/**
 * The right half of the locked Prospects dialog — what Buyer Intelligence
 * does, shown rather than said.
 *
 * One story, told one step at a time so nothing ever competes with the copy
 * beside it:
 *
 *   1  An anonymous company arrives — a card with no name, no logo, only the
 *      shape of one. Something is researching you; you cannot see who.
 *   2  Its activity lands as signals: Category, then Profile, then Pricing,
 *      each ticking in the product's own lime while the intent marker walks
 *      up the three bands behind them.
 *   3  Enough evidence, and the company is identified — the skeleton resolves
 *      into a real logo, a real name and an intent score. That is the moment
 *      the plan sells, and it is the same move the frosted page behind the
 *      dialog makes when it is unlocked.
 *   4  The prospect is filed into the list below, and the next anonymous
 *      visitor arrives.
 *
 * Everything on it is the product's own vocabulary — the prospect logos, the
 * lime tick, the three intent bands, the "Intent N%" chip — so it reads as a
 * preview of the product rather than an illustration of one. There is no copy
 * in it; the dialog's left half already says what this shows.
 *
 * It is decorative to assistive technology, which gets the same promise from
 * the heading. Someone who has asked for less motion sees the finished state
 * — an identified prospect over a filled list — with nothing moving.
 */

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const FAINT = "rgba(47,43,61,0.45)";
const LIVE = "#072929";
const SKELETON = "#eeedf0";

const SIGNALS = ["Category", "Profile", "Pricing"] as const;

/* The beat of one company, in milliseconds from its arrival. Slow on
   purpose: this runs beside a price, and it should feel considered, not
   busy. One full company is 4.6s; the loop is every company in turn. */
const T = {
  signal: [700, 1200, 1700] as const,
  identify: 2400,
  file: 3900,
  next: 4600,
};

const EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";

/* Where the intent marker sits after each signal — the story's evidence
   accumulating. The last stop is the company's own score. */
const stopsFor = (score: number) => [30, 42, 61, score];

/** A score's place on three equal bands, as the Activity tab draws it. */
function markLeft(score: number) {
  const bands = [
    { min: 30, max: 50 },
    { min: 51, max: 70 },
    { min: 71, max: 100 },
  ];
  const i = Math.max(0, bands.findIndex(b => score >= b.min && score <= b.max));
  const b = bands[i];
  const within = (Math.min(Math.max(score, b.min), b.max) - b.min) / (b.max - b.min);
  return `calc((100% - 6px) / 3 * ${(i + within).toFixed(4)} + ${3 * i}px)`;
}

type Company = { id: string; name: string; industry: string; logo: string; score: number };

function Tick({ on }: { on: boolean }) {
  return (
    <span className="relative block size-[12px] shrink-0">
      {/* The ring and the disc are both always drawn and cross-fade, so a
          signal arriving is a fill rather than a swap. */}
      <span
        className="absolute inset-0 rounded-[100px]"
        style={{ border: "1px solid rgba(47,43,61,0.2)", opacity: on ? 0 : 1, transition: `opacity 260ms ${EASE}` }}
      />
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="absolute inset-0 block"
        style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.6)", transition: `opacity 260ms ${EASE}, transform 320ms ${EASE}` }}
      >
        <circle cx="6" cy="6" r="5.5" fill="#b1fa63" stroke="#b1fa63" />
        <path d="M3.33 6.2L5 7.88L8.36 4.53" stroke={LIVE} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IntentChip({ score, small = false }: { score: number; small?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[6px] font-['Inter',sans-serif] font-medium whitespace-nowrap ${
        small ? "px-[6px] text-[10.5px] leading-[16px]" : "px-[8px] text-[11px] leading-[18px]"
      }`}
      style={{ background: intentTagColor(score), color: INK }}
    >
      {`Intent ${score}%`}
    </span>
  );
}

/** Skeleton bar with a slow sheen — the only thing on screen while nothing is known. */
function Bar({ w, h }: { w: number; h: number }) {
  return (
    <span className="bi-sheen relative block overflow-hidden rounded-[100px]" style={{ width: w, height: h, background: SKELETON }} />
  );
}

/** The live card: one company, from anonymous to identified. */
function LiveCard({
  company,
  signals,
  identified,
  filing,
  entering,
}: {
  company: Company;
  signals: number;
  identified: boolean;
  filing: boolean;
  entering: boolean;
}) {
  const score = stopsFor(company.score)[signals];
  const hidden = entering || filing;
  return (
    <div
      className="absolute left-0 right-0 top-0 rounded-[12px] bg-white p-[16px]"
      style={{
        border: "1px solid rgba(47,43,61,0.08)",
        boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.08)",
        opacity: hidden ? 0 : 1,
        transform: filing ? "translateY(18px) scale(0.97)" : entering ? "translateY(-8px)" : "none",
        transition: `opacity 420ms ${EASE}, transform 520ms ${EASE}`,
      }}
    >
      {/* Identity. The skeleton and the company occupy the same box and
          cross-fade, so identification is a resolve rather than a swap. */}
      <div className="relative flex h-[36px] items-center gap-[12px]">
        <span className="relative block size-[36px] shrink-0 overflow-hidden rounded-[8px]" style={{ background: SKELETON }}>
          <img
            alt=""
            src={company.logo}
            className="absolute inset-0 size-full object-cover"
            style={{ opacity: identified ? 1 : 0, filter: identified ? "none" : "blur(6px)", transition: `opacity 480ms ${EASE}, filter 520ms ${EASE}` }}
          />
        </span>
        <span className="relative block min-w-0 flex-1" style={{ height: 36 }}>
          <span
            className="absolute inset-0 flex flex-col justify-center gap-[7px]"
            style={{ opacity: identified ? 0 : 1, transition: `opacity 360ms ${EASE}` }}
          >
            <Bar w={132} h={9} />
            <Bar w={86} h={7} />
          </span>
          <span
            className="absolute inset-0 flex flex-col justify-center"
            style={{
              opacity: identified ? 1 : 0,
              transform: identified ? "none" : "translateY(3px)",
              transition: `opacity 480ms ${EASE} 80ms, transform 480ms ${EASE} 80ms`,
            }}
          >
            <span className="truncate font-['Inter',sans-serif] font-medium leading-[20px] text-[14px]" style={{ color: INK }}>
              {company.name}
            </span>
            <span className="truncate font-['Inter',sans-serif] leading-[16px] text-[12px]" style={{ color: MUTED }}>
              {company.industry}
            </span>
          </span>
        </span>
        <span
          style={{
            opacity: identified ? 1 : 0,
            transform: identified ? "scale(1)" : "scale(0.92)",
            transition: `opacity 420ms ${EASE} 180ms, transform 420ms ${EASE} 180ms`,
          }}
        >
          <IntentChip score={company.score} />
        </span>
      </div>

      <div className="my-[14px] h-px w-full" style={{ background: "rgba(47,43,61,0.08)" }} />

      {/* The evidence, in the order a buyer tends to produce it. */}
      <div className="flex items-center gap-[14px]">
        {SIGNALS.map((s, i) => {
          const on = signals > i;
          return (
            <span key={s} className="flex items-center gap-[6px]">
              <Tick on={on} />
              <span
                className="font-['Inter',sans-serif] leading-[16px] text-[11.5px]"
                style={{ color: on ? INK : FAINT, fontWeight: on ? 500 : 400, transition: `color 260ms ${EASE}` }}
              >
                {s}
              </span>
            </span>
          );
        })}
      </div>

      {/* The three bands, and the marker walking up them as evidence lands. */}
      <div className="mt-[14px] flex items-center gap-[12px]">
        <span className="font-['Inter',sans-serif] font-medium leading-[16px] text-[11.5px]" style={{ color: INK }}>
          Intent
        </span>
        <span className="relative block h-[6px] flex-1">
          <span className="flex h-full w-full gap-[3px]">
            {[30, 51, 71].map(min => (
              <span key={min} className="h-full flex-1 rounded-[100px]" style={{ background: intentTagColor(min) }} />
            ))}
          </span>
          <span
            className="absolute rounded-[2px]"
            style={{
              left: markLeft(score),
              marginLeft: -1,
              top: -2,
              bottom: -2,
              width: 2,
              background: LIVE,
              transition: `left 620ms ${EASE}`,
            }}
          />
        </span>
      </div>
    </div>
  );
}

const ROW_H = 48;
const ROW_GAP = 8;
const LIST_ROWS = 3;

/** An identified prospect, filed. */
function ListRow({ company, index, fresh }: { company: Company; index: number; fresh: boolean }) {
  return (
    <div
      className="absolute left-0 right-0"
      style={{
        top: 0,
        height: ROW_H,
        transform: `translateY(${index * (ROW_H + ROW_GAP)}px)`,
        /* The oldest row fades as it is pushed past the last slot. */
        opacity: index >= LIST_ROWS ? 0 : 1 - index * 0.14,
        transition: `transform 560ms ${EASE}, opacity 560ms ${EASE}`,
      }}
    >
      <div
        className={`flex h-full items-center gap-[10px] rounded-[10px] bg-white px-[12px] ${fresh ? "bi-row-in" : ""}`}
        style={{ border: "1px solid rgba(47,43,61,0.07)" }}
      >
        <img alt="" src={company.logo} className="size-[28px] shrink-0 rounded-[7px] object-cover" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-['Inter',sans-serif] font-medium leading-[18px] text-[12.5px]" style={{ color: INK }}>
            {company.name}
          </span>
          <span className="truncate font-['Inter',sans-serif] leading-[14px] text-[10.5px]" style={{ color: MUTED }}>
            {company.industry}
          </span>
        </span>
        <IntentChip score={company.score} small />
      </div>
    </div>
  );
}

type Filed = { key: number; company: Company };

export default function ProspectsUnlockAnimation() {
  /* The companies it cycles through are the app's own high-intent prospects,
     so the logos and names are ones the reader will meet on the page. */
  const companies = useMemo<Company[]>(
    () =>
      PROSPECTS.filter(p => p.intentPct >= 80)
        .slice(0, 5)
        .map(p => ({ id: p.id, name: p.name, industry: p.industry, logo: p.logo, score: p.intentPct })),
    [],
  );

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const n = companies.length;
  const [turn, setTurn] = useState(0);
  const [signals, setSignals] = useState(reduced ? 3 : 0);
  const [identified, setIdentified] = useState(reduced);
  const [filing, setFiling] = useState(false);
  const [entering, setEntering] = useState(!reduced);
  /* Seeded with the two companies that precede the first, so the list is
     never empty and the loop has no visible start. */
  /* Seed rows take negative keys and filed rows count up from 1, so the two
     can never collide. */
  const counter = useRef(0);
  const [filed, setFiled] = useState<Filed[]>(() =>
    n ? [1, 2].map(k => ({ key: -k, company: companies[(((n - k) % n) + n) % n] })) : [],
  );
  const [freshKey, setFreshKey] = useState<number | null>(null);

  useEffect(() => {
    if (reduced || !n) return;
    const company = companies[turn % n];
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    setSignals(0);
    setIdentified(false);
    setFiling(false);
    setEntering(true);
    at(40, () => setEntering(false));
    T.signal.forEach((ms, i) => at(ms, () => setSignals(i + 1)));
    at(T.identify, () => setIdentified(true));
    at(T.file, () => {
      setFiling(true);
      const key = ++counter.current;
      setFreshKey(key);
      setFiled(list => [{ key, company }, ...list].slice(0, LIST_ROWS + 1));
    });
    at(T.next, () => setTurn(t => t + 1));

    return () => timers.forEach(id => window.clearTimeout(id));
  }, [turn, n, companies, reduced]);

  if (!n) return null;
  const company = companies[turn % n];

  /* Composition: the live card over the filed list, centred in the panel. */
  const LIVE_H = 150;
  const GAP = 28;
  const LIST_H = LIST_ROWS * ROW_H + (LIST_ROWS - 1) * ROW_GAP;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Buyer Intelligence animation">
      <div
        className="absolute left-[32px] right-[32px]"
        style={{ top: "50%", height: LIVE_H + GAP + LIST_H, transform: "translateY(-50%)" }}
      >
        <div className="relative" style={{ height: LIVE_H }}>
          <LiveCard company={company} signals={signals} identified={identified} filing={filing} entering={entering} />
        </div>
        <div className="relative" style={{ marginTop: GAP, height: LIST_H }}>
          {filed.map((f, i) => (
            <ListRow key={f.key} company={f.company} index={i} fresh={f.key === freshKey} />
          ))}
        </div>
      </div>
    </div>
  );
}
