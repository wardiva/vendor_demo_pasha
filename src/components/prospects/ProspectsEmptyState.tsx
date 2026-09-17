import "./ProspectsEmptyState.css";

/**
 * The Prospects page's empty state — cards filing into a folder.
 *
 * Ported from Claude Design, project "Avatars falling into prospect cards",
 * file `Prospects Empty State Folder.dc.html`, as drawn: every dimension,
 * offset, radius, colour and shadow below is that file's literal value, and
 * the stylesheet beside this file is its keyframes percentage for
 * percentage. Nothing is re-coloured to the design system or re-scaled —
 * the illustration is the design, and the design is the source of truth.
 *
 * Three prospect cards fall in one after another; the folder's flap tips
 * open to take each one, the folder squashes under the weight and settles,
 * and a sheet stacks inside. After the third the stack clears and the loop
 * comes round. The folder is two layers on the same box — the back (tab,
 * body, sheets) beneath the drop zone and the front (the flap) above it, so
 * a falling card passes behind the flap and into the pocket.
 *
 * The source draws its 344 x 176 stage at scale(.8) inside a 275 x 141
 * window; that is reproduced as-is. `support.js`, which the source imports,
 * is the Claude Design canvas runtime — a React template renderer for
 * previewing .dc.html on the canvas — so there is nothing in it to port; its
 * only bearing here is the `loopSeconds` prop it feeds into `--dur`, which
 * is LOOP_SECONDS below.
 *
 * Decorative: the stage is aria-hidden and the heading and subline are the
 * accessible content.
 */

/* The source's `loopSeconds` prop — its default, and its whole logic. */
const LOOP_SECONDS = 12;

/* The source's card border and sheet border, one hairline for both. */
const HAIRLINE = "1px solid #e9edf2";

/**
 * One falling prospect card: an avatar block over a name and a role bar.
 * The three differ only in how long those two bars are, which is what stops
 * the loop reading as the same card three times.
 *
 * @param offset  How far into the loop this card starts, as a fraction. The
 *                three share one timeline at 0, 3/4 and 1/2 of it — written
 *                as a negative delay, so all three are already in flight on
 *                the first frame rather than waiting their turn once.
 */
function FallingCard({ nameW, roleW, offset }: { nameW: number; roleW: number; offset: number }) {
  return (
    <div
      className="absolute"
      data-pes="drop"
      style={{
        left: 104, top: 10, width: 136, height: 40, borderRadius: 10,
        background: "#fff", border: HAIRLINE,
        boxShadow: "0 6px 16px rgba(16,24,40,.06)",
        animationDelay: offset ? `calc(var(--pes-dur) * -${offset})` : undefined,
      }}
    >
      <div className="absolute" style={{ left: 8, top: 7, width: 26, height: 26, borderRadius: 7, background: "#eef1f5" }} />
      <div className="absolute" style={{ left: 42, top: 11, width: nameW, height: 8, borderRadius: 4, background: "#e2e8f0" }} />
      <div className="absolute" style={{ left: 42, top: 24, width: roleW, height: 6, borderRadius: 3, background: "#eef1f5" }} />
    </div>
  );
}

