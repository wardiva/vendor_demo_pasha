/**
 * The phone mark, from Figma 76:1978 — one implementation for the whole
 * module, shared by the prospect card's contact reveal and the Contacts tab of
 * the Prospect Details modal.
 */
export default function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    /* The exported asset carries its colour on the stroke — #2F2B3D at 70% —
       so the wrapper adds no opacity of its own; nesting the two would compound
       to 49%. One 15-unit viewBox filling the caller's box scales the mark
       uniformly, so it never stretches, and the stroke stays a full unit clear
       of the viewBox edge at every size. */
    <div className="relative shrink-0" data-name="phone" style={{ width: size, height: size }}>
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 15 15">
        <path
          d="M3.125 1.5H5.625L6.875 4.625L5.3125 5.5625C5.98185 6.91971 7.08029 8.01815 8.4375 8.6875L9.375 7.125L12.5 8.375V10.875C12.5 11.5654 11.9404 12.125 11.25 12.125C6.20478 11.8184 2.1816 7.79522 1.875 2.75C1.875 2.05964 2.43464 1.5 3.125 1.5"
          stroke="#2F2B3D"
          strokeOpacity="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
