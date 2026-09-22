import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { INTENT_BANDS, INTENT_SIGNALS, getTriggeredSignals, type IntentSignal } from "@/data/intentSignals";
import { getCompanyProfile } from "@/data/companies";
import { IS_LOCAL } from "@/lib/environment";

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
  const strongest = live.reduce<IntentSignal | null>((best, v) => (!best || v.signal.min > best.min ? v.signal : best), null);
  return (
    <p className="font-['Inter',sans-serif] leading-[18px] shrink-0 text-[12px] w-full" style={{ color: MUTED }}>
      <span style={{ color: INK, fontWeight: 500 }}>{`${live.length} of ${views.length}`}</span>
      {" signals triggered"}
      {strongest && (
        <>
          {" · strongest: "}
          <span style={{ color: LIVE, fontWeight: 500 }}>{strongest.range}</span>
        </>
      )}
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
  const score = getCompanyProfile(company)?.intentPct ?? 0;
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

/* ── 6 · Band columns ───────────────────────────────────────────────
   The banded arrangement turned on its side: the bands are columns, their
   signals stacked inside. It is the shortest of the six — the section is only
   as tall as the busiest band — and it reads as a small matrix, which suits
   someone comparing prospects rather than studying one. The cost is that the
   columns are uneven, so the eye has no single line to run along. */
function BandColumns({ views }: { views: View[] }) {
  return (
    <Panel>
      <Summary views={views} />
      <div className="flex gap-[10px] w-full" style={{ marginTop: 7 }}>
        {INTENT_BANDS.slice().reverse().map(band => {
          const items = views.filter(v => v.signal.range === band.range);
          if (!items.length) return null;
          const anyLive = items.some(v => v.live);
          return (
            <div key={band.range} className="flex flex-col gap-[3px] min-w-px" style={{ flex: 1 }}>
              <span
                className="font-['Inter',sans-serif] font-medium leading-[15px] text-[10px] whitespace-nowrap"
                style={{ color: anyLive ? LIVE : FAINT, borderBottom: `1px solid ${HAIR}`, paddingBottom: 3 }}
              >
                {band.range}
              </span>
              {items.map(v => (
                <span key={v.signal.label} className="content-stretch flex gap-[4px] items-start min-w-px">
                  <span style={{ marginTop: 3 }}>{v.live ? <Tick size={9} /> : <Hollow size={9} />}</span>
                  <span className="min-w-px">
                    <Name view={v} size={10.5} wrap />
                  </span>
                </span>
              ))}
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

/** The score this company carries — the one the modal's header shows. */
const scoreOf = (company: string) => getCompanyProfile(company)?.intentPct ?? 0;

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

/* ── the section ───────────────────────────────────────────────────── */

const CONCEPTS: ReadonlyArray<{ label: string; render: (views: View[], company: string) => ReactNode }> = [
  { label: "1 · Banded rows", render: v => <BandedRows views={v} /> },
  { label: "2 · Two columns", render: v => <TwoColumns views={v} /> },
  { label: "3 · Band strength", render: v => <BandStrength views={v} /> },
  { label: "4 · Strongest first", render: v => <StrongestFirst views={v} /> },
  { label: "5 · Against the score", render: (v, c) => <AgainstTheScore views={v} company={c} /> },
  { label: "6 · Band columns", render: v => <BandColumns views={v} /> },
  { label: "7 · Score gutter", render: (v, c) => <ScoreGutter views={v} company={c} /> },
  { label: "8 · Band tracks", render: (v, c) => <BandTracks views={v} company={c} /> },
  { label: "9 · Score first", render: (v, c) => <ScoreFirst views={v} company={c} /> },
  { label: "10 · Reached / not yet", render: (v, c) => <ReachedAndNotYet views={v} company={c} /> },
  { label: "11 · Six on the scale", render: (v, c) => <SixOnTheScale views={v} company={c} /> },
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
   would close the dialog. */

const PANEL_KEY = "intent-signals-concepts";

function ConceptsPanel({
  concept,
  onPick,
}: {
  concept: number;
  onPick: (i: number) => void;
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

  /* Half the dialog's own width, plus a gap, from the centre of the window. */
  const anchor = { left: "calc(50% + 389px)", top: "50%", transform: "translateY(-50%)" } as const;
  const shell = "fixed z-[10000] rounded-[10px] bg-white font-['Inter',sans-serif]";
  const shellStyle = {
    border: "1px solid rgba(47,43,61,0.18)",
    boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
  };

  if (!open) {
    return createPortal(
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          setOpenPersisted(true);
        }}
        className={`${shell} cursor-pointer px-[10px] py-[6px] text-[11px]`}
        style={{ ...anchor, ...shellStyle, color: INK }}
        data-intent-concepts
        title="Intent Signals concepts"
      >
        {`Concepts · ${concept + 1}`}
      </button>,
      document.body,
    );
  }

  return createPortal(
    <div
      className={`${shell} flex flex-col gap-[8px] p-[10px] w-[208px]`}
      style={{
        ...anchor,
        ...shellStyle,
        /* Held to the dialog's own height at most, so it can never run off
           the window however many concepts the list grows to. */
        maxHeight: "min(420px, calc(100vh - 48px))",
      }}
      onClick={e => e.stopPropagation()}
      data-intent-concepts
      role="group"
      aria-label="Intent Signals concept"
    >
      {/* Fixed: the list scrolls under it. */}
      <div className="flex items-center justify-between shrink-0">
        <p
          className="font-medium text-[10px] tracking-[0.04em] uppercase"
          style={{ color: MUTED }}
        >
          Intent signals · concepts
        </p>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setOpenPersisted(false);
          }}
          className="-mr-[2px] cursor-pointer flex h-[20px] items-center justify-center rounded-[6px] transition-colors w-[20px] hover:bg-[rgba(7,41,41,0.06)]"
          style={{ color: MUTED }}
          aria-label="Close concepts"
          title="Close — the concept stays as it is"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* The only part that scrolls, and it is a fixed height rather than a
          cap: the panel is the same size at eleven concepts as it will be at
          twenty, and the bar is there from the first one that does not fit
          rather than appearing the day the list crosses some threshold. The
          bar is the module's own — 6px, no track, thumb in the muted ink. */}
      <div
        role="tablist"
        aria-label="Intent Signals concept"
        className="filter-option-scroll -mr-[4px] flex flex-col gap-[2px] min-h-0 pr-[4px] shrink-0"
        style={{ height: 232 }}
      >
        {CONCEPTS.map((c, i) => {
          const active = i === concept;
          return (
            <button
              key={c.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={e => {
                e.stopPropagation();
                onPick(i);
              }}
              className="cursor-pointer rounded-[7px] px-[8px] py-[5px] shrink-0 text-left transition-colors"
              style={{
                background: active ? LIVE : "transparent",
                color: active ? "#ffffff" : INK,
              }}
            >
              <span className="block text-[11.5px] leading-[16px]" style={{ fontWeight: active ? 500 : 400 }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fixed: what is selected, and the way back to the first. */}
      <div
        className="flex items-center gap-[6px] shrink-0 pt-[8px]"
        style={{ borderTop: `1px solid ${HAIR}` }}
      >
        <p className="flex-1 text-[10.5px]" style={{ color: MUTED }}>
          {`${CONCEPTS.length} concepts`}
        </p>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onPick(0);
          }}
          className="cursor-pointer rounded-[6px] px-[8px] py-[3px] text-[10.5px] hover:bg-[rgba(7,41,41,0.06)]"
          style={{ border: "1px solid rgba(47,43,61,0.18)", color: INK }}
        >
          Reset
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function IntentSignals({ company }: { company: string }) {
  const [concept, setConcept] = useState(0);
  const triggered = getTriggeredSignals(company);
  const views: View[] = INTENT_SIGNALS.map(signal => ({ signal, live: triggered.has(signal.label) }));

  return (
    /* No heading. The panel is read directly off the summary cards above it
       and the timeline below, and its own first line already says what it is
       — a title and a subtitle over three rows was label on label. */
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Intent Signals">
      {CONCEPTS[concept].render(views, company)}

      {/* Beside the modal, not inside it — see ConceptsPanel. */}
      {IS_LOCAL && <ConceptsPanel concept={concept} onPick={setConcept} />}
    </div>
  );
}
