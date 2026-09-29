import { getMarketSquareProductDetails } from "@/app/api/market-square";
import ProductDetailContent from "./ProductDetailContent";

const Page = async ({ params }: { params: { product_id: string } }) => {
  const res = await getMarketSquareProductDetails(params.product_id);
  return <ProductDetailContent product={res?.data?.product_details || null} />;
};

export default Page;
