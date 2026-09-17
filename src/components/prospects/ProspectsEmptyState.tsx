import "./ProspectsEmptyState.css";

/**
 * The Prospects page's empty state — cards filing into a folder.
 *
 * Ported from Claude Design, project "Avatars falling into prospect cards",
 * file `Reveal Contact Card.dc.html`. Three prospect cards fall in one after
 * another; the folder's flap tips open to take each one, the folder squashes
 * under the weight and settles, and a sheet stacks inside. After the third
 * the stack clears and the loop comes round — which is the page's own story:
 * this is where prospects land as buyers engage.
 *
 * The geometry is the source's, element for element and pixel for pixel on
 * its 344 x 176 stage, and the stylesheet beside this file is its keyframes
 * percentage for percentage. `support.js`, which the source imports, is the
 * Claude Design canvas runtime — a React template renderer for previewing
 * .dc.html on the canvas — so there is nothing in it to port; its only
 * bearing here is the `loopSeconds` prop it feeds the stage, which is the
 * LOOP_SECONDS below.
 *
 * Colour is the design system's, not the source's slate — see
 * src/styles/tokens.css. Every value is a token or a tint of one:
 *
 *   card / sheet surface    #fff                →  --color-surface
 *   card / sheet hairline   #e9edf2             →  --color-border-subtle
 *   avatar block            #eef1f5             →  ink 8%
 *   name bar                #e2e8f0             →  ink 12%
 *   role bar                #eef1f5             →  ink 6%
 *   folder tab / flap dot   #dfe5ec             →  ink 12%
 *   folder body             #e5eaf0             →  ink 9%
 *   flap                    #f4f6f9 → #eceff3   →  ink 5% → ink 8%
 *   shadows                 rgba(16,24,40, a)   →  --color-text at the same a
 *
 * Decorative: the stage is aria-hidden and the heading and subline are the
 * accessible content. Under prefers-reduced-motion the loop holds on the
 * frame where all three are filed; see the stylesheet.
 */

/* The source's `loopSeconds` prop — its default, and its whole logic. */
const LOOP_SECONDS = 12;

/* The source's stage. Nothing inside reflows, so these are fixed. */
const STAGE_W = 344;
const STAGE_H = 176;

/**
 * How much of the source's size the illustration is drawn at.
 *
 * Applied as one transform over the whole stage rather than by resizing the
 * box: everything inside is absolutely positioned against the 344 x 176
 * above, so a smaller box would crop it and leave the contents at full size.
 * Scaling the picture takes every distance, radius, hairline and the flap's
 * perspective down together, which is the only way the motion stays the
 * motion that was designed.
 */
const SCALE = 0.7;

/**
 * How much of its drawn size the folder is shown at, the cards untouched.
 *
 * The source draws the folder 200 wide against a 172-wide card, which left
 * it looking heavy beside what it is catching. This trims the folder alone.
 *
 * It rides a wrapper rather than the folder itself: the folder's own
 * transform is animated — the squash on each impact and the settle at the
 * end — so a scale written on it would be overwritten the moment the
 * animation started. The wrapper shrinks from `center bottom`, so the folder
 * keeps its footing on the same line and narrows toward its own centre
 * instead of drifting.
 */
const FOLDER_SCALE = 0.9;

/** Tints of a token, so each stays attached to the token it is a shade of. */
const ink = (pct: number) => `color-mix(in srgb, var(--color-ink) ${pct}%, transparent)`;

/**
 * One falling prospect card: an avatar block over a name and a role bar.
 * The three differ only in how long those two bars are, which is what stops
 * the loop reading as the same card three times.
 *
 * @param offset  How far into the loop this card starts, as a fraction. The
 *                three share one timeline at 0, 1/4 and 1/2 of it — written
 *                as a negative delay, so all three are already in flight on
 *                the first frame rather than waiting their turn once.
 */
function FallingCard({ nameW, roleW, offset }: { nameW: number; roleW: number; offset: number }) {
  return (
    <div
      className="absolute"
      data-pes="drop"
      style={{
        left: 86, top: 14, width: 172, height: 44, borderRadius: 10,
        background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)",
        boxShadow: "0 6px 16px var(--pes-shadow-06)",
        animationDelay: `calc(var(--pes-dur) * -${offset})`,
      }}
    >
      <div className="absolute" style={{ left: 9, top: 8, width: 28, height: 28, borderRadius: 7, background: ink(8) }} />
      <div className="absolute" style={{ left: 46, top: 12, width: nameW, height: 8, borderRadius: 4, background: ink(12) }} />
      <div className="absolute" style={{ left: 46, top: 26, width: roleW, height: 6, borderRadius: 3, background: ink(6) }} />
    </div>
  );
}

/** The 344 x 176 loop. */
function Stage() {
  return (
    <div
      aria-hidden
      className="pes-stage relative overflow-hidden"
      style={{
        width: STAGE_W * SCALE, height: STAGE_H * SCALE,
        ["--pes-dur" as string]: `${LOOP_SECONDS}s`,
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${SCALE})`, transformOrigin: "0 0" }}
      >
        {/* The drop zone. Masked out at its foot so a card is already fading
            as it passes behind the folder's lip rather than cutting off. */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 0, top: 0, width: STAGE_W, height: 112,
            WebkitMaskImage: "linear-gradient(#000 86%, transparent)",
            maskImage: "linear-gradient(#000 86%, transparent)",
          }}
        >
          <FallingCard nameW={84} offset={0} roleW={58} />
          <FallingCard nameW={66} offset={0.75} roleW={72} />
          <FallingCard nameW={96} offset={0.5} roleW={50} />
        </div>

        {/* The folder: a tab, a body, the sheets that collect inside it, and
            the front flap that opens to take each card. The outer box carries
            FOLDER_SCALE and the inner one the animation, so the two transforms
            do not contend for the same property. */}
        <div
          className="absolute"
          style={{
            left: 72, top: 82, width: 200, height: 82,
            transform: `scale(${FOLDER_SCALE})`, transformOrigin: "center bottom",
          }}
        >
        <div
          className="absolute inset-0"
          data-pes="folder"
          style={{ transformOrigin: "center bottom" }}
        >
          <div className="absolute" style={{ left: 0, top: 0, width: 76, height: 14, borderRadius: "6px 6px 0 0", background: ink(12) }} />
          <div className="absolute" style={{ left: 0, top: 10, width: 200, height: 72, borderRadius: "6px 10px 10px 10px", background: ink(9) }} />

          {/* Filed sheets — smallest at the back, each arriving with its card. */}
          <div
            className="absolute"
            data-pes="stack-1"
            style={{ left: 24, top: 2, width: 152, height: 26, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)", opacity: 0.9 }}
          />
          <div
            className="absolute"
            data-pes="stack-2"
            style={{ left: 20, top: 8, width: 160, height: 26, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)" }}
          />
          <div
            className="absolute"
            data-pes="stack-3"
            style={{ left: 16, top: 14, width: 168, height: 26, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border-subtle)" }}
          />

          {/* The flap tips on its own perspective so the rotation reads as
              depth rather than a squashed rectangle. */}
          <div className="absolute" style={{ left: 0, top: 22, width: 200, height: 60, perspective: 600 }}>
            <div
              className="absolute inset-0"
              data-pes="flap"
              style={{
                borderRadius: "8px 10px 10px 10px",
                background: `linear-gradient(${ink(5)}, ${ink(8)})`,
                transformOrigin: "center bottom",
              }}
            >
              <div className="absolute" style={{ left: 92, top: 26, width: 16, height: 16, borderRadius: "50%", background: ink(12) }} />
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
