import { getMarketSquareProductDetails } from "@/app/api/market-square";
import ProductDetailContent from "./ProductDetailContent";

const Page = async (props: { params: Promise<{ product_id: string }> }) => {
  const params = await props.params;
  const res = await getMarketSquareProductDetails(params.product_id);
  return <ProductDetailContent product={res?.data?.product_details || null} />;
};

export default Page;
