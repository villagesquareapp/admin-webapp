import {
  getUserStats,
  getUsers,
  getVerifiedUserStats,
  getVerifiedUsers,
} from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import VerifiedUserTable from "./VerifiedUserTable";
// import UserProfileWrapper from "./UserProfileWrapper";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const userId = searchParams.userId as string;

  const [userStats, users] = await Promise.all([
    getVerifiedUserStats(),
    getVerifiedUsers(page, limit),
  ]);

  const selectedUser =
    userId && users?.data?.data
      ? users.data.data
          .flat()
          .find((user: IVerifiedUsers) => user.uuid === userId)
      : null;

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_verified_users || 0,
      icon: "mdi:account-group",
      bgcolor: "secondary",
      title: "Total Verified Users",
      shape: shape1,
      link: "",
      activeSubscribers: 35,
    },

    {
      total: userStats?.data?.greencheck_verified_users || 0,
      icon: "mdi:account-plus",
      bgcolor: "primary",
      title: "Total Greencheck Users",
      shape: shape3,
      link: "",
      activeSubscribers: 25,
    },
    {
      total: userStats?.data?.premium_verified_users || 0,
      icon: "mdi:login",
      bgcolor: "success",
      title: "Total Premium Users",
      shape: shape2,
      link: "",
      activeSubscribers: 10,
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
      title: selectedUser?.name || "",
    },
  ];

  return (
    <>
      {userId ? (
        <></>
      ) : (
        // <UserProfileWrapper user={selectedUser || null} breadcrumbs={BCrumb} />
        <div className="grid grid-cols-12 gap-30">
          <div className="col-span-12">
            <SmallCards overviewData={overviewData} />
          </div>

          <div className="col-span-12">
            <VerifiedUserTable
              users={users?.data || null}
              totalPages={users?.data?.last_page || 1}
              currentPage={page}
              pageSize={limit}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
