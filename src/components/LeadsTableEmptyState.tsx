/**
 * Shown inside the leads table when the applied filters match no rows.
 *
 * Rendered in normal document flow as the last child of the table card, so it
 * scrolls with the page. It previously used a fixed-position overlay measured
 * against the table's bounding box, which made it stick to the viewport.
 */
export default function LeadsTableEmptyState({
  onReset,
  minHeight,
}: {
  onReset: () => void;
  /** The table's full-data body height, so no-results does not collapse it. */
  minHeight?: number;
}) {
  return (
    <div
      className="content-stretch flex flex-col gap-[16px] items-center justify-center px-[24px] py-[48px] relative shrink-0 w-full"
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="text-center">
        <p className="font-['Inter',sans-serif] text-[15px] font-medium text-[#2f2b3d] mb-[6px]">
          No Prospects Match Your Filters
        </p>
        <p className="font-['Inter',sans-serif] text-[13px] text-[rgba(47,43,61,0.55)]">
          Try adjusting or clearing your filter criteria
        </p>
      </div>

      <button
        onClick={onReset}
        className="mt-[4px] px-[20px] py-[8px] rounded-[10px] border border-solid border-[#072929] bg-white font-['Inter',sans-serif] text-[13px] font-medium text-[#072929] cursor-pointer hover:bg-[rgba(7,41,41,0.04)] transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
