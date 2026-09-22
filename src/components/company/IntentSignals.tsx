import { useState, type ReactNode } from "react";
import { INTENT_BANDS, INTENT_SIGNALS, getTriggeredSignals, type IntentSignal } from "@/data/intentSignals";
import { IS_LOCAL } from "@/lib/environment";

/**
 * Intent Signals — what the prospect's score is built from.
 *
 * A short section inside the Activity tab, under the sessions it is explaining.
 * It answers three questions and stops: what we watch for, which of those this
 * company has done, and what band each one evidences. It is deliberately not a
 * dashboard — the timeline above it is the detail, and this is the key to it.
 *
 * Six arrangements of the same six facts are implemented so they can be
 * compared in place. The switch between them is a review control and is shown
 * on local hosts only; a deployment renders whichever is chosen below and
 * nothing else.
 */

/* ── the vocabulary, shared by all six ── */

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const FAINT = "rgba(47,43,61,0.45)";
/** The product's own ink for something that has happened. */
const LIVE = "#072929";

/** The tick a triggered signal carries. */
function Tick({ size = 11, color = LIVE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 block">
      <path d="M2.5 6.4L4.8 8.7L9.5 3.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A signal that has not fired: present, and plainly not ticked. */
function Hollow({ size = 11 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="block shrink-0 rounded-[100px]"
      style={{ width: size, height: size, border: `1px solid rgba(47,43,61,0.22)` }}
    />
  );
}

/** The module's framed card, which every panel in this modal sits on. */
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[rgba(244,242,240,0.6)] content-stretch flex items-start p-[2px] relative rounded-[12px] shrink-0 w-full">
      <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start min-w-px px-[12px] py-[10px] relative rounded-[10px]">
        {children}
      </div>
    </div>
  );
}

/** The band pill, at the weight a secondary fact takes here. */
function Range({ signal, live }: { signal: IntentSignal; live: boolean }) {
  return (
    <span
      className="font-['Inter',sans-serif] font-normal leading-[16px] shrink-0 text-[11px] whitespace-nowrap"
      style={{ color: live ? MUTED : FAINT }}
    >
      {signal.range}
    </span>
  );
}

type View = { signal: IntentSignal; live: boolean };

/* ── 1 · Signal rows ────────────────────────────────────────────────
   The recommended one. Six rows in the order the product lists them, each
   the signal, its band and whether it fired. Nothing is grouped, sorted or
   re-ranked, so the list reads the same for every prospect and the only thing
   that changes between two companies is which rows are lit — which is exactly
   the comparison a vendor is making. */
function SignalRows({ views }: { views: View[] }) {
  return (
    <Panel>
      {views.map((v, i) => (
        <div
          key={v.signal.label}
          className={`content-stretch flex gap-[8px] items-center relative shrink-0 w-full ${i ? "pt-[7px]" : ""} ${
            i < views.length - 1 ? "pb-[7px]" : ""
          }`}
          style={i < views.length - 1 ? { boxShadow: "inset 0 -1px 0 0 #f4f2f0" } : undefined}
          data-no-row-hover
        >
          {v.live ? <Tick /> : <Hollow />}
          <p
            className="font-['Inter',sans-serif] leading-[18px] min-w-px overflow-hidden relative shrink text-[12px] text-ellipsis whitespace-nowrap"
            style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
          >
            {v.signal.label}
          </p>
          <span className="ml-auto shrink-0">
            <Range signal={v.signal} live={v.live} />
          </span>
        </div>
      ))}
    </Panel>
  );
}

/* ── 2 · Grouped by status ──────────────────────────────────────────
   The same facts sorted by the answer the vendor came for. "Which of these did
   they do?" is answered by a count and a short list rather than by reading six
   rows and keeping score. What it gives up is the fixed order — the list is a
   different shape for every prospect, so it cannot be scanned by position. */
