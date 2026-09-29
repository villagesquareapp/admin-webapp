import { Suspense } from "react";
import { getATCStats, getATCPeriods, getATCApplications, getLeaderboard, getATCSuggestions } from "@/app/api/atc";
import ATCOverviewContent, { ATCOverviewData } from "./ATCOverviewContent";

const OverviewWrapper = async ({ period }: { period: string }) => {
  const [stats, leaderboard, apps, suggestion, periods] = await Promise.all([
    getATCStats(period),
    getLeaderboard(period),
    getATCApplications(period, "", "", 1, 6),
    getATCSuggestions(),
    getATCPeriods(),
  ]);

  const data: ATCOverviewData = {
    stats: stats?.data || null,
    leaderboard: leaderboard?.data?.leaderboard || [],
    active_episode: leaderboard?.data?.active_episode || null,
    recent_applications: apps?.data?.data || [],
    suggestion: suggestion?.data || null,
    periods: periods?.data?.periods || [],
    period,
  };

  return <ATCOverviewContent data={data} />;
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const period = (searchParams.period as string) || "";
  return (
    <Suspense key={period} fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <OverviewWrapper period={period} />
    </Suspense>
  );
};

export default Page;
