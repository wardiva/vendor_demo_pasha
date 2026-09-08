import verifiedBadge from "@/components/assets/verified-badge.png";
import RecommendedMark from "@/components/RecommendedMark";

export type ContactVariant = "verified" | "recommended";

/**
 * The tag that says what kind of contact a card holds.
 *
 * Shared by the Prospect Details modal's contact cards and the Prospects page
 * card's contact preview. It sits at z-3, above the locked veil, so it stays
 * sharp before the reveal — it is not the protected information the veil hides.
 */
export default function ContactTag({
  variant,
  size = 11,
  labelSize,
  medium = false,
  showLabel = true,
  className = "",
}: {
  variant: ContactVariant;
  /** 11px on the Prospects card, 12px in the modal's Contacts tab. */
  size?: number;
  /** The label runs a point smaller than the mark on the Prospects card. */
  labelSize?: number;
  /** The Prospects card sets it in medium; elsewhere it is regular. */
  medium?: boolean;
  /**
   * Figma 219:1037 pins the mark alone to the prospect card's contact panel —
   * the word is dropped and the badge carries the meaning. Every other surface
   * still names it, so the label is only withheld where it is asked for.
   */
  showLabel?: boolean;
  /** Positioning only — the Prospects card trims 2px off two margins. */
  className?: string;
}) {
  const verified = variant === "verified";
  return (
    /* A bare mark and label — no pill, no border. z-3 keeps it above the
       locked veil so it stays sharp before the contact is revealed. */
    /* No positioning of its own: the host places it, and the contact card
       pins it to the card's top-right the way Figma does. */
    <div
      data-name="Tag"
      /* Without the word beside it the mark is the whole of the tag, so it
         carries the name the label would otherwise have given it. */
      {...(showLabel ? {} : { role: "img", "aria-label": verified ? "Verified" : "Recommended" })}
      className={`content-stretch flex items-center shrink-0 z-[3] ${className}`}
    >
      <div className="content-stretch flex items-center justify-center py-px relative shrink-0">
        <div className="content-stretch flex items-center relative shrink-0">
          {verified ? (
            <div className="relative shrink-0" data-name="image 667" style={{ width: size, height: size }}>
              <img
                alt=""
                /* contain, not cover: the mark is drawn whole at whatever
                   size the host asks for, so it can never be cropped to fill
                   a box that is not its own proportion. */
                className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
                src={verifiedBadge}
              />
            </div>
          ) : (
            <RecommendedMark size={size} />
          )}
          {/* The word is collapsed rather than dropped.
              Unmounting it swapped the tag for its mark between one frame and
              the next; this fades it and closes its width instead, and because
              the tag is pinned by its right edge the mark travels the width the
              word gives up and arrives exactly where it always sat. The 4px gap
              is the label's own margin so it closes with it — a flex gap would
              be left holding the space open.

              Mounted already collapsed — a card whose contact was disclosed
              before this ever rendered — there is no previous value to animate
              from, so it simply starts there. */}
          <div
            aria-hidden={!showLabel}
            className={`lead-tag-label [word-break:break-word] flex flex-col font-['Inter',sans-serif] justify-center leading-[0] not-italic overflow-hidden relative shrink-0 text-[#2f2b3d] transition-[max-width,opacity,margin-left] duration-200 ease-out whitespace-nowrap ${
              medium ? "font-medium" : "font-normal"
            } ${showLabel ? "ml-[4px] max-w-[160px] opacity-100" : "ml-0 max-w-0 opacity-0"}`}
            style={{ fontSize: labelSize ?? size }}
          >
            <p className="leading-[20px]">{verified ? "Verified" : "Recommended"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
