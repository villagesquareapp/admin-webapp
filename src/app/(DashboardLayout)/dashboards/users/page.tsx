import { getUserStats, getUsers } from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import UserTable from "./UserTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import UserProfileApp from "@/app/components/apps/userprofile/profile";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const username = searchParams.username as string;

  const [userStats, users] = await Promise.all([getUserStats(), getUsers(page, limit)]);

  const selectedUser =
    username && users?.data?.data
      ? users.data.data
          .flat()
          .find((user: IUsers) => user?.user_details?.profile?.username === username)
      : null;

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
      total: userStats?.data?.logged_in_users || 0,
      icon: "mdi:login",
      bgcolor: "success",
      title: "Logged In Users",
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
      total: userStats?.data?.today_active_users || 0,
      icon: "mdi:account-check",
      bgcolor: "primary",
      title: "Today's Active Users",
      shape: shape3,
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
      title: selectedUser?.user_details?.profile?.name || username,
    },
  ];

  return (
    <>
      {username ? (
        <>
          <BreadcrumbComp title="User Profile" items={BCrumb} />
          <UserProfileApp user={selectedUser} />
        </>
      ) : (
        <div className="grid grid-cols-12 gap-30">
          <div className="col-span-12">
            <SmallCards overviewData={overviewData} />
          </div>
          <div className="col-span-12">
            <UserTable
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
