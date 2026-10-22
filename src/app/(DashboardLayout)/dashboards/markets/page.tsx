import { Suspense } from "react";
import { getMarketSquareOverview } from "@/app/api/market-square";
import MarketOverviewContent from "./MarketOverviewContent";
import MarketsHeader from "./MarketsHeader";

const OverviewWrapper = async () => {
  const res = await getMarketSquareOverview();
  return <MarketOverviewContent data={res?.data || null} />;
};

const Page = async () => {
  return (
    <div className="flex flex-col gap-5">
      <MarketsHeader />
      <Suspense fallback={<div className="h-[520px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
        <OverviewWrapper />
      </Suspense>
    </div>
  );
};

export default Page;
