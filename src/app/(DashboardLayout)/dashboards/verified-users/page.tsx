import { Suspense } from "react";
import {
  getVerifiedUserStats,
  getVerifiedUsers,
} from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import VerifiedUserTable from "./VerifiedUserTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const VerifiedUserStatsWrapper = async () => {
  const userStats = await getVerifiedUserStats();

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_verified_users || 0,
      icon: "mdi:account-group",
      bgcolor: "secondary",
      title: "Total Verified Users",
      shape: shape1,
      link: "",
      activeSubscribers: userStats?.data?.total_active_subscribers || 0,
    },
    {
      total: userStats?.data?.greencheck_verified_users || 0,
      icon: "mdi:account-plus",
      bgcolor: "primary",
      title: "Total Greencheck Users",
      shape: shape3,
      link: "",
      activeSubscribers: userStats?.data?.greencheck_active_subscribers || 0,
    },
    {
      total: userStats?.data?.premium_verified_users || 0,
      icon: "mdi:login",
      bgcolor: "success",
      title: "Total Premium Users",
      shape: shape2,
      link: "",
      activeSubscribers: userStats?.data?.premium_active_subscribers || 0,
    },
  ];

  return <SmallCards overviewData={overviewData} />;
}

const VerifiedUserTableWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const users = await getVerifiedUsers(page, limit);
  return (
    <VerifiedUserTable
      users={users?.data || null}
      totalPages={users?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <VerifiedUserStatsWrapper />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <VerifiedUserTableWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
