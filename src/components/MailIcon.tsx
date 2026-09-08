import mailGlyph from "@/components/assets/icon-mail.svg";

/**
 * The envelope mark — Figma 221:2331, as the node exports it.
 *
 * One asset for every surface that shows an email: the prospect card's contact
 * preview and the Recommended Contacts panel in the Prospect Details modal. It
 * replaces the three-layer construction those marks were pieced together from,
 * which drew an empty frame under two positioned overlays.
 *
 * The export carries its colour on the strokes — #2F2B3D at 70%, the same as
 * the phone mark beside it — so the wrapper adds no opacity of its own;
 * nesting the two would compound to 49%. One 15-unit viewBox filling the
 * caller's box scales the mark uniformly at any size.
 */
export default function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <div className="relative shrink-0" data-name="mail" style={{ width: size, height: size }}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={mailGlyph} />
    </div>
  );
}
