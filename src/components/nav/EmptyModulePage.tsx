/**
 * The page behind any module the demo does not build (Profiles, Promotions,
 * Review Campaigns, Billing, Settings): the real shell (header, rail and the
 * module's side nav), with an empty content area under the page's title.
 */

import { PageShell } from "@/imports/BuyerActivityLeads";

export default function EmptyModulePage({ title }: { title: string }) {
  return (
    <PageShell name={`${title} (empty)`} active="signals" locked={false} lock={null}>
      {/* The title sits where the Buyers page puts its own: 371px in, 84px down. */}
      <div className="relative ml-[371px] mt-[84px]" data-name="Empty page">
        <h1 className="m-0 font-['Inter',sans-serif] text-[24px] font-medium leading-[46px] text-[#2f2b3d]">{title}</h1>
      </div>
    </PageShell>
  );
}
