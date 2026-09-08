import { type ReactNode } from "react";

/**
 * One wrapper for every phone number and email address in the module.
 *
 * It takes the place of the value's own row, so it inherits that row's classes
 * and the typography, icons and spacing inside it are untouched. The copy
 * button is absolutely positioned in the gap after the value: it adds no width,
 * so revealing it on hover cannot shift anything. The value itself gets no
 * hover treatment — no colour change, background or underline — and only the
 * button is clickable.
 *
 * Clicks are handled by App's `[data-copy-row]` delegate, which owns the
 * clipboard call and the failure toast; both glyphs are rendered here and CSS
 * swaps them, so confirming a copy never fights React over the DOM.
 */
export default function CopyableValue({
  value,
  className = "",
  children,
}: {
  /** Undefined where a contact discloses only one of the two. */
  value: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  /* Nothing to copy, so the row renders exactly as it did before. */
  if (!value) return <div className={className}>{children}</div>;

  const isEmail = value.includes("@");
  return (
    <div data-copy-row data-copy-value={value} className={className}>
      {children}
      <button
        type="button"
        className="lead-copy-btn"
        aria-label={`Copy ${isEmail ? "email address" : "phone number"}`}
      >
        <svg className="lead-copy-glyph lead-copy-glyph--copy" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="4.6" y="4.6" width="7.4" height="7.4" rx="1.6" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M9.4 4.1V3A1.5 1.5 0 0 0 7.9 1.5H3A1.5 1.5 0 0 0 1.5 3v4.9A1.5 1.5 0 0 0 3 9.4h1.1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <svg className="lead-copy-glyph lead-copy-glyph--check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.6 7.4 5.5 10.3 11.4 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
