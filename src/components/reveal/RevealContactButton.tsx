import { forwardRef, type MouseEvent } from "react";
import revealEye from "@/components/company/assets/contact-reveal-eye.svg";

/**
 * The Reveal Contact control — one implementation for every prospect and
 * contact card in the module.
 *
 * The design is a 110x24 outlined pill: a 0.6px ink stroke, no fill, 8px of
 * horizontal padding and a 4px gap between the 11px eye and the 11px label.
 * Figma draws that stroke inside the frame, so the box is sized explicitly and
 * `border-box` reproduces the same geometry rather than growing the pill by the
 * stroke's width.
 *
 * `.lead-reveal-btn` carries only the hover wash and the loading cursor; the
 * button has no animation of its own.
 */
/**
 * "label" is the filled treatment the Prospects card carries in Figma
 * 133:1219 — a 12%-ink fill on a 6px radius, 14px of horizontal padding and a
 * 6px gap between a 14px eye and a 12px label in #072929. "pill" is the
 * outlined 110x24 default every other surface uses. Both keep the same eye
 * slot, so the loader still swaps the icon for its spinner in place.
 */
/**
 * "label-sm" is the prospect card's own, from Figma 219:1041: the same 12%-ink
 * fill and 6px radius as "label" on a tighter box — 8px of horizontal padding
 * against 14, 4px of vertical against 6, a 4px gap, a 12px eye and an 11px
 * label — which is what fits it inside the card's shorter contact panel. Its
 * hover is the label treatment's, unchanged.
 */
export type RevealButtonVariant = "pill" | "label" | "label-sm";

const RevealContactButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    variant?: RevealButtonVariant;
  }
>(function RevealContactButton({ onClick, className = "", variant = "pill" }, ref) {
  if (variant === "label-sm") {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        /* The attribute drives the hover wash alone, and this variant takes the
           label treatment's, so it reports itself as one. */
        data-variant="label"
        className={`lead-reveal-btn bg-[rgba(7,41,41,0.12)] content-stretch cursor-pointer flex gap-[4px] items-center overflow-clip px-[8px] py-[4px] rounded-[6px] ${className}`}
      >
        {/* The eye keeps a relative box of its own: the loader hides the mark
            and drops its spinner in here, so the label never shifts. */}
        <div className="relative shrink-0 size-[12px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={revealEye} />
        </div>
        <p className="[word-break:break-word] capitalize font-['Inter',sans-serif] font-normal leading-[18px] not-italic relative shrink-0 text-[#072929] text-[11px] whitespace-nowrap">
          Reveal Contact
        </p>
      </button>
    );
  }

  if (variant === "label") {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        data-variant="label"
        className={`lead-reveal-btn bg-[rgba(7,41,41,0.12)] content-stretch cursor-pointer flex gap-[6px] items-center justify-center overflow-clip px-[14px] py-[6px] rounded-[6px] ${className}`}
      >
        <div className="h-[16px] relative shrink-0 w-[10px]">
          <div className="absolute left-[-2px] size-[14px] top-px">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={revealEye} />
          </div>
        </div>
        <p className="[word-break:break-word] capitalize font-['Inter',sans-serif] font-normal leading-[18px] not-italic relative shrink-0 text-[#072929] text-[12px] whitespace-nowrap">
          Reveal Contact
        </p>
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`lead-reveal-btn border-[#072929] border-[0.6px] border-solid content-stretch cursor-pointer flex gap-[4px] h-[24px] items-center px-[8px] py-[2px] rounded-[100px] w-[110px] ${className}`}
    >
      {/* The eye keeps its own 11px frame: the loader drops the spinner into
          this slot, so the label never shifts while a reveal is processing. */}
      <div className="relative shrink-0 size-[11px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={revealEye} />
      </div>
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[11px] whitespace-nowrap">
        <p className="leading-[20px]">Reveal Contact</p>
      </div>
    </button>
  );
});

export default RevealContactButton;
