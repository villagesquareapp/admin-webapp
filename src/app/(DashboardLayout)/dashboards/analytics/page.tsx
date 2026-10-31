import { Suspense } from "react";
import { getAnalyticsOverview, getFunnel } from "@/app/api/analytics";
import OverviewHeader from "./OverviewHeader";
import OverviewView from "./OverviewView";

const RANGES = [7, 30, 90];

const Data = async ({ days }: { days: number }) => {
  const [overview, funnel] = await Promise.all([getAnalyticsOverview(days), getFunnel(days)]);
  return <OverviewView overview={overview?.data ?? null} funnel={funnel?.data ?? null} />;
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const days = RANGES.includes(Number(params.days)) ? Number(params.days) : 30;
  return (
    <div className="flex flex-col gap-5">
      <OverviewHeader days={days} />
      <Suspense key={days} fallback={<div className="h-[640px] w-full animate-pulse bg-lightgray dark:bg-white/5 rounded-3xl" />}>
        <Data days={days} />
      </Suspense>
    </div>
  );
};

export default Page;
