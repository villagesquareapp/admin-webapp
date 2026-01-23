import { getUserStats, getUsers } from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ATCTable from "./ATCTable";
// import UserProfileWrapper from "./UserProfileWrapper";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import StatsWithMonthsFilter from "./StatsWithMonthsFilter";

import SearchAndFilter from "./SearchAndFilter";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const userId = searchParams.userId as string;
  const search = searchParams.search as string;
  const status = searchParams.status as string;

  const [userStats, users] = await Promise.all([
    getUserStats(),
    getUsers(page, limit, search, status),
  ]);

  const selectedUser =
    userId && users?.data?.data
      ? users.data.data
        .flat()
        .find((user: IUser) => user?.user_details?.profile?.id === userId)
      : null;

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_users || 0,
      icon: "eos-icons:application",
      bgcolor: "secondary",
      title: "Total Application",
      shape: shape1,
      link: "",
    },

    {
      total: userStats?.data?.today_new_users || 0,
      icon: "streamline-flex:credit-card-approved-solid",
      bgcolor: "primary",
      title: "Total Approved",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.today_active_users || 0,
      icon: "fluent-mdl2:event-declined",
      bgcolor: "success",
      title: "Total Declined",
      shape: shape2,
      link: "",
    },
  ];

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

  return (
    <>
      {/* {userId ? (
        <UserProfileWrapper user={selectedUser || null} breadcrumbs={BCrumb} />
      ) : ( */}
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          {/* <SmallCards overviewData={overviewData} /> */}
          <StatsWithMonthsFilter initialStats={userStats} />
        </div>
        
        <div className="col-span-12">
          <SearchAndFilter />
          <ATCTable
            users={users?.data || null}
            totalPages={users?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
      </div>
      {/* )} */}
    </>
  );
};


export default Page;
