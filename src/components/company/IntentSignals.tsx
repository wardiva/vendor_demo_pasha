import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  INTENT_BANDS,
  INTENT_SIGNALS,
  getIntentScore,
  getTriggeredSignals,
  type IntentSignal,
} from "@/data/intentSignals";
import { intentTagColor } from "@/components/IntentTag";

/**
 * Intent Signals — what the prospect's score is built from.
 *
 * A short section inside the Activity tab, above the timeline it is the key
 * to. Every arrangement below answers the same five questions and stops: how
 * many of the six fired, which was the strongest, what all six are, what band
 * each evidences, and which of them this company actually did.
 *
 * They differ in how they organise that, and the differences are real ones —
 * banded, gridded, ranked, plotted, attributed, tabulated — rather than the
 * same list in six colours. The switch between them is a review control shown
 * on local hosts only; a deployment renders whichever is chosen and nothing
 * else.
 *
 * Compactness is a requirement, not a nicety: a session card in the timeline
 * below runs about 200px, and a key that is taller than the thing it explains
 * has stopped being a key. Every one of these is shorter than that.
 */

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const FAINT = "rgba(47,43,61,0.45)";
const HAIR = "rgba(47,43,61,0.10)";
/** The product's own ink for something that has happened. */
const LIVE = "#072929";

type View = { signal: IntentSignal; live: boolean };

/* ── the pieces every arrangement is built from ── */

function Tick({ size = 10, color = LIVE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 block">
      <path d="M2.5 6.4L4.8 8.7L9.5 3.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Hollow({ size = 10 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="block shrink-0 rounded-[100px]"
      style={{ width: size, height: size, border: `1px solid rgba(47,43,61,0.20)` }}
    />
  );
}

/**
 * The module's framed card: a 2px tint ring at radius 12 over a white face at
 * radius 10, with the uniform 12px pad every other card in the Activity tab
 * uses. It was tighter here on the argument that a key is not a card — but it
 * sits between the summary cards and the session cards, and text starting 2px
 * in from theirs is the kind of difference you see without being able to name.
 */
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[rgba(244,242,240,0.6)] content-stretch flex items-start p-[2px] relative rounded-[12px] shrink-0 w-full">
      <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-w-px p-[12px] relative rounded-[10px]">
        {children}
      </div>
    </div>
  );
}

/**
 * The sentence, above every arrangement.
 *
 * The count says how much evidence there is and the strongest band says what
 * the best of it is worth — which together are the whole answer for a vendor
 * who is triaging rather than studying. Everything under it is the working.
 */
function Summary({ views }: { views: View[] }) {
  const live = views.filter(v => v.live);
  /* The strongest of the signals that actually fired — which is what it was
     always computing. What it said about it was the problem: "strongest:
     71%+", sitting a line above a bar reading 32%, is read as a second
     opinion on the score rather than as a fact about a signal. A band is
     what a signal is worth when it fires, not where the prospect landed, and
     the two are independent — a prospect can open the pricing page, firing a
     71%+ signal, and still score 32 on everything else they did. So the
     sentence now says "a 71%+ signal", naming the thing the band belongs to.
     The number is unchanged; only the claim it makes is. */
  const strongest = live.reduce<IntentSignal | null>((best, v) => (!best || v.signal.min > best.min ? v.signal : best), null);
  return (
    /* 12 on 20 in the 70% ink — the Activity tab's secondary text exactly, so
       the first line of the key sits on the same line as the value under
       every card heading around it. It was on 18, which is a leading nothing
       else in the tab uses. */
    <p className="font-['Inter',sans-serif] leading-[20px] shrink-0 text-[12px] w-full" style={{ color: MUTED }}>
      <span style={{ color: INK, fontWeight: 500 }}>{`${live.length} of ${views.length}`}</span>
      {" signals triggered"}
      {strongest && (
        <>
          {" · strongest is a "}
          <span style={{ color: LIVE, fontWeight: 500 }}>{strongest.range}</span>
          {" signal"}
        </>
      )}
    </p>
  );
}

/**
 * The section's heading, set the way the Activity tab sets every heading.
 *
 * 13 on 20, medium, in the tab's full ink — the same three values "First
 * Seen", "Last Seen", "Total Time" and "Visited" are set in, so this card
 * is headed like the cards around it rather than in a scale of its own.
 *
 * It says what the block under it is and stops. The count it used to carry
 * was a total of something already itemised directly beneath — six rows,
 * each either ticked or not — so the reader could either take the summary's
 * word for it or read the rows, and the rows are the evidence they came
 * for. A heading that restates its own contents is a heading competing with
 * them.
 */
function SignalsHeading({ children = "Signals Triggered" }: { children?: string }) {
  return (
    <p
      className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[13px] w-full"
      style={{ color: INK }}
    >
      {children}
    </p>
  );
}

/** A signal's name at the weight its state gives it. */
function Name({ view, size = 11.5, wrap = false }: { view: View; size?: number; wrap?: boolean }) {
  return (
    <span
      className={`font-['Inter',sans-serif] leading-[17px] ${wrap ? "" : "overflow-hidden text-ellipsis whitespace-nowrap"}`}
      style={{ fontSize: size, color: view.live ? INK : FAINT, fontWeight: view.live ? 500 : 400 }}
    >
      {view.signal.label}
    </span>
  );
}

function RangeText({ view, size = 10.5 }: { view: View; size?: number }) {
  return (
    <span
      className="font-['Inter',sans-serif] font-normal leading-[16px] shrink-0 whitespace-nowrap"
      style={{ fontSize: size, color: view.live ? MUTED : FAINT }}
    >
      {view.signal.range}
    </span>
  );
}

/* ── 1 · Banded rows ────────────────────────────────────────────────
   The combination. The sentence at the top, then the six organised by the
   band they evidence — one row per band rather than one per signal, which is
   what takes the list from six rows to three without dropping anything. The
   band is stated once at the left and its signals run along it, so the
   relationship the section exists to explain is the row itself. */
