import { getMarketSquareShopDetails } from "@/app/api/market-square";
import ShopDetailContent from "./ShopDetailContent";

const Page = async (props: { params: Promise<{ shop_id: string }> }) => {
  const params = await props.params;
  const res = await getMarketSquareShopDetails(params.shop_id);
  return <ShopDetailContent shop={res?.data?.shop_details || null} />;
};

export default Page;
