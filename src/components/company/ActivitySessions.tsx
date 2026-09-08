import { useCallback, useRef, useState } from "react";
import {
  getActivitySessions,
  summarise,
  type ActivityPageVisit,
  type ActivitySession,
} from "@/data/activitySessions";
import { startOfDay, withoutYear } from "@/data/demoDates";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * The Activity tab — Figma 282:3620.
 *
 * Three cards summarising the whole record, then one card per session. A
 * session is one visitor, in one place, at one sitting, read the way an
 * activity feed is read — newest first — so it opens on how it ended and runs
 * back to how it began: the end marker, the pages in reverse, then the start
 * marker on the page the visit entered through.
 *
 * The session cards are the module's own framed card: a 2px tinted frame around
 * a white inner at 12px padding, the same shell the contact cards use.
 */

const SUCCESS = "#24b364";
const DANGER = "#ff4c51";
const NEUTRAL = "#dddde0";

/* ── the framed card the panel is built out of ── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[rgba(244,242,240,0.6)] content-stretch flex items-center p-[2px] relative rounded-[12px] shrink-0 w-full">
      <div className="bg-white content-stretch flex flex-[1_0_0] items-start min-w-px p-[12px] relative rounded-[10px]">
        {children}
      </div>
    </div>
  );
}

/* ── 282:3623 — the three summary cards ── */
function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[rgba(244,242,240,0.6)] content-stretch flex flex-[1_0_0] items-center min-w-px p-[2px] relative rounded-[12px]">
      <div className="bg-white content-stretch flex flex-[1_0_0] items-start min-w-px p-[12px] relative rounded-[10px]">
        <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[20px] min-w-px not-italic relative">
          <p className="font-['Inter',sans-serif] font-medium relative shrink-0 text-[13px] text-[#2f2b3d]">
            {label}
          </p>
          <p className="font-['Inter',sans-serif] font-normal relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── markers ───────────────────────────────────────────────────────────
   All three are the node's own 8px square on a 2px radius, sitting 7px down an
   8x15 box, so every row meets its marker at the same point. */
function Marker({ colour }: { colour: string }) {
  return (
    <div className="h-[15px] relative shrink-0 w-[8px]" aria-hidden>
      <span
        className="absolute left-0 rounded-[2px] size-[8px] top-[7px]"
        style={{ backgroundColor: colour }}
      />
    </div>
  );
}

/**
 * A 24-hour time as the design writes it — "16:04" reads "4:04 PM".
 *
 * The records keep the 24-hour strings they have always carried; this is the
 * panel's own reading of them and nothing measures against it.
 */
function clockLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * The day a session sits on — named where naming it says more than dating it.
 *
 * 298:2543 heads a session "Today", which is what the nearest days are worth
 * saying: a reader working through this panel knows what today is and has to
 * work out what a date means. Anything further back is dated, without its year,
 * as the rest of the tab is.
 */
function dayLabel(dateText: string): string {
  const t = Date.parse(dateText);
  if (Number.isNaN(t)) return withoutYear(dateText);
  const day = startOfDay(new Date(t)).getTime();
  const today = startOfDay(new Date()).getTime();
  if (day === today) return "Today";
  if (day === today - 86400000) return "Yesterday";
  return withoutYear(dateText);
}

