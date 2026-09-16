import { Suspense } from "react";
import { getVflixOverview } from "@/app/api/vflix";
import OverviewContent from "./OverviewContent";

const OverviewWrapper = async () => {
  const res = await getVflixOverview();
  return <OverviewContent data={res?.data ?? null} />;
};

const Page = () => (
  <Suspense
    fallback={
      <div className="h-[640px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
    }
  >
    <OverviewWrapper />
  </Suspense>
);

export default Page;
