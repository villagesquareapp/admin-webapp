import { getUserStats, getUsers } from "@/app/api/user";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import shape5 from "/public/images/shapes/circle-white-shape.png";
import shape4 from "/public/images/shapes/circlr-shape.png";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async () => {
  const [userStats, users] = await Promise.all([getUserStats(), getUsers()]);

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
      total: userStats?.data?.logged_in_users || 0,
      icon: "mdi:post",
      bgcolor: "success",
      title: "Logged In Users",
      shape: shape2,
      link: "",
    },
    {
      total: userStats?.data?.reported_users || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Reported Users",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.today_active_users || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Today Active Users",
      shape: shape3,
      link: "",
    },
    {
      total: userStats?.data?.today_new_users || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Today New Users",
      shape: shape3,
      link: "",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        {/* <div className="lg:col-span-6  col-span-12">
          <Welcome />
        </div> */}
        {/* <div className="lg:col-span-6 col-span-12"> */}
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        {/* @Todo - Remove from here */}
      </div>
    </>
  );
};

export default Page;
