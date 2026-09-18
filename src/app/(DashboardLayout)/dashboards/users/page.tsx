import { Suspense } from "react";
import { getUserOverview } from "@/app/api/user";
import UsersOverviewContent from "./UsersOverviewContent";

const OverviewWrapper = async () => {
  const res = await getUserOverview();
  return <UsersOverviewContent data={res?.data || null} />;
};

const Page = () => (
  <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
    <OverviewWrapper />
  </Suspense>
);

export default Page;
