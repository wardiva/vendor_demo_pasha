import helpGlyph from "@/components/assets/icon-help.svg";

/**
 * The help mark in the top navbar — Figma 221:3042, as the node exports it.
 *
 * One implementation for both pages: their navbars are separate copies of the
 * same imported markup, and this is the piece they were each missing.
 */
export default function HelpIcon({ size = 22 }: { size?: number }) {
  return (
    <div className="relative shrink-0" data-name="help" style={{ width: size, height: size }}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={helpGlyph} />
    </div>
  );
}

/**
 * The mark in the 42x44 slot the navbar gives it (221:3041), so it sits on the
 * bell's own baseline and the row keeps its height.
 */
export function HelpControl() {
  return (
    <div
      className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0"
      data-name="Container"
    >
      <HelpIcon />
    </div>
  );
}
