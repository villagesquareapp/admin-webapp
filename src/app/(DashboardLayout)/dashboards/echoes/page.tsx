import { Suspense } from "react";
import { getEchoOverview } from "@/app/api/echo";
import EchoOverviewContent from "./EchoOverviewContent";

const OverviewWrapper = async () => {
  const res = await getEchoOverview();
  return <EchoOverviewContent data={res?.data || null} />;
};

const Page = () => (
  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
    <OverviewWrapper />
  </Suspense>
);

export default Page;
