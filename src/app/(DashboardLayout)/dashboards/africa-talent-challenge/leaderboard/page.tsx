import { Suspense } from "react";
import { getLeaderboard, getATCPeriods } from "@/app/api/atc";
import LeaderboardView from "./LeaderboardView";

const Wrapper = async ({ period }: { period: string }) => {
  const [lb, periods] = await Promise.all([getLeaderboard(period), getATCPeriods()]);
  return <LeaderboardView data={lb?.data || null} periods={periods?.data?.periods || []} period={period} />;
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const period = (searchParams.period as string) || "";
  return (
    <Suspense key={period} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper period={period} />
    </Suspense>
  );
};

export default Page;
