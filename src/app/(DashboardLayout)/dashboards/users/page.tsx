import { Suspense } from "react";
import { getUserStats, getUsers } from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import UserTable from "./UserTable";
import UserProfileWrapper from "./UserProfileWrapper";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const UserStatsWrapper = async () => {
  const userStats = await getUserStats();

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_users || 0,
      icon: "mdi:account-group",
      bgcolor: "secondary",
      title: "Total Users",
      shape: shape1,
      link: "",
    },
    {
      total: userStats?.data?.today_new_users || 0,
      icon: "mdi:account-plus",
      bgcolor: "primary",
      title: "Today's New Users",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.today_active_users || 0,
      icon: "mdi:login",
      bgcolor: "success",
      title: "Active Users",
      shape: shape2,
      link: "",
    },
    {
      total: userStats?.data?.reported_users || 0,
      icon: "mdi:flag",
      bgcolor: "primary",
      title: "Reported Users",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.verified_users || 0,
      icon: "mdi:account-check",
      bgcolor: "primary",
      title: "Verified Users",
      shape: shape3,
      link: "/dashboards/verified-users",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const UserContentWrapper = async ({
  page,
  limit,
  userId,
}: {
  page: number;
  limit: number;
  userId?: string;
}) => {
  const users = await getUsers(page, limit);

  const selectedUser =
    userId && users?.data?.data
      ? users.data.data
        .flat()
        .find((user: any) => user?.user_details?.profile?.id === userId)
      : null;

  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      to: "/dashboards/users",
      title: "Users",
    },
    {
      title: selectedUser?.user_details?.profile?.name || "",
    },
  ];

  if (userId) {
    return <UserProfileWrapper user={selectedUser || null} breadcrumbs={BCrumb} />;
  }

  return (
    <UserTable
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
  const userId = searchParams.userId as string;

  return (
    <>
      {userId ? (
        <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
          <UserContentWrapper page={page} limit={limit} userId={userId} />
        </Suspense>
      ) : (
        <div className="grid grid-cols-12 gap-30">
          <div className="col-span-12">
            <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <UserStatsWrapper />
            </Suspense>
          </div>
          <div className="col-span-12">
            <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <UserContentWrapper page={page} limit={limit} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