function Grouped({ views }: { views: View[] }) {
  const groups = [
    { label: "Triggered", items: views.filter(v => v.live), live: true },
    { label: "Not seen", items: views.filter(v => !v.live), live: false },
  ].filter(g => g.items.length);

  return (
    <Panel>
      {groups.map((g, i) => (
        <div key={g.label} className={`content-stretch flex flex-col gap-[6px] items-start w-full ${i ? "mt-[10px]" : ""}`}>
          <p
            className="font-['Inter',sans-serif] font-medium leading-[16px] text-[10px] tracking-[0.04em] uppercase"
            style={{ color: g.live ? LIVE : FAINT }}
          >
            {g.label} · {g.items.length}
          </p>
          <div className="flex flex-wrap gap-[6px] w-full">
            {g.items.map(v => (
              <span
                key={v.signal.label}
                className="content-stretch flex gap-[6px] items-center px-[8px] py-[3px] rounded-[6px] shrink-0"
                style={{
                  background: g.live ? "rgba(7,41,41,0.08)" : "rgba(47,43,61,0.04)",
                }}
              >
                <span
                  className="font-['Inter',sans-serif] leading-[16px] text-[11px] whitespace-nowrap"
                  style={{ color: g.live ? INK : FAINT, fontWeight: g.live ? 500 : 400 }}
                >
                  {v.signal.label}
                </span>
                <Range signal={v.signal} live={g.live} />
              </span>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  );
}

/* ── 3 · Score ladder ───────────────────────────────────────────────
   Organised by what the evidence is worth rather than by what it was. The
   bands are the rows, strongest at the top, and the signals sit inside the
   band they belong to. It answers a question the other two do not: how high
   does this prospect's behaviour reach, and what would have to happen for it
   to reach higher. */
function Ladder({ views }: { views: View[] }) {
  return (
    <Panel>
      {INTENT_BANDS.map((band, i) => {
        const items = views.filter(v => v.signal.range === band.range);
        if (!items.length) return null;
        const anyLive = items.some(v => v.live);
        return (
          <div
            key={band.range}
            className={`content-stretch flex gap-[10px] items-start relative shrink-0 w-full ${i ? "pt-[8px]" : ""} ${
              i < INTENT_BANDS.length - 1 ? "pb-[8px]" : ""
            }`}
            style={i < INTENT_BANDS.length - 1 ? { boxShadow: "inset 0 -1px 0 0 #f4f2f0" } : undefined}
          >
            <span
              className="font-['Inter',sans-serif] font-medium leading-[18px] shrink-0 text-[11px] w-[48px] whitespace-nowrap"
              style={{ color: anyLive ? LIVE : FAINT }}
            >
              {band.range}
            </span>
            <div className="flex flex-col gap-[4px] min-w-px">
              {items.map(v => (
                <span key={v.signal.label} className="content-stretch flex gap-[6px] items-center">
                  {v.live ? <Tick size={10} /> : <Hollow size={10} />}
                  <span
                    className="font-['Inter',sans-serif] leading-[18px] text-[12px] whitespace-nowrap"
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
    </Panel>
  );
}

/* ── 4 · On the scale ───────────────────────────────────────────────
   The six placed along the 30-to-100 axis the score itself runs on, so the
   relationship the section exists to explain is the layout rather than
   something stated in a column. A vendor sees where this prospect's evidence
   sits without reading a single range. The cost is precision: a marker's
   position is its band, not a value. */
function OnTheScale({ views }: { views: View[] }) {
  const at = (n: number) => `${((n - 30) / 70) * 100}%`;
  return (
    <Panel>
      <div className="relative w-full" style={{ height: 8 }}>
        <span className="absolute bg-[rgba(47,43,61,0.08)] rounded-[100px]" style={{ left: 0, right: 0, top: 3, height: 2 }} />
        {views.map(v => {
          const mid = (v.signal.min + v.signal.max) / 2;
          return (
            <span
              key={v.signal.label}
              className="absolute block rounded-[100px]"
              title={`${v.signal.label} · ${v.signal.range}`}
              style={{
                left: at(mid),
                top: 0,
                width: 8,
                height: 8,
                marginLeft: -4,
                background: v.live ? LIVE : "#ffffff",
                border: v.live ? "none" : "1px solid rgba(47,43,61,0.22)",
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between w-full" style={{ marginTop: 2 }}>
        {INTENT_BANDS.slice().reverse().map(b => (
          <span key={b.range} className="font-['Inter',sans-serif] leading-[16px] text-[10px]" style={{ color: FAINT }}>
            {b.range}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-[3px] w-full" style={{ marginTop: 8 }}>
        {views.map(v => (
          <span key={v.signal.label} className="content-stretch flex gap-[6px] items-center">
            <span
              className="block rounded-[100px] shrink-0"
              style={{
                width: 6,
                height: 6,
                background: v.live ? LIVE : "#ffffff",
                border: v.live ? "none" : "1px solid rgba(47,43,61,0.22)",
              }}
            />
            <span
              className="font-['Inter',sans-serif] leading-[17px] text-[11px] whitespace-nowrap"
              style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
            >
              {v.signal.label}
            </span>
            <span className="ml-auto">
              <Range signal={v.signal} live={v.live} />
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 5 · Evidence count ─────────────────────────────────────────────
   Leads with the summary and lets the six be the supporting detail: how many
   of the signals fired, and of those, how strong the strongest was. A vendor
   triaging a list wants that sentence, not six rows; the rows are there for
   the one prospect in ten they stop on. */
function EvidenceCount({ views }: { views: View[] }) {
  const live = views.filter(v => v.live);
  const strongest = live.reduce<IntentSignal | null>(
    (best, v) => (!best || v.signal.min > best.min ? v.signal : best),
    null,
  );
  return (
    <Panel>
      <div className="content-stretch flex items-baseline gap-[6px] w-full">
        <span className="font-['Inter',sans-serif] font-medium leading-[26px] text-[20px]" style={{ color: INK }}>
          {live.length}
          <span style={{ color: FAINT }}>{` / ${views.length}`}</span>
        </span>
        <span className="font-['Inter',sans-serif] leading-[18px] text-[12px]" style={{ color: MUTED }}>
          signals triggered
          {strongest ? `, strongest ${strongest.range}` : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-[4px] w-full" style={{ marginTop: 8 }}>
        {views.map(v => (
          <span
            key={v.signal.label}
            title={`${v.signal.label} · ${v.signal.range}`}
            className="content-stretch flex gap-[5px] items-center px-[7px] py-[3px] rounded-[100px] shrink-0"
            style={{
              background: v.live ? "rgba(7,41,41,0.08)" : "transparent",
              border: v.live ? "none" : "1px solid rgba(47,43,61,0.10)",
            }}
          >
            <span
              className="font-['Inter',sans-serif] leading-[16px] text-[11px] whitespace-nowrap"
              style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
            >
              {v.signal.label}
            </span>
            <Range signal={v.signal} live={v.live} />
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── 6 · Pick a signal ──────────────────────────────────────────────
   The most compact at rest: six names, and one line that answers for whichever
   is selected. It suits a panel where the section is a reference rather than
   the reason the modal was opened — and it is the only one here that asks for
   a click before it says anything, which is the thing to judge it on. */
function PickASignal({ views }: { views: View[] }) {
  const [picked, setPicked] = useState(views.find(v => v.live)?.signal.label ?? views[0]?.signal.label ?? "");
  const current = views.find(v => v.signal.label === picked) ?? views[0];
  return (
    <Panel>
      <div className="flex flex-wrap gap-[4px] w-full">
        {views.map(v => {
          const on = v.signal.label === picked;
          return (
            <button
              key={v.signal.label}
              type="button"
              aria-pressed={on}
              onClick={e => {
                e.stopPropagation();
                setPicked(v.signal.label);
              }}
              className="cursor-pointer px-[8px] py-[3px] rounded-[6px] shrink-0 transition-colors"
              style={{
                background: on ? "rgba(7,41,41,0.12)" : "transparent",
                border: `1px solid ${on ? "transparent" : "rgba(47,43,61,0.10)"}`,
              }}
            >
              <span
                className="font-['Inter',sans-serif] leading-[16px] text-[11px] whitespace-nowrap"
                style={{ color: v.live ? INK : FAINT, fontWeight: v.live ? 500 : 400 }}
              >
                {v.signal.label}
              </span>
            </button>
          );
        })}
      </div>
      {current && (
        <div className="content-stretch flex gap-[6px] items-center w-full" style={{ marginTop: 8 }}>
          {current.live ? <Tick size={10} /> : <Hollow size={10} />}
          <span className="font-['Inter',sans-serif] leading-[18px] text-[12px]" style={{ color: MUTED }}>
            {current.live ? "Triggered by this prospect" : "Not seen from this prospect"}
            {" · "}
            <span style={{ color: INK, fontWeight: 500 }}>{current.signal.range}</span>
            {" intent"}
          </span>
        </div>
      )}
    </Panel>
  );
}

/* ── the section ───────────────────────────────────────────────────── */

const CONCEPTS: ReadonlyArray<{ label: string; render: (views: View[]) => ReactNode }> = [
  { label: "1 · Signal rows", render: v => <SignalRows views={v} /> },
  { label: "2 · Grouped", render: v => <Grouped views={v} /> },
  { label: "3 · Score ladder", render: v => <Ladder views={v} /> },
  { label: "4 · On the scale", render: v => <OnTheScale views={v} /> },
  { label: "5 · Evidence count", render: v => <EvidenceCount views={v} /> },
  { label: "6 · Pick a signal", render: v => <PickASignal views={v} /> },
];

export default function IntentSignals({ company }: { company: string }) {
  const [concept, setConcept] = useState(0);
  const triggered = getTriggeredSignals(company);
  const views: View[] = INTENT_SIGNALS.map(signal => ({ signal, live: triggered.has(signal.label) }));

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Intent Signals">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
        <p className="font-['Inter',sans-serif] font-medium leading-[20px] shrink-0 text-[13px]" style={{ color: INK }}>
          Intent Signals
        </p>
        <p className="font-['Inter',sans-serif] font-normal leading-[20px] shrink-0 text-[12px]" style={{ color: MUTED }}>
          what this score is built from
        </p>
      </div>

      {/* The concepts switch — a review control, local hosts only. */}
      {IS_LOCAL && (
        <div className="flex flex-wrap gap-[4px] w-full">
          {CONCEPTS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={e => {
                e.stopPropagation();
                setConcept(i);
              }}
              className="cursor-pointer px-[7px] py-[2px] rounded-[5px] shrink-0 transition-colors"
              style={{
                background: i === concept ? "#072929" : "transparent",
                border: `1px solid ${i === concept ? "#072929" : "rgba(47,43,61,0.14)"}`,
              }}
            >
              <span
                className="font-['Inter',sans-serif] leading-[15px] text-[10px] whitespace-nowrap"
                style={{ color: i === concept ? "#ffffff" : MUTED }}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {CONCEPTS[concept].render(views)}
    </div>
  );
}
