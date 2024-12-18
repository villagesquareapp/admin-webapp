import { getMarketSquareShops, getMarketSquareStats } from "@/app/api/market-square";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ShopTable from "./ShopTable";
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

  const [marketSquareStats, marketSquareShops] = await Promise.all([
    getMarketSquareStats(),
    getMarketSquareShops(page, limit),
  ]);

  const overviewData: IOverviewData[] = [
    {
      total: marketSquareStats?.data?.total_products || 0,
      icon: "mdi:package-variant-closed",
      bgcolor: "secondary",
      title: "Total Products",
      shape: shape1,
      link: "",
    },
    {
      total: marketSquareStats?.data?.total_shops || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "Total Shops",
      shape: shape3,
      link: "",
    },
    {
      total: marketSquareStats?.data?.today_products || 0,
      icon: "mdi:package-variant-plus",
      bgcolor: "success",
      title: "Today's Products",
      shape: shape2,
      link: "",
    },
    {
      total: marketSquareStats?.data?.reported_products || 0,
      icon: "mdi:alert-circle",
      bgcolor: "primary",
      title: "Reported Products",
      shape: shape3,
      link: "",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        <div className="col-span-12">
          <ShopTable
            shops={marketSquareShops?.data || null}
            totalPages={marketSquareShops?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
