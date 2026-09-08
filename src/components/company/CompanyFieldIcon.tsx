import iconCompany from "./assets/ci/company.svg";
import iconWebsite from "./assets/ci/website.svg";
import iconIndustry from "./assets/ci/industry.svg";
import iconLocation from "./assets/ci/location.svg";
import iconEmployees from "./assets/ci/employees.svg";
import iconRevenue from "./assets/ci/revenue.svg";
import iconLinkedin from "./assets/ci/linkedin.svg";
import iconX from "./assets/ci/x.svg";
import iconInstagram from "./assets/ci/instagram.svg";
import iconFacebook from "./assets/ci/facebook.svg";

/**
 * The mark beside a Company Information label — Figma 250:1965.
 *
 * Every row carries a 16x16 frame before its label, and every mark is drawn
 * the same way here: at its own natural size, centred in that frame, with
 * nothing clipping it.
 *
 * The export reproduced Figma's own scaffolding for these — a clip frame, a
 * full-coverage mask and a percentage bleed box per icon — and three of the
 * marks came through it looking cut. The masks turned out to be plain black
 * rectangles covering their whole area, so they masked nothing and only the
 * frame's `overflow-clip` was doing any work: these glyphs carry
 * `overflow="visible"` and paint strokes that run outside their own viewBox,
 * which is exactly what that clip removed. Both are gone.
 *
 * What is left is the part that matters. Each mark states its own width and
 * height — the dimensions its file declares — so it is never stretched to a
 * box that is not its shape, and the frame centres it on both axes, which is
 * what lines it up with the label beside it. Every one of them fits inside 16
 * at its natural size, so nothing is scaled and the stroke stays the weight
 * the file draws it at.
 */

type Mark = { src: string; w: number; h: number };

const MARKS: Record<string, Mark> = {
  /* Drawn edge to edge in the frame. */
  "Company Name": { src: iconCompany, w: 16, h: 16 },
  Website: { src: iconWebsite, w: 16, h: 16 },

  /* Smaller than their frame, and centred in it. */
  Industry: { src: iconIndustry, w: 12.2, h: 13.421 },
  Location: { src: iconLocation, w: 11.5515, h: 13.2 },
  Employees: { src: iconEmployees, w: 12.7821, h: 13.2 },
  Revenue: { src: iconRevenue, w: 14.4623, h: 12.1 },

  /* The brand marks, each filling its own frame. */
  LinkedIn: { src: iconLinkedin, w: 16, h: 16 },
  X: { src: iconX, w: 16, h: 16 },
  Instagram: { src: iconInstagram, w: 16, h: 16 },
  Facebook: { src: iconFacebook, w: 16, h: 16 },
};

export default function CompanyFieldIcon({ label }: { label: string }) {
  const mark = MARKS[label];
  if (!mark) return null;

  return (
    <div
      className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]"
      data-name="Frame"
    >
      <img
        alt=""
        className="block max-w-none shrink-0"
        src={mark.src}
        /* Both stated, from the file's own header: an `size-full` here would
           stretch a 12.2 x 13.4 glyph to a 16 x 16 box and skew it. */
        style={{ width: mark.w, height: mark.h }}
      />
    </div>
  );
}
