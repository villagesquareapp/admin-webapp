import { getEchoStats } from "../api/echo";
import { getLiveStreamStats } from "../api/livestream";
import { getMarketSquareStats } from "../api/market-square";
import { getPostStats } from "../api/post";
import { getUserStats } from "../api/user";
import AnnualProfit from "../components/dashboards/ecommerce/AnnualProfit";
import MarketingReport from "../components/dashboards/ecommerce/MarketingReport";
import Payments from "../components/dashboards/ecommerce/Payments";
import ProductSales from "../components/dashboards/ecommerce/ProductSales";
import RecentTransaction from "../components/dashboards/ecommerce/RecentTransaction";
import SalesProfit from "../components/dashboards/ecommerce/SalesProfit";
import TopProducts from "../components/dashboards/ecommerce/TopProducts";
import SmallCards from "../components/dashboards/ecommerce/smallCards";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import shape4 from "/public/images/shapes/circlr-shape.png";
import shape5 from "/public/images/shapes/circle-white-shape.png";

const Page = async () => {
  const [userStats, postStats, marketSquareStats, liveStreamStats, echoStats] =
    await Promise.all([
      getUserStats(),
      getPostStats(),
      getMarketSquareStats(),
      getLiveStreamStats(),
      getEchoStats(),
    ]);

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
      <div className="grid grid-cols-12 gap-30">
        {/* <div className="lg:col-span-6  col-span-12">
          <Welcome />
        </div> */}
        {/* <div className="lg:col-span-6 col-span-12"> */}
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        {/* @Todo - Remove from here */}
        <div className="lg:col-span-8 col-span-12">
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
        </div>
        {/* @Todo - Remove to here */}
        <div className="lg:col-span-8 col-span-12">
          <TopProducts />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <RecentTransaction />
        </div>
      </div>
    </>
  );
};

export default Page;
