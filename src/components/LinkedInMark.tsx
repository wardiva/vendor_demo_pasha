import svgPaths from "@/imports/BuyerActivityLeads/svg-ry772luhk7";

/**
 * The LinkedIn mark shown beside a company or contact name.
 *
 * One implementation for the Prospects cards and both prospects tables, so the
 * asset, its 5/6 inner height ratio and its colours are the same everywhere.
 * It carries no handler of its own: on every surface a click falls through to
 * whatever the row or card does, exactly as the card view behaves today.
 */
export default function LinkedInMark({ size = 16 }: { size?: number }) {
  return (
    <div className="relative shrink-0" data-name="linkedin-svgrepo-com 3" style={{ width: size, height: size }}>
      <div className="-translate-y-1/2 absolute left-[8.33%] right-[8.33%] top-1/2" style={{ height: size * (13.333 / 16) }}>
        <svg
          className="absolute block inset-0 size-full"
          fill="none"
          height="16.6661"
          preserveAspectRatio="none"
          viewBox="0 0 16.6667 16.6661"
          width="16.6667"
        >
          <g>
            <path d={svgPaths.p1eb23c80} fill="#0077B5" />
            <path d={svgPaths.p1219d480} fill="white" />
          </g>
        </svg>
      </div>
    </div>
  );
}
