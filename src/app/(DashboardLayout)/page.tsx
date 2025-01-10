import { getEchoStats } from "../api/echo";
import { getLivestreamStats } from "../api/livestream";
import { getMarketSquareStats } from "../api/market-square";
import { getPostStats } from "../api/post";
import { getUsers, getUserStats } from "../api/user";
import SmallCards from "../components/dashboards/ecommerce/smallCards";
import PendingVerifications from "./PendingVerifications";
import Withdrawals from "./Withdrawals";
import shape5 from "/public/images/shapes/circle-white-shape.png";
import shape4 from "/public/images/shapes/circlr-shape.png";
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

  const [userStats, postStats, marketSquareStats, liveStreamStats, echoStats, users] =
    await Promise.all([
      getUserStats(),
      getPostStats(),
      getMarketSquareStats(),
      getLivestreamStats(),
      getEchoStats(),
      getUsers(page, limit),
    ]);

  console.log("USER STATS", userStats);

  const overviewData: IOverviewData[] = [
    {
      total: userStats?.data?.total_users || 0,
      icon: "mdi:account-group",
      bgcolor: "secondary",
      title: "Total Users",
      shape: shape1,
      link: "/dashboard/users",
    },
    {
      total: postStats?.data?.total_posts || 0,
      icon: "mdi:post",
      bgcolor: "success",
      title: "Total Posts",
      shape: shape2,
      link: "/dashboard/posts",
    },
    {
      total: marketSquareStats?.data?.total_products || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Total Market Squares",
      shape: shape3,
      link: "/dashboard/markets",
    },
    {
      total: liveStreamStats?.data?.total_livestreams || 0,
      icon: "mdi:video",
      bgcolor: "info",
      title: "Total Live Streams",
      shape: shape4,
      link: "/dashboard/livestreams",
    },
    {
      total: echoStats?.data?.total_echoes || 0,
      icon: "mdi:video-wireless",
      bgcolor: "warning",
      title: "Total Echoes",
      shape: shape5,
      link: "/dashboard/echoes",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-y-8 lg:gap-x-30 lg:gap-y-30">
        {/* <div className="lg:col-span-6  col-span-12">
          <Welcome />
        </div> */}
        {/* <div className="lg:col-span-6 col-span-12"> */}
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        {/* @Remove from here */}
        {/* <div className="lg:col-span-8 col-span-12">
          <SalesProfit />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <ProductSales />
        </div>
        <div className="lg:col-span-5 col-span-12">
          <MarketingReport />
        </div>
        <div className="lg:col-span-3 col-span-12">
          <Payments />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <AnnualProfit />
        </div> */}
        {/* @Remove to here */}
        {/* <div className="lg:col-span-8 col-span-12">
          <PendingVerifications
            users={users?.data || null}
            totalPages={users?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <Withdrawals />
        </div> */}
      </div>
    </>
  );
};

export default Page;