/** A timeline row: its marker, then whatever it has to say. */
function Row({
  colour,
  /* 6px between a row's two parts, except where the node closes it to 2 —
     the start row, whose address belongs to the words above it rather than
     standing apart from them. */
  gap = 6,
  children,
}: {
  colour: string;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full">
      <Marker colour={colour} />
      <div
        className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative"
        style={{ gap }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── the address under a page title ──
   The address is the one thing on the timeline anyone would want to follow:
   it names a page that exists, so it opens it. A new tab, because the modal
   holds unsaved reading state behind it, and noopener/noreferrer because the
   destination has no business with this window or with where the click came
   from. It stays the row's own quiet grey until hovered, where the underline
   says it is a link — no second colour, the design system does not define
   one for this. */

/**
 * Whether an element's text is actually being cut off.
 *
 * Only a clipped address needs a tooltip; one that fits already reads in full,
 * and a tooltip repeating it would be noise on every row. Measured off the
 * element rather than guessed from a character count, since where the ellipsis
 * falls depends on the glyphs, and re-measured when the element resizes so the
 * answer stays true if the panel ever reflows.
 */
function useTruncation() {
  const [truncated, setTruncated] = useState(false);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const measure = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    measure();
    observer.current = new ResizeObserver(measure);
    observer.current.observe(el);
  }, []);

  return [truncated, ref] as const;
}

/* The row's own type, unchanged — only the element under it is a link now. */
const URL_TEXT =
  "font-['Inter',sans-serif] font-normal leading-[20px] not-italic text-[12px] text-[rgba(47,43,61,0.7)]";

/* One line, clipped to the column rather than widening it: max-w-full holds it
   inside the card, and inline-block keeps a short address the width of its own
   text so the pointer only turns over the link itself. */
const URL_LINK = `${URL_TEXT} inline-block max-w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap align-top hover:underline`;

function PageUrl({ url }: { url: string }) {
  const [truncated, measure] = useTruncation();

  /* The trigger renders the anchor itself rather than wrapping it, so the link
     keeps its own box and its own click — the same composition the contact
     marks use to stay clickable under a tooltip. */
  const link = (
    <a
      ref={measure}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={URL_LINK}
    />
  );

  return (
    /* The line the address sits on is the address's own 20, not the column's
       inherited 24: the anchor is inline-block, so a taller strut around it
       adds leading the node does not have and pushes everything under it down
       by 4. */
    <p className="leading-[20px] relative shrink-0 w-full">
      {truncated ? (
        <Tooltip>
          <TooltipTrigger render={link}>{url}</TooltipTrigger>
          <TooltipContent>{url}</TooltipContent>
        </Tooltip>
      ) : (
        <a ref={measure} href={url} target="_blank" rel="noopener noreferrer" className={URL_LINK}>
          {url}
        </a>
      )}
    </p>
  );
}

/* ── 282:3661 — a page visit ── */
function PageRow({ page }: { page: ActivityPageVisit }) {
  return (
    <Row colour={NEUTRAL} gap={3}>
      {/* Title and address are one pair, two apart, then the time spent three
          under the address — 298:2581's own figures, read off the node: its
          pair ends at 43 and the time spent starts at 46. */}
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0 w-full">
        <p className="font-['Inter',sans-serif] font-medium leading-[21px] relative shrink-0 text-[13px] text-[#2f2b3d] w-full">
          {page.title}
        </p>
        <PageUrl url={page.url} />
      </div>
      <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        {page.duration}
      </p>
    </Row>
  );
}

/* ── 282:3642 — a session ── */
function Session({ session }: { session: ActivitySession }) {
  /* Newest first: how it ended, back through the pages, then how it began. The
     data stays in the order it happened; only the reading is reversed. */
  const pages = [...session.pages].reverse();
  /* The address the visit came in on is the first page it actually opened. */
  const entry = session.pages[0];

  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-name="Session">
      {/* 298:2566 — where the visit came from, and when it was.

          The session is no longer headed by whoever made it. An anonymous id
          and a stock portrait were two things standing in for a person nobody
          can name; what the reader can actually use is that this was a visit,
          where from, and when — so the header says that and stops. */}
      <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[20px] not-italic relative shrink-0 w-full whitespace-nowrap">
        <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0">
          <p className="font-['Inter',sans-serif] font-medium relative shrink-0 text-[13px] text-[#2f2b3d]">Visited</p>
          <p className="font-['Inter',sans-serif] font-normal relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)]">
            {session.location.city}, {session.location.region}, {session.location.country}
          </p>
        </div>
        <p className="font-['Inter',sans-serif] font-normal relative shrink-0 text-[11px] text-[rgba(47,43,61,0.7)]">
          {dayLabel(session.date)} · {clockLabel(session.endedAt)}
        </p>
      </div>

      {/* 282:3654 — the timeline. */}
      <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-name="Timeline">
        <Row colour={DANGER}>
          <p
            className="font-['Inter',sans-serif] font-medium leading-[21px] not-italic relative shrink-0 text-[13px]"
            style={{ color: DANGER }}
          >
            Session ended
          </p>
          <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)]">
            Time spent: {session.total}
          </p>
        </Row>

        {pages.map((page, i) => (
          <PageRow key={page.url + i} page={page} />
        ))}

        <Row colour={SUCCESS} gap={2}>
          <p
            className="font-['Inter',sans-serif] font-medium leading-[21px] not-italic relative shrink-0 text-[13px]"
            style={{ color: SUCCESS }}
          >
            Session started
          </p>
          {/* The address the visit came in on is an address like any other on
              the timeline, so it opens like one. */}
          {entry && <PageUrl url={entry.url} />}
        </Row>
      </div>
    </div>
  );
}

/* ── the panel ── */
export default function ActivitySessionsPanel({ company }: { company: string }) {
  const sessions = getActivitySessions(company);
  const summary = summarise(sessions);
  if (!sessions.length || !summary) return null;

  return (
    /* 282:3622 — the summary row and the session cards, 12px apart. */
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
        <SummaryCard label="First Seen" value={`${withoutYear(summary.firstSeen.date)}, ${clockLabel(summary.firstSeen.time)}`} />
        <SummaryCard label="Last Seen" value={`${withoutYear(summary.lastSeen.date)}, ${clockLabel(summary.lastSeen.time)}`} />
        <SummaryCard label="Total Time" value={summary.total} />
      </div>

      {sessions.map((session, i) => (
        <Card key={`${session.visitor}-${i}`}>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Sessions">
            <Session session={session} />
          </div>
        </Card>
      ))}
    </div>
  );
}