function BandedRows({ views }: { views: View[] }) {
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex flex-col w-full" style={{ marginTop: 6 }}>
        {INTENT_BANDS.map((band, i) => {
          const items = views.filter(v => v.signal.range === band.range);
          if (!items.length) return null;
          const anyLive = items.some(v => v.live);
          return (
            <div
              key={band.range}
              className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full"
              style={{
                paddingTop: i ? 6 : 0,
                paddingBottom: i < INTENT_BANDS.length - 1 ? 6 : 0,
                boxShadow: i < INTENT_BANDS.length - 1 ? `inset 0 -1px 0 0 ${HAIR}` : undefined,
              }}
            >
              <span
                className="font-['Inter',sans-serif] font-medium leading-[17px] shrink-0 text-[11px] w-[44px] whitespace-nowrap"
                style={{ color: anyLive ? LIVE : FAINT }}
              >
                {band.range}
              </span>
              <div className="flex flex-wrap gap-x-[12px] gap-y-[2px] min-w-px">
                {items.map(v => (
                  <span key={v.signal.label} className="content-stretch flex gap-[5px] items-center shrink-0">
                    {v.live ? <Tick /> : <Hollow />}
                    <Name view={v} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── 2 · Two columns ────────────────────────────────────────────────
   The six kept in their own fixed order — so a reader learns where each one
   lives and finds it by position on every prospect — but set in two columns
   so the list costs three lines instead of six. Density without grouping:
   nothing is re-ordered, so two companies can be compared row for row. */
function TwoColumns({ views }: { views: View[] }) {
  return (
    <Panel>
      <Summary views={views} />
      <div
        className="grid w-full"
        style={{ marginTop: 6, gridTemplateColumns: "1fr 1fr", columnGap: 14, rowGap: 4 }}
      >
        {views.map(v => (
          <span key={v.signal.label} className="content-stretch flex gap-[5px] items-center min-w-px">
            {v.live ? <Tick /> : <Hollow />}
            <span className="min-w-px overflow-hidden">
              <Name view={v} />
            </span>
            <span className="ml-auto">
              <RangeText view={v} />
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 3 · Band strength ──────────────────────────────────────────────
   Leads with how far up the scale the evidence reaches. Three segments, one
   per band, each filled by the share of its own signals that fired — so the
   shape of the bar is the prospect's profile at a glance, and a company that
   has only browsed looks different from one that has priced you before either
   name is read. The six are named underneath, so nothing is hidden in the
   picture. */
function BandStrength({ views }: { views: View[] }) {
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex gap-[4px] w-full" style={{ marginTop: 7 }}>
        {INTENT_BANDS.slice().reverse().map(band => {
          const items = views.filter(v => v.signal.range === band.range);
          const live = items.filter(v => v.live).length;
          const share = items.length ? live / items.length : 0;
          return (
            <div key={band.range} className="flex flex-col gap-[3px]" style={{ flex: items.length || 1 }}>
              <span className="relative block rounded-[100px] w-full" style={{ height: 4, background: "rgba(47,43,61,0.08)" }}>
                <span
                  className="absolute left-0 top-0 rounded-[100px]"
                  style={{ height: 4, width: `${share * 100}%`, background: LIVE }}
                />
              </span>
              <span
                className="font-['Inter',sans-serif] leading-[15px] text-[10px] whitespace-nowrap"
                style={{ color: live ? LIVE : FAINT, fontWeight: live ? 500 : 400 }}
              >
                {band.range} · {live}/{items.length}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-[12px] gap-y-[2px] w-full" style={{ marginTop: 6 }}>
        {views.map(v => (
          <span key={v.signal.label} className="content-stretch flex gap-[5px] items-center shrink-0">
            {v.live ? <Tick size={9} /> : <Hollow size={9} />}
            <Name view={v} size={11} />
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 4 · Strongest first ────────────────────────────────────────────
   Ranked rather than grouped: what fired, strongest band at the top, then
   what did not, under a rule. The first line of the list is always this
   prospect's best evidence, so the section can be read by its top edge alone
   — which is how a list gets read when there are nineteen prospects behind
   this modal. What it gives up is the fixed order the other two keep. */
function StrongestFirst({ views }: { views: View[] }) {
  const rank = (v: View) => (v.live ? 0 : 1) * 1000 - v.signal.min;
  const sorted = [...views].sort((a, b) => rank(a) - rank(b));
  const firstDead = sorted.findIndex(v => !v.live);
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex flex-col w-full" style={{ marginTop: 5 }}>
        {sorted.map((v, i) => (
          <span
            key={v.signal.label}
            className="content-stretch flex gap-[6px] items-center shrink-0 w-full"
            style={{
              paddingTop: i === firstDead && i !== 0 ? 4 : 0,
              paddingBottom: 0,
              boxShadow: i === firstDead - 1 && firstDead > 0 ? `inset 0 -1px 0 0 ${HAIR}` : undefined,
            }}
          >
            {v.live ? <Tick /> : <Hollow />}
            <span className="min-w-px overflow-hidden">
              <Name view={v} />
            </span>
            <span className="ml-auto">
              <RangeText view={v} />
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 5 · Against the score ──────────────────────────────────────────
   The only one that puts the prospect's actual score on screen and shows the
   bands under it, with their signals. It answers the question the others
   leave implicit: this company scores 65 — which of these behaviours put them
   there, and which band are they short of. The score is the one the modal's
   header is already showing, so the two cannot disagree. */
function AgainstTheScore({ views, company }: { views: View[]; company: string }) {
  const score = getIntentScore(company);
  const at = (n: number) => `${Math.max(0, Math.min(100, ((n - 30) / 70) * 100))}%`;
  return (
    <Panel>
      <Summary views={views} />
      <div className="relative w-full" style={{ marginTop: 8, height: 16 }}>
        <span className="absolute rounded-[100px]" style={{ left: 0, right: 0, top: 6, height: 4, background: "rgba(47,43,61,0.08)" }} />
        {INTENT_BANDS.map(band => {
          const items = views.filter(v => v.signal.range === band.range);
          const live = items.filter(v => v.live).length;
          if (!live) return null;
          return (
            <span
              key={band.range}
              className="absolute rounded-[100px]"
              style={{ left: at(band.min), width: `calc(${at(band.max)} - ${at(band.min)})`, top: 6, height: 4, background: "rgba(7,41,41,0.35)" }}
            />
          );
        })}
        {/* Where this prospect actually sits. */}
        <span className="absolute rounded-[100px]" style={{ left: at(score), marginLeft: -5, top: 2, width: 10, height: 10, background: LIVE, boxShadow: "0 0 0 2px #ffffff" }} />
        <span
          className="absolute font-['Inter',sans-serif] font-medium leading-[14px] text-[10px] whitespace-nowrap"
          style={{ left: at(score), marginLeft: -5, top: 14, color: LIVE, transform: "translateX(-40%)" }}
        >
          {score}%
        </span>
      </div>
      <div className="flex flex-col w-full" style={{ marginTop: 14 }}>
        {INTENT_BANDS.map(band => {
          const items = views.filter(v => v.signal.range === band.range);
          if (!items.length) return null;
          return (
            <span key={band.range} className="content-stretch flex gap-[8px] items-start shrink-0 w-full" style={{ paddingTop: 2 }}>
              <span
                className="font-['Inter',sans-serif] font-medium leading-[17px] shrink-0 text-[10.5px] w-[42px]"
                style={{ color: items.some(v => v.live) ? LIVE : FAINT }}
              >
                {band.range}
              </span>
              <span className="flex flex-wrap gap-x-[10px] min-w-px">
                {items.map(v => (
                  <span key={v.signal.label} className="content-stretch flex gap-[4px] items-center shrink-0">
                    {v.live ? <Tick size={9} /> : <Hollow size={9} />}
                    <Name view={v} size={11} />
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </Panel>
  );
}

/**
 * "Viewed Pricing" → "Pricing".
 *
 * Local to the columns, and a display transform rather than a rename: the
 * signal's name is its identity everywhere else — it is the key the triggered
 * set is built on and the string the other variations print — so nothing in
 * the data moves to make one arrangement read better.
 *
 * It earns its place here and nowhere else. A column is already headed by the
 * band, so every name under it shares the one verb, and "Viewed" repeated down
 * a narrow column is the word the eye has to skip past four times to reach the
 * word that differs. Dropping it turns three columns of phrases into three
 * columns of nouns.
 */
const shortLabel = (label: string) => label.replace(/^Viewed\s+/, "");

/* ── 11 – 13 · Bands with the score ─────────────────────────────────
   Band columns with the Six chips indicator over it, three ways.

   The colour is not invented here. IntentTag already decides what an intent
   score looks like — #FEFFCA at 30, #E6FFC3 at 51, #C3FFC9 at 71, warm
   through to green as intent climbs — and its own note says any surface
   showing a score should render that mapping rather than repeat it, so the
   bands cannot drift apart. `intentTagColor(band.min)` asks it for a band's
   fill. The chip on the prospect card, the chip in this modal's header and
   the bands under this bar are all the same three colours, which is what
   makes the bar legible at a glance: the reader has seen them already.

   What differs between the three is how the bar is tied to the columns:

     chips    colour ties them — the bar's segments and the column headings
              carry the same three fills
     aligned  geometry ties them — each column is as wide as its band's share
              of the scale, and the bar above is cut at the same places, so a
              column sits under its own segment
     minimal  position ties them — the scale is nearly colourless until the
              band the score is in, which is lit in both places at once

   The horizontal rule under each heading is gone from all three. Three rules
   side by side read as one broken row divider rather than as three columns —
   the same thing that was wrong with the five-column version. Colour and
   geometry do that work now. */

type BandColumnsStyle = "chips" | "aligned" | "minimal";

function BandColumns({
  views,
  company,
  style,
}: {
  views: View[];
  company: string;
  style: BandColumnsStyle;
}) {
  const score = scoreOf(company);
  const here = bandOfScore(score);
  /* Ascending, so bar and columns both read left to right as intent rises. */
  const columns = [...INTENT_BANDS]
    .reverse()
    .map(band => ({ band, items: views.filter(v => v.signal.range === band.range) }))
    .filter(c => c.items.length > 0);

  /** A band's share of the 30-to-100 the scale runs over. */
  const span = (b: { min: number; max: number }) => at(b.max) - at(b.min);

  const signalRows = (items: View[]) =>
    items.map(v => (
      <span
        key={v.signal.label}
        className="content-stretch flex gap-[8px] h-[20px] items-center min-w-px shrink-0 w-full"
      >
        {v.live ? <Tick /> : <Hollow />}
        <span
          className="font-['Inter',sans-serif] leading-[20px] min-w-px overflow-hidden text-[12px] text-ellipsis whitespace-nowrap"
          style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
          title={v.signal.label}
        >
          {shortLabel(v.signal.label)}
        </span>
      </span>
    ));

  /* ── the indicator ── */
  const marker = (
    <span
      aria-hidden
      className="absolute rounded-[2px]"
      style={{ left: `${at(score)}%`, marginLeft: -1, top: -2, bottom: -2, width: 2, background: LIVE }}
    />
  );

  const scoreLabel = (
    <span
      className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] whitespace-nowrap"
      style={{ color: LIVE }}
    >
      {`${score}%`}
    </span>
  );

  return (
    <Panel>
      {/* No heading. It was not asked for, the arrangement never had one, and
          at 22px it is the most expensive thing that could be added to a
          section whose brief is "compact". The count line says what this is. */}
      <Summary views={views} />

      {/* ── chips: one full-width scale, the three fills, colour ties it to
             the headings below ── */}
      {style === "chips" && (
        <div className="content-stretch flex gap-[12px] items-center w-full" style={{ marginTop: 12 }}>
          <span
            className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] w-[48px]"
            style={{ color: INK }}
          >
            Intent
          </span>
          <div className="relative flex-1 min-w-px" style={{ height: 8 }}>
            {columns.map(({ band }, i) => (
              <span
                key={band.range}
                aria-hidden
                className="absolute bottom-0 top-0"
                style={{
                  left: `${at(band.min)}%`,
                  width: `${span(band)}%`,
                  background: intentTagColor(band.min),
                  borderTopLeftRadius: i === 0 ? 100 : 0,
                  borderBottomLeftRadius: i === 0 ? 100 : 0,
                  borderTopRightRadius: i === columns.length - 1 ? 100 : 0,
                  borderBottomRightRadius: i === columns.length - 1 ? 100 : 0,
                }}
              />
            ))}
            {marker}
          </div>
          {scoreLabel}
        </div>
      )}

      {/* ── aligned: the bar is the columns' own header strip, cut where they
             are cut, each band as wide as its share of the scale ── */}
      {style === "aligned" && (
        <div className="content-stretch flex gap-[12px] items-baseline w-full" style={{ marginTop: 12 }}>
          <span
            className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px]"
            style={{ color: INK }}
          >
            Intent
          </span>
          {scoreLabel}
          <span
            className="font-['Inter',sans-serif] leading-[20px] shrink-0 text-[11px] whitespace-nowrap"
            style={{ color: MUTED }}
          >
            {here ? `· ${here}` : ""}
          </span>
        </div>
      )}

      {/* ── minimal: the scale stays quiet until the band the score is in ── */}
      {style === "minimal" && (
        <div className="content-stretch flex gap-[12px] items-center w-full" style={{ marginTop: 12 }}>
          <span
            className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] w-[48px]"
            style={{ color: INK }}
          >
            Intent
          </span>
          <div className="relative flex-1 min-w-px" style={{ height: 6 }}>
            {columns.map(({ band }, i) => {
              const active = band.range === here;
              return (
                <span
                  key={band.range}
                  aria-hidden
                  className="absolute bottom-0 top-0"
                  style={{
                    left: `${at(band.min)}%`,
                    width: `${span(band)}%`,
                    background: intentTagColor(band.min),
                    opacity: active ? 1 : 0.4,
                    borderTopLeftRadius: i === 0 ? 100 : 0,
                    borderBottomLeftRadius: i === 0 ? 100 : 0,
                    borderTopRightRadius: i === columns.length - 1 ? 100 : 0,
                    borderBottomRightRadius: i === columns.length - 1 ? 100 : 0,
                  }}
                />
              );
            })}
            {marker}
          </div>
          {scoreLabel}
        </div>
      )}

      {/* ── the columns ── */}
      <div
        className={`w-full ${style === "aligned" ? "content-stretch flex" : "grid"}`}
        style={
          style === "aligned"
            ? { marginTop: 8, columnGap: 12 }
            : {
                marginTop: 12,
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                columnGap: 12,
              }
        }
      >
        {columns.map(({ band, items }) => {
          const active = band.range === here;
          return (
            <div
              key={band.range}
              className="content-stretch flex flex-col items-start min-w-px"
              /* Aligned sizes each column by its band's share of the scale,
                 so the strip above it is its own. The other two divide the
                 width evenly, which keeps three unequal groups reading as
                 three columns. */
              style={style === "aligned" ? { flex: `${span(band)} 1 0` } : undefined}
            >
              {/* The strip: in `aligned` it is the bar itself, sitting over
                  the column it describes and carrying the mark when the
                  score falls inside it. */}
              {style === "aligned" && (
                <span
                  className="relative block shrink-0 w-full"
                  style={{ height: 8, marginBottom: 8 }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-[100px]"
                    style={{ background: intentTagColor(band.min) }}
                  />
                  {active && (
                    <span
                      aria-hidden
                      className="absolute rounded-[2px]"
                      style={{
                        /* Where the score sits inside this band, not on the
                           whole scale — the strip is this band and nothing
                           else, so the mark is placed against its own ends. */
                        left: `${((score - band.min) / (band.max - band.min)) * 100}%`,
                        marginLeft: -1,
                        top: -2,
                        bottom: -2,
                        width: 2,
                        background: LIVE,
                      }}
                    />
                  )}
                </span>
              )}

              {/* The range. In `chips` it takes the band's own fill, which is
                  the chip the prospect card and this modal's header already
                  draw a score in; in the other two it is plain text with a
                  2px accent over it in `minimal`. */}
              {style === "minimal" && (
                <span
                  aria-hidden
                  className="block rounded-[100px] shrink-0 w-full"
                  style={{
                    height: 2,
                    marginBottom: 8,
                    background: intentTagColor(band.min),
                    opacity: active ? 1 : 0.5,
                  }}
                />
              )}

              {style === "chips" ? (
                <span
                  className="content-stretch flex items-center justify-center min-w-[24px] px-[8px] py-px rounded-[6px] shrink-0"
                  style={{ background: intentTagColor(band.min), marginBottom: 8 }}
                >
                  <span
                    className="font-['Inter',sans-serif] font-medium leading-[18px] text-[11px] whitespace-nowrap"
                    style={{ color: INK }}
                  >
                    {band.range}
                  </span>
                </span>
              ) : (
                <span
                  className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] w-full whitespace-nowrap"
                  style={{ color: active ? LIVE : MUTED, marginBottom: 8 }}
                >
                  {band.range}
                </span>
              )}

              {signalRows(items)}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ══ 7 – 11 ═══════════════════════════════════════════════════════════
   The five that came after, all built on the two things that worked:
   Banded rows' arrangement, and the prospect's own score shown against the
   ranges rather than stated beside them. What differs is where the scale
   lives and what the hierarchy leads with. */

/** Where a number sits on the 30-to-100 the signals are scored against. */
const at = (n: number) => Math.max(0, Math.min(100, ((n - 30) / 70) * 100));

/**
 * The score this company carries.
 *
 * Computed from the activity, not read off the fixture beside it. The fixture
 * now holds the same number — it is generated from this function — but the
 * section reads the function, so the one place that draws the signals and the
 * score together cannot be fed a stale figure.
 */
const scoreOf = (company: string) => getIntentScore(company);

/** The band a score falls in, so a row can say "this is where they are". */
const bandOfScore = (score: number) =>
  INTENT_BANDS.find(b => score >= b.min && score <= b.max)?.range ?? null;

/** The bands that actually hold signals, in the order they are listed. */
const bandRows = (views: View[]) => INTENT_BANDS.filter(b => views.some(v => v.signal.range === b.range));

/** A band's signals, as every one of these draws them. */
function BandSignals({ items, size = 11 }: { items: View[]; size?: number }) {
  return (
    <div className="flex flex-wrap gap-x-[11px] gap-y-[2px] min-w-px">
      {items.map(v => (
        <span key={v.signal.label} className="content-stretch flex gap-[5px] items-center shrink-0">
          {v.live ? <Tick size={9} /> : <Hollow size={9} />}
          <Name view={v} size={size} />
        </span>
      ))}
    </div>
  );
}

/* ── 7 · Score in the gutter ────────────────────────────────────────
   Banded rows as it stands, with the scale stood on its end beside it. The
   bands already run in order down the panel, so the left gutter is a scale
   whether or not it is drawn — this draws it, and puts the prospect's mark on
   it beside the band they are in. The score is read off which row it sits
   against, which is the question the section is answering, and it costs the
   section no height at all. */
function ScoreGutter({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  const here = bandOfScore(score);
  const rows = bandRows(views);
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex gap-[10px] w-full" style={{ marginTop: 6 }}>
        <div className="flex flex-col relative shrink-0" style={{ width: 36 }}>
          <span className="absolute rounded-[100px]" style={{ left: 29, top: 5, bottom: 5, width: 3, background: "rgba(47,43,61,0.08)" }} />
          {rows.map(band => (
            <div key={band.range} className="flex flex-1 items-center justify-end relative" style={{ minHeight: 28 }}>
              {band.range === here && (
                <>
                  <span className="font-['Inter',sans-serif] font-medium leading-[15px] text-[10px]" style={{ color: LIVE, marginRight: 6 }}>
                    {score}%
                  </span>
                  <span className="absolute rounded-[100px]" style={{ left: 27, width: 7, height: 7, background: LIVE, boxShadow: "0 0 0 2px #ffffff" }} />
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col min-w-px w-full">
          {rows.map((band, i) => {
            const items = views.filter(v => v.signal.range === band.range);
            return (
              <div
                key={band.range}
                className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full"
                style={{
                  minHeight: 28,
                  boxShadow: i < rows.length - 1 ? `inset 0 -1px 0 0 ${HAIR}` : undefined,
                }}
              >
                <span
                  className="font-['Inter',sans-serif] font-medium leading-[17px] shrink-0 text-[11px] w-[44px] whitespace-nowrap"
                  style={{ color: items.some(v => v.live) ? LIVE : FAINT }}
                >
                  {band.range}
                </span>
                <BandSignals items={items} size={11.5} />
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ── 8 · Bands as tracks ────────────────────────────────────────────
   The scale is not a bar above the rows; it is the rows. Each band draws its
   own share of the 30-to-100 at the width that share is worth, so 71%+ is
   visibly the far end of the scale and 30–50 the near one, and the mark lands
   in whichever row holds the score. "Where are they" and "what did they do"
   become one glance rather than two. */
function BandTracks({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  const rows = bandRows(views);
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex flex-col gap-[7px] w-full" style={{ marginTop: 7 }}>
        {rows.map(band => {
          const items = views.filter(v => v.signal.range === band.range);
          const anyLive = items.some(v => v.live);
          const holds = band.range === bandOfScore(score);
          return (
            <div key={band.range} className="flex flex-col gap-[3px] w-full">
              <div className="flex items-center gap-[8px] w-full">
                <span
                  className="font-['Inter',sans-serif] font-medium leading-[15px] shrink-0 text-[10.5px] w-[44px] whitespace-nowrap"
                  style={{ color: anyLive ? LIVE : FAINT }}
                >
                  {band.range}
                </span>
                <span className="relative block flex-1" style={{ height: 8 }}>
                  <span className="absolute rounded-[100px]" style={{ left: 0, right: 0, top: 3, height: 2, background: "rgba(47,43,61,0.06)" }} />
                  <span
                    className="absolute rounded-[100px]"
                    style={{
                      left: `${at(band.min)}%`,
                      width: `${at(band.max) - at(band.min)}%`,
                      top: 3,
                      height: 2,
                      background: anyLive ? "rgba(7,41,41,0.45)" : "rgba(47,43,61,0.16)",
                    }}
                  />
                  {holds && (
                    <span
                      className="absolute rounded-[100px]"
                      style={{ left: `${at(score)}%`, marginLeft: -4, top: 0, width: 8, height: 8, background: LIVE, boxShadow: "0 0 0 2px #ffffff" }}
                    />
                  )}
                </span>
                {holds && (
                  <span className="font-['Inter',sans-serif] font-medium leading-[15px] shrink-0 text-[10px]" style={{ color: LIVE }}>
                    {score}%
                  </span>
                )}
              </div>
              <div style={{ paddingLeft: 52 }}>
                <BandSignals items={items} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── 9 · Score first ────────────────────────────────────────────────
   Leads with the number, because on a prospect opened deliberately that is
   what the reader came to understand. The scale sits under it at full width
   with the band boundaries ticked, and each band below is a single line — its
   count and its signals — so the section is the score, the scale, and three
   lines of evidence. */
function ScoreFirst({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  const live = views.filter(v => v.live);
  const strongest = live.reduce<IntentSignal | null>((b, v) => (!b || v.signal.min > b.min ? v.signal : b), null);
  const rows = bandRows(views);
  return (
    <Panel>
      <div className="flex items-baseline gap-[7px] w-full">
        <span className="font-['Inter',sans-serif] font-medium leading-[24px] text-[19px]" style={{ color: LIVE }}>
          {score}%
        </span>
        <span className="font-['Inter',sans-serif] leading-[18px] text-[11.5px]" style={{ color: MUTED }}>
          {`${live.length} of ${views.length} signals`}
          {strongest ? ` · strongest ${strongest.range}` : ""}
        </span>
      </div>

      <div className="relative w-full" style={{ marginTop: 5, height: 6 }}>
        <span className="absolute rounded-[100px]" style={{ left: 0, right: 0, top: 2, height: 2, background: "rgba(47,43,61,0.08)" }} />
        {INTENT_BANDS.map(b => (
          <span key={b.range} className="absolute" style={{ left: `${at(b.min)}%`, top: 0, width: 1, height: 6, background: HAIR }} />
        ))}
        <span
          className="absolute rounded-[100px]"
          style={{ left: `${at(score)}%`, marginLeft: -3, top: 0, width: 6, height: 6, background: LIVE, boxShadow: "0 0 0 2px #ffffff" }}
        />
      </div>

      <div className="flex flex-col w-full" style={{ marginTop: 7 }}>
        {rows.map((band, i) => {
          const items = views.filter(v => v.signal.range === band.range);
          const n = items.filter(v => v.live).length;
          return (
            <div
              key={band.range}
              className="flex items-center gap-[8px] w-full"
              style={{
                paddingTop: i ? 5 : 0,
                paddingBottom: i < rows.length - 1 ? 5 : 0,
                boxShadow: i < rows.length - 1 ? `inset 0 -1px 0 0 ${HAIR}` : undefined,
              }}
            >
              <span
                className="font-['Inter',sans-serif] font-medium leading-[17px] shrink-0 text-[10.5px] w-[62px] whitespace-nowrap"
                style={{ color: n ? LIVE : FAINT }}
              >
                {`${band.range} · ${n}/${items.length}`}
              </span>
              <BandSignals items={items} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── 10 · Reached, and not yet ──────────────────────────────────────
   Splits the six by where the score already is rather than by what fired. A
   band at or under the prospect's score is ground they have reached; a band
   above it is what they have not, and the signals in that band are the
   specific things that would take them there. It turns the section from a
   record into a next step, which is what a vendor reading a prospect wants
   out of it — and the tick still says which fired, so nothing is lost. */
function ReachedAndNotYet({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  const groups = [
    { label: `Reached · ${score}%`, bands: INTENT_BANDS.filter(b => score >= b.min), live: true },
    { label: "Not yet", bands: INTENT_BANDS.filter(b => score < b.min), live: false },
  ].filter(g => g.bands.length);
  return (
    <Panel>
      <Summary views={views} />
      <div className="relative w-full" style={{ marginTop: 6, height: 6 }}>
        <span className="absolute rounded-[100px]" style={{ left: 0, right: 0, top: 2, height: 2, background: "rgba(47,43,61,0.08)" }} />
        <span className="absolute rounded-[100px]" style={{ left: 0, width: `${at(score)}%`, top: 2, height: 2, background: "rgba(7,41,41,0.45)" }} />
        <span
          className="absolute rounded-[100px]"
          style={{ left: `${at(score)}%`, marginLeft: -3, top: 0, width: 6, height: 6, background: LIVE, boxShadow: "0 0 0 2px #ffffff" }}
        />
      </div>
      <div className="flex flex-col w-full" style={{ marginTop: 7 }}>
        {groups.map((g, gi) => (
          <div key={g.label} className="w-full" style={{ marginTop: gi ? 7 : 0 }}>
            <p
              className="font-['Inter',sans-serif] font-medium leading-[15px] text-[10px] tracking-[0.04em] uppercase"
              style={{ color: g.live ? LIVE : FAINT }}
            >
              {g.label}
            </p>
            {g.bands.map(band => {
              const items = views.filter(v => v.signal.range === band.range);
              if (!items.length) return null;
              return (
                <div key={band.range} className="flex items-center gap-[8px] w-full" style={{ marginTop: 3 }}>
                  <span
                    className="font-['Inter',sans-serif] font-medium leading-[17px] shrink-0 text-[10.5px] w-[44px] whitespace-nowrap"
                    style={{ color: g.live ? MUTED : FAINT }}
                  >
                    {band.range}
                  </span>
                  <BandSignals items={items} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ── 11 · Six on the scale ──────────────────────────────────────────
   One strip, six cells, in band order: each cell is a signal, filled where it
   fired. The strip runs left to right up the scale, so the count is the
   number of filled cells and the strongest is the rightmost filled one, and
   the prospect's mark rides above it at their real position. The names are
   underneath in the same order — the picture and the list are the same object
   twice rather than two things to reconcile. */
function SixOnTheScale({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  const ordered = [...views].sort((a, b) => a.signal.min - b.signal.min);
  return (
    <Panel>
      <Summary views={views} />
      <div className="relative w-full" style={{ marginTop: 8, height: 13 }}>
        <span
          className="absolute font-['Inter',sans-serif] font-medium leading-[12px] text-[10px] whitespace-nowrap"
          style={{ left: `${at(score)}%`, top: 0, transform: "translateX(-50%)", color: LIVE }}
        >
          {score}%
        </span>
        <span className="absolute" style={{ left: `${at(score)}%`, marginLeft: -0.5, top: 13, width: 1, height: 4, background: LIVE }} />
      </div>
      <div className="flex gap-[3px] w-full" style={{ marginTop: 4 }}>
        {ordered.map(v => (
          <span
            key={v.signal.label}
            className="flex-1 rounded-[2px]"
            title={`${v.signal.label} · ${v.signal.range}`}
            style={{ height: 6, background: v.live ? LIVE : "rgba(47,43,61,0.10)" }}
          />
        ))}
      </div>
      <div className="grid w-full" style={{ marginTop: 6, gridTemplateColumns: "1fr 1fr", columnGap: 12, rowGap: 3 }}>
        {ordered.map(v => (
          <span key={v.signal.label} className="content-stretch flex gap-[5px] items-center min-w-px">
            <span className="block shrink-0 rounded-[2px]" style={{ width: 6, height: 6, background: v.live ? LIVE : "rgba(47,43,61,0.14)" }} />
            <span className="min-w-px overflow-hidden">
              <Name view={v} size={11} />
            </span>
            <span className="ml-auto">
              <RangeText view={v} size={10} />
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ══ 1 – 3 ════════════════════════════════════════════════════════════
   The three that came out of the eleven.

   All of them carry the same four things, because those are the four the
   section exists to say: how much evidence there is, where the prospect sits
   on the scale, what all six signals are worth, and which of them fired. What
   differs is the structure that holds them — banded rows under the bar, the
   six as chips, or the six as tracks on one axis.

   A note that shaped all three: four of the six signals share the 51–70 band,
   so there is no single "strongest signal" to lead with, only a strongest
   band. Nothing here names one, which would be picking arbitrarily between
   four equals and telling the reader it meant something. */

/**
 * The prospect's score on the 30-to-100 the bands divide, with the number
 * riding the mark.
 *
 * The number is on the bar rather than beside it: a value floating next to a
 * track is two things to line up, and the whole point of the bar is that
 * where it sits is the answer. The band boundaries are cut into the track in
 * white, so the bar is visibly three bands rather than one continuous ramp —
 * which is what lets a reader match it to the rows underneath.
 */
function ScoreBar({ score, height = 16 }: { score: number; height?: number }) {
  const x = at(score);
  /* Kept inside its own track at either extreme rather than hanging off it. */
  const shift = x < 12 ? "0%" : x > 88 ? "-100%" : "-50%";
  return (
    /* Labelled, and in the same 48px column the band rows put their ranges
       in. Two kinds of percentage live in this section — what this prospect
       scored, and the band a signal is worth when it fires — and unlabelled
       they are the same glyph twice. The label says which this one is, and
       putting it where the band labels sit makes the bar read as one more
       row of the same table: "Score" is 32, "71%+" is these signals. */
    <div className="content-stretch flex gap-[12px] items-center w-full">
      <span
        className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] w-[48px] whitespace-nowrap"
        style={{ color: INK }}
      >
        Score
      </span>
      <div className="relative flex-1 min-w-px" style={{ height }}>
      <span className="absolute inset-0 rounded-[100px]" style={{ background: "rgba(47,43,61,0.06)" }} />
      <span
        className="absolute bottom-0 left-0 rounded-[100px] top-0"
        style={{ width: `${x}%`, background: "rgba(7,41,41,0.16)" }}
      />
      {INTENT_BANDS.filter(b => b.min > 30).map(b => (
        <span
          key={b.range}
          aria-hidden
          className="absolute bottom-0 top-0"
          style={{ left: `${at(b.min)}%`, width: 1, background: "#ffffff" }}
        />
      ))}
      <span
        className="absolute bg-white flex items-center justify-center rounded-[100px] top-0"
        style={{
          left: `${x}%`,
          transform: `translateX(${shift})`,
          height,
          padding: "0 7px",
          boxShadow: "0 1px 3px 0 rgba(47,43,61,0.22)",
        }}
      >
        <span className="font-['Inter',sans-serif] font-medium leading-[14px] text-[10px]" style={{ color: LIVE }}>
          {score}%
        </span>
      </span>
      </div>
    </div>
  );
}

/* ── the intent indicator ────────────────────────────────────────────
   Three designs of the same 20px row, so they can be held against each
   other with everything around them identical.

   The constraints they share. The row is labelled "Intent", in the same
   48px column the band rows put their ranges in. It carries the prospect's
   actual score, unrounded and unchanged. It shows all three bands, because
   a position means nothing without the scale it is on. And it fits in the
   height the row already had — 20px, a 12-on-20 label with the indicator
   centred against it — so none of them makes the section taller.

   The scale is 30 to 100 rather than 0 to 100: 30 is the floor of the
   lowest band, so a bar starting at 0 would spend its first third on
   territory no signal can put a prospect in. `at` does that mapping.
*/

type IntentBarVariant = "segmented" | "scale" | "ladder";

/** Ascending, which is the order a left-to-right scale reads in. */
const ASCENDING_BANDS = [...INTENT_BANDS].slice().reverse();

/** The band a score sits in, falling back to the lowest rather than to none. */
const bandAt = (score: number) =>
  ASCENDING_BANDS.find(b => score >= b.min && score <= b.max) ?? ASCENDING_BANDS[0];

/** The row's label and its 48px column, shared by all three. */
function IntentRow({ children }: { children: ReactNode }) {
  return (
    <div className="content-stretch flex gap-[12px] items-center w-full">
      <span
        className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[12px] w-[48px] whitespace-nowrap"
        style={{ color: INK }}
      >
        Intent
      </span>
      {children}
    </div>
  );
}

/* ── 1 · Segmented ───────────────────────────────────────────────────
   Three segments, one per band, each as wide as the share of the scale it
   owns — so 71%+ is visibly the long end and 30–50 the short one.

   The band a prospect is in is filled and states the score; the two they
   are not state their own range instead. That swap is the whole idea: at
   any moment the bar is showing you the two ranges you need in order to
   read the third, and the third is showing you the answer. Nothing is
   repeated and nothing is decorative — three boxes, three pieces of text.

   What it gives up is the exact position inside the band: 71% and 99% fill
   the same segment. The number is right there in the segment, so what is
   lost is the picture of it, not the fact. */
function SegmentedBar({ score }: { score: number }) {
  const here = bandAt(score);
  return (
    <IntentRow>
      <div className="flex flex-1 gap-[2px] min-w-px" style={{ height: 16 }}>
        {ASCENDING_BANDS.map(band => {
          const active = band.range === here.range;
          return (
            <div
              key={band.range}
              className="flex items-center justify-center min-w-px rounded-[4px]"
              /* Sized by the span each band actually owns, not evenly: an
                 even split would draw 71-to-100 the same width as 51-to-70
                 and quietly misstate the scale. */
              style={{
                flex: band.max - band.min,
                background: active ? "rgba(7,41,41,0.16)" : "rgba(47,43,61,0.06)",
              }}
            >
              <span
                className="font-['Inter',sans-serif] leading-[14px] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  fontSize: 9.5,
                  color: active ? LIVE : FAINT,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {active ? `${score}%` : band.range}
              </span>
            </div>
          );
        })}
      </div>
    </IntentRow>
  );
}

/* ── 2 · Scale ───────────────────────────────────────────────────────
   One continuous track, and the bands drawn as tone rather than as text.

   The three zones step from a faint wash to a firm one as the scale rises,
   so "further right is stronger" is carried by the bar itself and needs no
   labels to say it — which is what keeps this one quiet enough to sit under
   a sentence without competing with it. The boundaries are hairlines cut
   through the track at 51 and 71, present for anyone looking for them and
   invisible to anyone who is not.

   The mark is the only saturated thing in the row, so the eye lands on the
   position first and reads the number second, at the end of the track where
   the row naturally finishes. */
function ScaleBar({ score }: { score: number }) {
  const x = at(score);
  return (
    <IntentRow>
      <div className="relative flex-1 min-w-px" style={{ height: 16 }}>
        <span className="absolute rounded-[100px]" style={{ left: 0, right: 0, top: 5, height: 6, background: "rgba(47,43,61,0.05)" }} />
        {ASCENDING_BANDS.map((band, i) => (
          <span
            key={band.range}
            aria-hidden
            className="absolute"
            style={{
              left: `${at(band.min)}%`,
              width: `${at(band.max) - at(band.min)}%`,
              top: 5,
              height: 6,
              background: `rgba(7,41,41,${0.05 + i * 0.05})`,
              borderTopLeftRadius: i === 0 ? 100 : 0,
              borderBottomLeftRadius: i === 0 ? 100 : 0,
              borderTopRightRadius: i === ASCENDING_BANDS.length - 1 ? 100 : 0,
              borderBottomRightRadius: i === ASCENDING_BANDS.length - 1 ? 100 : 0,
            }}
          />
        ))}
        {ASCENDING_BANDS.filter(b => b.min > 30).map(b => (
          <span
            key={b.range}
            aria-hidden
            className="absolute"
            style={{ left: `${at(b.min)}%`, top: 4, width: 1, height: 8, background: "#ffffff" }}
          />
        ))}
        <span
          aria-hidden
          className="absolute rounded-[100px]"
          style={{
            left: `${x}%`,
            marginLeft: -5,
            top: 3,
            width: 10,
            height: 10,
            background: LIVE,
            boxShadow: "0 0 0 2px #ffffff",
          }}
        />
      </div>
      <span
        className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[11px] text-right whitespace-nowrap"
        style={{ color: LIVE, width: 30 }}
      >
        {score}%
      </span>
    </IntentRow>
  );
}

/* ── 3 · Ladder ──────────────────────────────────────────────────────
   The one that answers the question in words.

   The other two leave the reader to work out which band a position is in by
   looking at where the mark sits between two boundaries. That is a small
   piece of work, and it is the piece the section exists to do — so this one
   says it outright: the track, then the score, then the band it lands in,
   written the way the six signals below write theirs.

   The track keeps the picture — how far along, how much is behind them —
   and the words remove the inference. It costs a few characters at the end
   of a row that had spare width, and it is the only one of the three that
   cannot be misread. The track still starts on the 60px line the band rows
   start on, so the bar and the rows under it remain one column.
*/
function LadderBar({ score }: { score: number }) {
  const x = at(score);
  const here = bandAt(score);
  return (
    <IntentRow>
      <div className="relative flex-1 min-w-px" style={{ height: 10 }}>
        {ASCENDING_BANDS.map(band => {
          const left = at(band.min);
          const span = at(band.max) - left;
          /* How far this band has been filled: everything behind the score,
             nothing ahead of it, and the part of the way through for the one
             the score is in. The ladder, which is the whole idea — what is
             behind them, where they stopped. */
          const filled = Math.max(0, Math.min(x - left, span));
          return (
            <span
              key={band.range}
              className="absolute overflow-hidden rounded-[100px]"
              style={{ left: `${left}%`, width: `${span}%`, top: 2, height: 6, background: "rgba(47,43,61,0.08)" }}
            >
              {filled > 0 && (
                <span
                  className="absolute bottom-0 left-0 rounded-[100px] top-0"
                  style={{ width: `${(filled / span) * 100}%`, background: "rgba(7,41,41,0.38)" }}
                />
              )}
            </span>
          );
        })}
        {/* The bands divide themselves. A segment runs to its own maximum and
            the next starts at its own minimum, and 50 to 51 is 1.4% of the
            scale — so the gap between the three is the gap in the data,
            about four pixels at this width. Drawn hairlines on top of a
            continuous track were a heavier way of saying the same thing. */}
        <span
          aria-hidden
          className="absolute rounded-[1px]"
          style={{ left: `${x}%`, marginLeft: -1, top: 1, width: 2, height: 8, background: LIVE }}
        />
      </div>
      <span
        /* A flex line rather than an inline one. Two inline spans at 11.5 and
           10.5 share a baseline, and the line box that holds both of them is
           21px tall — one pixel more than the row everything else in this
           card sits on. Laying them out as flex boxes on a fixed 20 puts the
           row back on the grid. */
        className="content-stretch flex gap-[3px] items-baseline shrink-0 whitespace-nowrap"
        style={{ height: 20 }}
      >
        <span
          className="font-['Inter',sans-serif] font-medium leading-[20px] text-[11.5px]"
          style={{ color: LIVE }}
        >
          {`${score}%`}
        </span>
        <span className="font-['Inter',sans-serif] leading-[20px] text-[10.5px]" style={{ color: MUTED }}>
          {`· ${here.range}`}
        </span>
      </span>
    </IntentRow>
  );
}

/** The indicator, in whichever of the three designs is being looked at. */
function IntentBar({ score, variant }: { score: number; variant: IntentBarVariant }) {
  if (variant === "segmented") return <SegmentedBar score={score} />;
  if (variant === "scale") return <ScaleBar score={score} />;
  return <LadderBar score={score} />;
}

/* ── 1 · Score and bands ────────────────────────────────────────────
   The three parts that earned their place, in the order they answer the
   question.

   The sentence says how much evidence there is and what the best of it is
   worth. The bar says where that landed, with the number on the mark and the
   band boundaries cut into the track. Then the six, grouped by the band they
   evidence — three rows instead of six, which is what keeps the section
   shorter than the session card below it.

   The one addition is the tie between the middle two: the band row the score
   actually falls in is tinted, and its range is set in the product's live
   ink. So "strongest: 51–70%" at the top, the mark sitting in the second
   segment of the bar, and the highlighted row are three statements of one
   fact, and the eye joins them without being asked to.

   Triggered signals are set in ink at medium against a tick; the ones that
   did not fire are faint against a hollow ring. Two differences, weight and
   mark, so the state survives being read quickly. */
function ScoreAndBands({
  views,
  company,
  bar,
  summary = "sentence",
}: {
  views: View[];
  company: string;
  /* The one thing that varies between the three, plus "none" — the ladder
     variation now shows no indicator row at all. Everything else in this
     component is identical whichever is passed. */
  bar: IntentBarVariant | "none";
  /* The sentence, or a plain heading. The ladder variation takes the
     heading; the other two keep the sentence they were compared with. */
  summary?: "sentence" | "heading";
}) {
  const score = scoreOf(company);
  const here = bandOfScore(score);
  const rows = bandRows(views);
  return (
    <Panel>
      {/* The indicator row, where there is one.

          The ladder variation carries none: the score is on the modal header
          two inches above this card, so the section can be the evidence
          alone. Where a row is shown it leads, because a prospect is opened
          to find out how interested they are and the count beneath is what
          that rests on — what, then why.

          Blocks inside this card are one interval apart, 12 — the only gap
          the Activity tab uses between the blocks of a card and between the
          rows of the Visited timeline. With no indicator the sentence is the
          first block and takes the card's own padding instead. */}
      {bar !== "none" && (
        <>
          <IntentBar score={score} variant={bar} />
          <div style={{ height: 12 }} />
        </>
      )}
      {summary === "heading" ? <SignalsHeading /> : <Summary views={views} />}
      <div className="flex flex-col w-full" style={{ marginTop: 12 }}>
        {rows.map((band, i) => {
          const items = views.filter(v => v.signal.range === band.range);
          const anyLive = items.some(v => v.live);
          const holds = band.range === here;
          const first = i === 0;
          const last = i === rows.length - 1;
          return (
            <div
              key={band.range}
              /* 12 above and below every rule — the card's one interval
                 again — so a rule sits the same distance from the content
                 over it as from the content under it, and two bands are 24
                 apart rather than 16. At 8 the rules were closer to their
                 rows than the rows were to anything else, which is what made
                 three groups read as one block of text with lines in it. */
              className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full"
              style={{
                paddingTop: first ? 0 : 12,
                paddingBottom: last ? 0 : 12,
                boxShadow: last ? undefined : `inset 0 -1px 0 0 ${HAIR}`,
              }}
            >
              {/* The band the score is in, marked behind the row rather than
                  in it: it is a place, not another value to read. Held 2 off
                  the rules so it never sits on one, and carried 8 out into
                  the card's padding so the tint clears the text on both
                  sides. */}
              {holds && (
                <span
                  aria-hidden
                  className="absolute rounded-[8px]"
                  style={{
                    left: -8,
                    right: -8,
                    top: first ? -6 : 4,
                    bottom: last ? -6 : 4,
                    background: "rgba(7,41,41,0.05)",
                  }}
                />
              )}
              {/* 12 on 20, the size and leading the tab's own secondary text
                  is set in, so the band, its signals and the summary above
                  them all sit on one 20px line.

                  48 wide, and the gap after it stays 12 — the widest
                  interval the Activity tab uses anywhere. Widening the
                  column to buy more air between a range and a signal name
                  costs a wrapped line on four prospects at 56 and two at 52,
                  which is a worse trade than the four pixels is worth. The
                  Intent row above uses the same 48, so the bar and the
                  signals start on one line. */}
              <span
                className="font-['Inter',sans-serif] font-medium leading-[20px] relative shrink-0 text-[12px] w-[48px] whitespace-nowrap"
                style={{ color: anyLive ? LIVE : FAINT }}
              >
                {band.range}
              </span>
              <div className="flex flex-wrap gap-x-[12px] gap-y-[8px] min-w-px relative">
                {items.map(v => (
                  <span key={v.signal.label} className="content-stretch flex gap-[8px] items-center shrink-0">
                    {v.live ? <Tick /> : <Hollow />}
                    <span
                      className="font-['Inter',sans-serif] leading-[20px] text-[12px] whitespace-nowrap"
                      style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
                    >
                      {v.signal.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── 2 · Six chips ──────────────────────────────────────────────────
   The six as objects rather than as a list.

   A row in a table is read across — mark, name, range — and six of them is
   six crossings. A chip is read as one thing: it is filled or it is not, and
   it carries its own range, so the state and the worth arrive together and
   the reader never has to hold a column heading in mind to know what they
   are looking at. Filled against outlined is also the difference that
   survives the smallest glance, which is the one this section usually gets.

   They are laid out strongest band first and wrap into two lines, so the top
   line is the evidence that counts and the bottom is the rest. No row
   structure, no rules, no gutters to align — the section is a sentence, a
   bar, and six things.

   What it gives up is the band grouping: the ranges repeat across chips
   rather than being stated once. That is the trade, and it buys the shortest
   of the three. */
function SixChips({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  /* What fired first, strongest band first inside that, and what did not
     fire last. Sorting by band alone put the one signal this prospect has
     not produced — Viewed Pricing, the only thing in the top band — at the
     head of the section, so the first thing read was an empty outline. The
     evidence leads and the gap trails, which is also the order the reader
     wants it in: what they did, then what they have not done yet. */
  const ordered = [...views].sort(
    (a, b) => Number(b.live) - Number(a.live) || b.signal.min - a.signal.min,
  );
  return (
    <Panel>
      <Summary views={views} />
      <div style={{ marginTop: 8, width: "100%" }}>
        <ScoreBar score={score} />
      </div>
      <div className="flex flex-wrap gap-[5px] w-full" style={{ marginTop: 8 }}>
        {ordered.map(v => (
          <span
            key={v.signal.label}
            className="content-stretch flex gap-[5px] items-center rounded-[6px] shrink-0"
            style={{
              padding: "3px 8px",
              background: v.live ? "rgba(7,41,41,0.08)" : undefined,
              border: v.live ? "1px solid transparent" : `1px solid ${HAIR}`,
            }}
          >
            {v.live ? <Tick size={9} /> : <Hollow size={9} />}
            <span
              className="font-['Inter',sans-serif] leading-[16px] text-[11px] whitespace-nowrap"
              style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
            >
              {v.signal.label}
            </span>
            <span
              className="font-['Inter',sans-serif] font-normal leading-[16px] text-[10px] whitespace-nowrap"
              style={{ color: v.live ? MUTED : FAINT }}
            >
              {v.signal.range}
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 3 · One scale ──────────────────────────────────────────────────
   Every signal measured against the same axis, with the score drawn through
   all six.

   The other two put the score in one place and the signals in another, and
   leave the reader to carry the number down the list. Here there is one
   horizontal scale, 30 to 100, and six short tracks stacked on it: each
   signal's track occupies exactly the span of its own band, so the six form
   a staircase and a signal's worth is its position rather than a number to
   look up. The prospect's score is a single rule drawn down the whole stack.

   That rule does the work. Anything whose track ends left of it is ground the
   prospect has already made, and the one track that starts to the right of it
   — Viewed Pricing, at 71%+ — is the thing that has not happened and would
   move them if it did. "Why is the score here, and what would change it" is
   the picture rather than a second paragraph.

   Fired tracks are solid in the live ink; the rest are the same span drawn in
   a hairline, so the shape of the staircase is the same either way and only
   the weight changes. */
function OneScale({ views, company }: { views: View[]; company: string }) {
  const score = scoreOf(company);
  /* Up the scale, so the tracks step rightward as the list goes down. */
  const ordered = [...views].sort((a, b) => a.signal.min - b.signal.min || a.signal.label.localeCompare(b.signal.label));
  const NAME_W = 132;
  const RANGE_W = 42;
  return (
    <Panel>
      <Summary views={views} />

      <div className="relative w-full" style={{ marginTop: 8 }}>
        {/* The rule, drawn once behind all six rather than per row: it is one
            score, and six separate marks would read as six. It stops short of
            the last row's baseline so it does not collide with the rules. */}
        <span
          aria-hidden
          className="absolute"
          style={{
            left: `calc(${NAME_W}px + (100% - ${NAME_W + RANGE_W + 16}px) * ${at(score) / 100})`,
            top: 13,
            bottom: 2,
            width: 1,
            background: "rgba(7,41,41,0.30)",
          }}
        />
        <span
          className="absolute font-['Inter',sans-serif] font-medium leading-[13px] text-[10px] whitespace-nowrap"
          style={{
            left: `calc(${NAME_W}px + (100% - ${NAME_W + RANGE_W + 16}px) * ${at(score) / 100})`,
            top: 0,
            transform: at(score) > 82 ? "translateX(-100%)" : "translateX(-50%)",
            color: LIVE,
          }}
        >
          {/* Named, because the column down the right of this one is full of
              band ranges and an unlabelled percentage among them is just a
              fourth kind of number. */}
          {`Score ${score}%`}
        </span>

        <div className="flex flex-col w-full" style={{ marginTop: 15 }}>
          {ordered.map(v => (
            <div key={v.signal.label} className="flex gap-[8px] items-center w-full" style={{ height: 17 }}>
              <span
                className="font-['Inter',sans-serif] leading-[16px] overflow-hidden shrink-0 text-[11px] text-ellipsis whitespace-nowrap"
                style={{ width: NAME_W, color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
              >
                {v.signal.label}
              </span>
              <span className="relative block flex-1 min-w-px" style={{ height: 6 }}>
                <span
                  className="absolute rounded-[100px]"
                  style={{
                    left: `${at(v.signal.min)}%`,
                    width: `${Math.max(at(v.signal.max) - at(v.signal.min), 2)}%`,
                    top: 1,
                    height: 4,
                    background: v.live ? LIVE : "rgba(47,43,61,0.13)",
                  }}
                />
              </span>
              <span
                className="font-['Inter',sans-serif] font-normal leading-[16px] shrink-0 text-[10px] text-right whitespace-nowrap"
                style={{ width: RANGE_W, color: v.live ? MUTED : FAINT }}
              >
                {v.signal.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ── 17 · Five columns ──────────────────────────────────────────────
   Band columns transposed: a column per signal rather than a column per
   band, so the five sit on one line and none of them is buried three deep
   inside the busiest group.

   That is the flaw in the parent concept. Grouping by band puts one signal
   under 30–50, three under 51–70 and one under 71%+, so the columns are
   uneven, the eye has no single line to run along, and a reader looking for
   Reviews has to know which band it belongs to before they can find it.
   Here every signal has the same place every time — the order is fixed and
   rising, Category through Pricing — so the same signal is in the same
   column on every prospect and two prospects can be read against each other
   straight across.

   The cell keeps the parent's shape: a heading, a rule, then what is under
   it. Only what heads the column changes. With one signal to a column the
   signal is the heading and the band becomes the qualifier beneath it,
   sitting beside the mark it belongs to.

   It fits because it was measured to: at 424 of content and 12 between
   columns each one is 75 wide, "Alternatives" is 69 at this size and the
   mark with the longest band beside it is 60. Nothing here wraps, truncates
   or is set smaller than the tab to make room.

   The shortest arrangement of the seventeen — 113px, against 148 for the
   banded rows and 196 for the ladder. */

/**
 * The columns, in the order they are read, with the name each one carries.
 *
 * Named here rather than derived. The short forms are not a rule applied to
 * the labels — "Viewed Category Page" becomes "Category", not "Category
 * Page" — so they are written out, and the full label stays the key that
 * finds the signal. Anything the data no longer holds simply does not draw.
 */
const FIVE_COLUMNS: ReadonlyArray<{ label: string; short: string }> = [
  { label: "Viewed Category Page", short: "Category" },
  { label: "Viewed Product Profile", short: "Profile" },
  { label: "Viewed Reviews", short: "Reviews" },
  { label: "Viewed Alternatives", short: "Alternatives" },
  { label: "Viewed Pricing", short: "Pricing" },
];

/**
 * The three arrangements of the five columns.
 *
 * All of them answer the same complaint. The first version ruled under each
 * heading, and five horizontal rules laid side by side do not read as five
 * columns — they read as one row divider with gaps in it, which is the
 * opposite of the structure. Nothing that separates columns can run across
 * them.
 *
 * So each of these carries the column structure in something that runs the
 * other way, or in something there are visibly five of:
 *
 *   ruled   a hairline standing in each gap, the table's own answer
 *   bars    a filled or hollow bar under each name, which marks the column
 *           and says whether it fired in the same stroke
 *   accent  a rule over each column doing both of those jobs at 2px
 *
 * None of them costs the names any width. At 424 of content and 12 between
 * columns each track is 75, "Alternatives" is 69 at this size, and a cell
 * with padding inside a border would leave 62 — which is why none of these
 * is a box. The rules sit in the gaps that were already there.
 */
type FiveStyle = "ruled" | "bars" | "accent";

/** The gap between columns, and what the rules in `ruled` are placed against. */
const FIVE_GAP = 12;

function FiveColumns({ views, style }: { views: View[]; style: FiveStyle }) {
  const columns = FIVE_COLUMNS.map(c => ({
    ...c,
    view: views.find(v => v.signal.label === c.label),
  })).filter((c): c is typeof c & { view: View } => Boolean(c.view));

  const n = columns.length;
  /* The centre of gap i, from the left edge of the grid. Each track is
     (100% - the gaps) / n, so gap i opens after i tracks and i-1 gaps. */
  const gapCentre = (i: number) =>
    `calc(${i} * (100% - ${(n - 1) * FIVE_GAP}px) / ${n} + ${(i - 1) * FIVE_GAP + FIVE_GAP / 2}px)`;

  const name = (view: View, short: string) => (
    <span
      className="font-['Inter',sans-serif] leading-[20px] overflow-hidden shrink-0 text-[12px] text-ellipsis w-full whitespace-nowrap"
      style={{ color: view.live ? INK : FAINT, fontWeight: view.live ? 500 : 400 }}
      title={view.signal.label}
    >
      {short}
    </span>
  );

  const range = (view: View, withMark: boolean) => (
    <span className="content-stretch flex gap-[6px] h-[20px] items-center min-w-px shrink-0 w-full">
      {withMark && (view.live ? <Tick /> : <Hollow />)}
      <span
        className="font-['Inter',sans-serif] leading-[20px] text-[11px] whitespace-nowrap"
        style={{ color: view.live ? LIVE : FAINT }}
      >
        {view.signal.range}
      </span>
    </span>
  );

  return (
    <Panel>
      {/* The heading and the count are a pair, 2 apart — the interval the tab
          puts between "Visited" and the location under it. The columns are
          the next block and take the card's own 12. */}
      <SignalsHeading>Viewed Summary</SignalsHeading>
      <div style={{ marginTop: 2, width: "100%" }}>
        <Summary views={views} />
      </div>

      <div className="relative w-full" style={{ marginTop: 12 }}>
        {/* Standing in the gaps rather than between the tracks, so the
            columns keep every pixel of their width and the rule is centred
            in the space that was already empty. Full height of the block:
            a divider that stops short of the content it divides is a dash. */}
        {style === "ruled" &&
          Array.from({ length: Math.max(0, n - 1) }, (_, k) => (
            <span
              key={k}
              aria-hidden
              className="absolute bottom-0 top-0"
              style={{ left: gapCentre(k + 1), width: 1, background: HAIR }}
            />
          ))}

        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            columnGap: FIVE_GAP,
          }}
        >
          {columns.map(({ short, view }) => (
            <div key={short} className="content-stretch flex flex-col items-start min-w-px">
              {/* A rule over the column, in the live ink when the signal
                  fired and a hairline when it did not. It is the column
                  marker and the state in one 2px stroke — five of them, so
                  the count of columns is never in question, and lit or not
                  is readable before any word is. */}
              {style === "accent" && (
                <span
                  aria-hidden
                  className="block rounded-[100px] shrink-0 w-full"
                  style={{ height: 2, marginBottom: 8, background: view.live ? LIVE : HAIR }}
                />
              )}

              {name(view, short)}

              {/* Filled or hollow, the width of its own column: the bar says
                  which column this is and whether it fired without a mark or
                  a border doing either. */}
              {style === "bars" && (
                <span
                  aria-hidden
                  className="block rounded-[100px] shrink-0 w-full"
                  style={{
                    height: 4,
                    marginTop: 6,
                    marginBottom: 6,
                    background: view.live ? LIVE : "rgba(47,43,61,0.10)",
                  }}
                />
              )}

              {/* The tick is the state in `ruled`, where nothing else carries
                  it. The other two already say it twice over, and a third
                  mark would be the noise this was meant to lose. */}
              {range(view, style === "ruled")}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ── the section ───────────────────────────────────────────────────── */

/**
 * The one that was chosen, by index into CONCEPTS.
 *
 * It is what the Activity tab opens with and what the picker marks "Final",
 * so the two can never disagree — moving the design means moving this
 * number, and both follow.
 */
const FINAL_CONCEPT = 0;

const CONCEPTS: ReadonlyArray<{ label: string; render: (views: View[], company: string) => ReactNode }> = [
  /* The finished design first, and the two it was chosen over behind it.
     All three are Score and bands, differing only in the indicator, so what
     separates them is exactly what was being decided. */
  { label: "1 · Bar: ladder", render: (v, c) => <ScoreAndBands views={v} company={c} bar="none" summary="heading" /> },
  { label: "2 · Bar: segmented", render: (v, c) => <ScoreAndBands views={v} company={c} bar="segmented" /> },
  { label: "3 · Bar: scale", render: (v, c) => <ScoreAndBands views={v} company={c} bar="scale" /> },

  /* The other section designs, and the eleven behind them. */
  { label: "4 · Six chips", render: (v, c) => <SixChips views={v} company={c} /> },
  { label: "5 · One scale", render: (v, c) => <OneScale views={v} company={c} /> },

  { label: "6 · Banded rows", render: v => <BandedRows views={v} /> },
  { label: "7 · Two columns", render: v => <TwoColumns views={v} /> },
  { label: "8 · Band strength", render: v => <BandStrength views={v} /> },
  { label: "9 · Strongest first", render: v => <StrongestFirst views={v} /> },
  { label: "10 · Against the score", render: (v, c) => <AgainstTheScore views={v} company={c} /> },
  { label: "11 · Bands: chips", render: (v, c) => <BandColumns views={v} company={c} style="chips" /> },
  { label: "12 · Bands: aligned", render: (v, c) => <BandColumns views={v} company={c} style="aligned" /> },
  { label: "13 · Bands: minimal", render: (v, c) => <BandColumns views={v} company={c} style="minimal" /> },
  { label: "14 · Score gutter", render: (v, c) => <ScoreGutter views={v} company={c} /> },
  { label: "15 · Band tracks", render: (v, c) => <BandTracks views={v} company={c} /> },
  { label: "16 · Score first", render: (v, c) => <ScoreFirst views={v} company={c} /> },
  { label: "17 · Reached / not yet", render: (v, c) => <ReachedAndNotYet views={v} company={c} /> },
  { label: "18 · Six on the scale", render: (v, c) => <SixOnTheScale views={v} company={c} /> },
  { label: "19 · Columns: ruled", render: v => <FiveColumns views={v} style="ruled" /> },
  { label: "20 · Columns: bars", render: v => <FiveColumns views={v} style="bars" /> },
  { label: "21 · Columns: accent", render: v => <FiveColumns views={v} style="accent" /> },
];

/* ── the concepts panel ─────────────────────────────────────────────
   A review control, and deliberately not part of the modal.

   It rides the modal's right edge rather than sitting inside the Activity
   tab, for two reasons. The list has outgrown the tab — eleven concepts is
   four wrapped rows of buttons pushing the timeline down the panel — and a
   picker that lives inside the thing it is changing makes it harder to see
   what changed. Out here it covers none of the modal: the dialog is a fixed
   754 centred in the window, so the panel is anchored half of that plus a
   gap from the middle and cannot overlap it.

   Portalled to the body because the modal clips its own overflow, and above
   it in the stack so a press lands on the panel rather than on the scrim that
   would close the dialog.

   One design, chosen out of three that were drawn: the stepping one. It is
   built out of the product's own parts rather than invented ones — the
   filter menu's card (white, radius 12, one soft shadow, no border, 4px of
   padding), the modal rail's selected state (a 16% tint of the product's
   ink, never a solid black pill) and the module's own 6px scrollbar. That is
   what "part of the product" means here: not a floating tool that borrowed
   the palette, but the same menu the rest of the app opens, holding concepts
   instead of industries.

   The other two and the control that switched between them are gone rather
   than hidden behind a flag: a picker with one option is chrome, and a dead
   branch kept "in case" is the thing that rots. */

const PANEL_KEY = "intent-signals-concepts";

/** The filter menu's card: one shadow, no border. A border under a shadow is
    the same edge drawn twice, and it is what made the old panel read as a
    tool stuck to the window rather than a menu belonging to the page. */
const CARD_SURFACE =
  "rounded-[12px] bg-white font-['Inter',sans-serif] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)]";

/** The modal rail's selected row, which is the product's answer to "this one". */
const SELECTED_BG = "rgba(7,41,41,0.16)";
const HOVER_BG = "rgba(7,41,41,0.06)";

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}
      className="cursor-pointer flex items-center justify-center rounded-[6px] shrink-0 size-[22px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
      style={{ color: MUTED }}
      aria-label="Close concepts"
      title="Close — the concept stays as it is"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** The number, set apart from the name it belongs to. */
function splitLabel(label: string) {
  const [num, ...rest] = label.split(" · ");
  return { num, name: rest.join(" · ") };
}

/** Keeps the selected row in view when it is stepped to rather than clicked. */
function useScrollSelectedIntoView(concept: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>('[data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [concept]);
  return ref;
}

type PanelProps = {
  concept: number;
  onPick: (i: number) => void;
  /** Relative move, wrapping — resolved against the concept at the moment it runs. */
  onStep: (delta: number) => void;
  onClose: () => void;
};

/* ── design 2 · index ────────────────────────────────────────────────
   Built for the way concepts are actually compared: one after another, fast.

   Comparing two arrangements means putting them in the same place a second
   apart, and a mouse cannot do that — you leave the design, cross the window,
   aim at a row, come back. So this one steps. The arrows at the top move one
   concept at a time and the arrow keys do the same without the trip, which
   makes the whole list a flick: eleven designs redrawn in the same frame, in
   order, while your eye stays on the frame.

   The list is still there, and still one click. It is narrower and tighter
   because it is now the map rather than the vehicle, and the selected row
   carries a rule down its left edge — position in a sequence, which is what
   you need when you are stepping through one. */
function IndexPanel({ concept, onStep, onPick, onClose }: PanelProps) {
  const listRef = useScrollSelectedIntoView(concept);

  /* On the window, not the panel: stepping should not depend on having
     clicked the panel first, and the modal holds focus. Ignored while a
     field has focus, and while a modifier is down, so it can never eat a
     shortcut or a keystroke meant for text.

     onStep moves from whatever the concept is when it runs rather than from
     what it was when this listener was made, which is the difference between
     a held arrow key walking the list and it moving one row and stopping:
     key repeat delivers faster than React re-renders, and every repeat after
     the first was computing its move from the same stale index. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      e.preventDefault();
      onStep(e.key === "ArrowDown" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);

  const arrow = "cursor-pointer flex items-center justify-center rounded-[6px] shrink-0 size-[22px] transition-colors hover:bg-[rgba(7,41,41,0.06)]";

  return (
    <div className="flex flex-col p-[4px] w-[190px]" data-panel-skin="index">
      {/* Steppers first, because they are the control this design is for. */}
      <div className="flex gap-[2px] h-[30px] items-center pl-[2px] pr-[4px] shrink-0">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onStep(-1);
          }}
          className={arrow}
          style={{ color: INK }}
          aria-label="Previous concept"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onStep(1);
          }}
          className={arrow}
          style={{ color: INK }}
          aria-label="Next concept"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="flex-1 pl-[4px] tabular-nums text-[11.5px]" style={{ color: MUTED }}>
          <span className="font-medium" style={{ color: INK }}>{concept + 1}</span>
          {` / ${CONCEPTS.length}`}
        </p>
        <CloseButton onClose={onClose} />
      </div>

      <div
        ref={listRef}
        role="tablist"
        aria-label="Intent Signals concept"
        className="filter-option-scroll flex flex-col gap-[1px] shrink-0"
        style={{ height: 7 * 26 + 6 }}
      >
        {CONCEPTS.map((c, i) => {
          const active = i === concept;
          const { num, name } = splitLabel(c.label);
          return (
            <button
              key={c.label}
              type="button"
              role="tab"
              aria-selected={active}
              data-selected={active}
              onClick={e => {
                e.stopPropagation();
                onPick(i);
              }}
              className="cursor-pointer flex gap-[7px] h-[26px] items-center overflow-hidden pl-[9px] pr-[8px] relative rounded-[7px] shrink-0 text-left transition-colors"
              style={{ background: active ? SELECTED_BG : undefined }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = HOVER_BG;
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = "";
              }}
            >
              {/* Where you are in the sequence, read at a glance. */}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 rounded-[2px] top-[5px]"
                  style={{ background: LIVE, height: 16, width: 2 }}
                />
              )}
              <span
                className="shrink-0 tabular-nums text-[10.5px] text-right w-[13px]"
                style={{ color: active ? LIVE : FAINT }}
              >
                {num}
              </span>
              <span
                className="flex-1 leading-[16px] overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap"
                style={{ color: active ? LIVE : INK, fontWeight: active ? 500 : 400 }}
              >
                {name}
              </span>
              {/* The lime chip the Filters button and the count use, at the
                  size this row can hold. It marks the finished design, which
                  is also the one the tab opens with — so it is the default
                  as well, and a second chip saying so would be the same
                  fact twice in a 190px panel. */}
              {i === FINAL_CONCEPT && (
                <span
                  className="flex items-center justify-center rounded-[4px] shrink-0"
                  style={{ background: "rgba(177,250,99,0.32)", padding: "1px 5px" }}
                  title="Final — the design the Activity tab opens with"
                >
                  <span className="font-semibold leading-[14px] text-[9.5px]" style={{ color: LIVE }}>
                    Final
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p
        className="pt-[7px] px-[9px] shrink-0 text-[10px]"
        style={{ color: FAINT, borderTop: `1px solid ${HAIR}`, marginTop: 4 }}
      >
        ↑ ↓ to step through
      </p>
    </div>
  );
}

/* ── the panel's two states, and the move between them ───────────────
   Open it is a card beside the dialog; closed it is a pill in the corner of
   the window. It is the same element in both, so closing it is a move and a
   shrink rather than one thing vanishing and another appearing somewhere
   else.

   That is why both contents stay mounted the whole time. The list is never
   torn down, so what it is scrolled to and which concept is selected survive
   a close with nothing saved and restored — there is nothing to restore,
   because nothing was lost. The panel is only faded and made unclickable.

   What does have to stop is the keyboard: the arrow keys step concepts off
   the window, and a hidden panel must not answer them. onStep is swapped for
   a no-op while it is closed, which the listener picks up through its own
   dependency. */

/** Stepping is silenced while the panel is closed; this is what replaces it. */
const NO_STEP = () => {};

const MOVE_MS = 300;
/* The ease the contact stack uses, so a panel moving across this app moves
   the way everything else in it does. */
const MOVE_EASE = "cubic-bezier(0.4, 0.05, 0.2, 1)";
/** Clear of the window's edges, and of the prototype bars in the corners. */
const PILL_INSET = 24;
const PILL_LABEL = "History — Variations of Activity Signals";

function ConceptsPanel({
  concept,
  onPick,
  onStep,
}: {
  concept: number;
  onPick: (i: number) => void;
  onStep: (delta: number) => void;
}) {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(PANEL_KEY) !== "closed";
    } catch {
      return true;
    }
  });
  const setOpenPersisted = (next: boolean) => {
    setOpen(next);
    try {
      sessionStorage.setItem(PANEL_KEY, next ? "open" : "closed");
    } catch {
      /* Storage unavailable — the choice still holds for this render. */
    }
  };

  /* Both contents are measured once, because the shell has to be given the
     size of whichever one it is becoming before it starts becoming it. They
     are laid out at their natural size and the shell is sized from them, so
     nothing here is a guessed width that a longer label would break. */
  const cardRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const [cardSize, setCardSize] = useState({ w: 190, h: 260 });
  const [pillSize, setPillSize] = useState({ w: 190, h: 30 });
  useLayoutEffect(() => {
    /* Watched rather than measured once: the list grows when a concept is
       added, and a font arriving late changes the label's width. A shell
       sized from a stale measurement either clips its own contents or holds
       a strip of empty card beside them. Only a real change is written back,
       so the observer cannot drive itself. */
    const fit = (
      el: HTMLElement | null,
      set: (next: { w: number; h: number }) => void,
    ) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      set({ w: Math.ceil(r.width), h: Math.ceil(r.height) });
    };
    const measure = () => {
      fit(cardRef.current, next =>
        setCardSize(s => (s.w === next.w && s.h === next.h ? s : next)),
      );
      fit(pillRef.current, next =>
        setPillSize(s => (s.w === next.w && s.h === next.h ? s : next)),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (cardRef.current) ro.observe(cardRef.current);
    if (pillRef.current) ro.observe(pillRef.current);
    return () => ro.disconnect();
  }, []);

  /* The window, so both anchors stay put when it is resized. */
  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Someone who has asked for less motion gets the same two positions with
     nothing in between. */
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ms = reduced ? 0 : MOVE_MS;

  /* Open: half the dialog's own width, plus a gap, from the centre, and
     centred vertically — held to the window if the list ever outgrows it.
     Closed: the bottom-right corner. */
  const h = Math.min(cardSize.h, vh - 2 * PILL_INSET);
  const box = open
    ? { left: vw / 2 + 389, top: Math.max(PILL_INSET, (vh - h) / 2), w: cardSize.w, h, r: 12 }
    : {
        left: vw - PILL_INSET - pillSize.w,
        top: vh - PILL_INSET - pillSize.h,
        w: pillSize.w,
        h: pillSize.h,
        r: pillSize.h / 2,
      };

  /* The box moves for the whole beat. The contents cross over inside it:
     whichever is arriving waits until the box is most of the way to its new
     shape, so a label never sits in a box still shaped like the other one. */
  const arriving = `opacity ${Math.round(ms * 0.55)}ms linear ${Math.round(ms * 0.45)}ms`;
  const leaving = `opacity ${Math.round(ms * 0.3)}ms linear`;

  return createPortal(
    <div
      className={CARD_SURFACE}
      style={{
        position: "fixed",
        zIndex: 10000,
        left: box.left,
        top: box.top,
        width: box.w,
        height: box.h,
        borderRadius: box.r,
        /* clip, not hidden. hidden leaves the shell a scroll container, and
           closing it moves focus' own 00d7 button out of a 30px box — so the
           browser scrolled it back into view and carried both contents 30px
           up with it, out of the pill and under the clip. clip cannot
           scroll, so there is nothing to scroll. */
        overflow: "clip",
        transition: `left ${ms}ms ${MOVE_EASE}, top ${ms}ms ${MOVE_EASE}, width ${ms}ms ${MOVE_EASE}, height ${ms}ms ${MOVE_EASE}, border-radius ${ms}ms ${MOVE_EASE}`,
      }}
      onClick={e => e.stopPropagation()}
      data-intent-concepts
      data-open={open}
    >
      {/* The list. Mounted whether or not it is being shown, which is what
          keeps its scroll and its selection across a close. */}
      <div
        ref={cardRef}
        role="group"
        aria-label="Intent Signals concept"
        /* inert rather than aria-hidden: the list is full of buttons, and a
           subtree that is hidden from the reader but still tabbable is the
           one combination worse than either. inert takes it out of the
           focus order too, which is also what stops the shell being asked
           to scroll to something inside it. */
        inert={!open}
        className="absolute left-0 top-0"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: open ? arriving : leaving,
        }}
      >
        <IndexPanel
          concept={concept}
          onPick={onPick}
          /* Silenced while closed: the arrow keys must not step a panel that
             is not on the window. */
          onStep={open ? onStep : NO_STEP}
          onClose={() => setOpenPersisted(false)}
        />
      </div>

      {/* The pill. Its own button, so the whole corner control is the hit
          target rather than the text inside it. */}
      <button
        type="button"
        ref={pillRef}
        onClick={e => {
          e.stopPropagation();
          setOpenPersisted(true);
        }}
        inert={open}
        className="absolute cursor-pointer flex h-[30px] items-center left-0 px-[12px] top-0 whitespace-nowrap"
        style={{
          /* max-content, or the label is measured wrong. An absolutely
             positioned box shrink-to-fits against its containing block, and
             the containing block here is the shell — which is 190 wide while
             the panel is showing. A label longer than that was being capped
             at 190, measured at 190, and then overflowed its own pill.
             max-content asks for the width the text actually wants, which is
             what the observer is there to read. */
          width: "max-content",
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          transition: open ? leaving : arriving,
        }}
        title={PILL_LABEL}
      >
        <span className="font-['Inter',sans-serif] leading-[16px] text-[11px]" style={{ color: MUTED }}>
          {PILL_LABEL}
        </span>
      </button>
    </div>,
    document.body,
  );
}

export default function IntentSignals({ company }: { company: string }) {
  /* Opens on the finished design, which is the first in the list. */
  const [concept, setConcept] = useState(FINAL_CONCEPT);
  const triggered = getTriggeredSignals(company);
  const views: View[] = INTENT_SIGNALS.map(signal => ({ signal, live: triggered.has(signal.label) }));

  return (
    /* No heading. The panel is read directly off the summary cards above it
       and the timeline below, and its own first line already says what it is
       — a title and a subtitle over three rows was label on label. */
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Intent Signals">
      {CONCEPTS[concept].render(views, company)}

      {/* Beside the modal, not inside it — see ConceptsPanel.

          Shown wherever the app runs, which is the point of it: this is a
          version history, and the people it is for read the deployed link
          rather than the dev server. It was gated to local hosts, so the one
          audience that could reach it was the one that did not need it — the
          same mistake the Profile and Pricing cards made in the other
          direction. The contact-reveal history beside it has never been
          gated; now the two agree. */}
      <ConceptsPanel
        concept={concept}
        onPick={setConcept}
        /* Functional, so a held arrow key walks the list instead of moving
           once: every repeat resolves against the concept as it is then. */
        onStep={d => setConcept(c => (c + d + CONCEPTS.length) % CONCEPTS.length)}
      />
    </div>
  );
}
