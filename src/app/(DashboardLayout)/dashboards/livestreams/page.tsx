import { Suspense } from "react";
import { getLivestreamOverview } from "@/app/api/livestream";
import LivestreamOverviewContent from "./LivestreamOverviewContent";

const OverviewWrapper = async () => {
  const res = await getLivestreamOverview();
  return <LivestreamOverviewContent data={res?.data || null} />;
};

const Page = () => (
  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
    <OverviewWrapper />
  </Suspense>
);

export default Page;