/** The source's stage: a 344 x 176 loop drawn at .8 in a 275 x 141 window. */
function Stage() {
  return (
    <div className="flex items-center justify-center p-0">
      <div
        aria-hidden
        className="pes-stage relative overflow-hidden"
        style={{ width: 275, height: 141, ["--pes-dur" as string]: `${LOOP_SECONDS}s` }}
      >
        <div
          className="absolute left-0 top-0"
          style={{ width: 344, height: 176, transform: "scale(.8)", transformOrigin: "top left" }}
        >
          {/* The drop zone, layered between the folder's back and its flap.
              Masked out at its foot so a card is already fading as it passes
              behind the flap's lip rather than cutting off. */}
          <div
            className="pointer-events-none absolute overflow-hidden"
            style={{
              left: 0, top: 0, width: 344, height: 130, zIndex: 2,
              WebkitMaskImage: "linear-gradient(#000 78%, transparent 100%)",
              maskImage: "linear-gradient(#000 78%, transparent 100%)",
            }}
          >
            <FallingCard nameW={64} offset={0} roleW={44} />
            <FallingCard nameW={52} offset={0.75} roleW={56} />
            <FallingCard nameW={74} offset={0.5} roleW={38} />
          </div>

          {/* The folder's back: tab, body, and the sheets that collect inside. */}
          <div
            className="absolute"
            data-pes="folder"
            style={{ left: 92, top: 74, width: 160, height: 90, zIndex: 1, transformOrigin: "center bottom" }}
          >
            <div className="absolute" style={{ left: 0, top: 0, width: 60, height: 14, borderRadius: "6px 6px 0 0", background: "#dfe5ec" }} />
            <div className="absolute" style={{ left: 0, top: 10, width: 160, height: 80, borderRadius: "6px 10px 10px 10px", background: "#e5eaf0" }} />

            {/* Filed sheets — smallest at the back, each arriving with its card. */}
            <div
              className="absolute"
              data-pes="stack-1"
              style={{ left: 20, top: 2, width: 120, height: 26, borderRadius: 6, background: "#fff", border: HAIRLINE, opacity: 0.9 }}
            />
            <div
              className="absolute"
              data-pes="stack-2"
              style={{ left: 16, top: 8, width: 128, height: 26, borderRadius: 6, background: "#fff", border: HAIRLINE }}
            />
            <div
              className="absolute"
              data-pes="stack-3"
              style={{ left: 12, top: 14, width: 136, height: 26, borderRadius: 6, background: "#fff", border: HAIRLINE }}
            />
          </div>

          {/* The folder's front: the same box, the same squash and settle, so
              the flap moves with the body it is attached to. The flap tips on
              its own perspective so the rotation reads as depth rather than a
              squashed rectangle. */}
          <div
            className="pointer-events-none absolute"
            data-pes="folder"
            style={{ left: 92, top: 74, width: 160, height: 90, zIndex: 3, transformOrigin: "center bottom" }}
          >
            <div className="absolute" style={{ left: 0, top: 22, width: 160, height: 68, perspective: 600 }}>
              <div
                className="absolute inset-0"
                data-pes="flap"
                style={{
                  borderRadius: "8px 10px 10px 10px",
                  background: "linear-gradient(#f4f6f9, #eceff3)",
                  transformOrigin: "center bottom",
                }}
              >
                {/* The clasp. */}
                <div className="absolute" style={{ left: 72, top: 30, width: 16, height: 16, borderRadius: "50%", background: "#dfe5ec" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProspectsEmptyState() {
  return (
    /* The page's panel: white, a hairline, 16 radius, a whisper of shadow,
       the stage and the copy stacked 20px apart.

       A floor under it, and the pair centred in whatever height that gives.
       Sized to its content the panel came to 316px — a short band directly
       under the heading, with the page's ground running away beneath it,
       which read as something still loading rather than as the answer. The
       list it stands in for is far taller than that, so the panel holds a
       comparable block and the illustration sits in the middle of it. A
       floor, not a fixed height: the copy can wrap to a third line at a
       narrow width and the panel simply grows. */
    <div
      className="flex w-full flex-col items-center justify-center bg-surface"
      data-name="Prospects Empty State"
      style={{
        gap: 20, padding: "40px 24px 48px", minHeight: 520, borderRadius: 16,
        border: "1px solid var(--color-border-hairline)",
        boxShadow: "0 1px 2px color-mix(in srgb, var(--color-text) 5%, transparent)",
      }}
    >
      <Stage />
      <div className="flex flex-col items-center text-center" style={{ gap: 7, maxWidth: 520 }}>
        <h2 className="m-0 font-['Inter',sans-serif] font-semibold" style={{ fontSize: 24, lineHeight: 1.3, color: "var(--color-text)" }}>
          No Prospects Found
        </h2>
        <p className="m-0 font-['Inter',sans-serif] font-normal" style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-text-secondary)", textWrap: "pretty" }}>
          Prospects appear here once buyers engage with your profile or similar products.
        </p>
      </div>
    </div>
  );
}
