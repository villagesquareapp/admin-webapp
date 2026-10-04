import { getMarketSquareCategories } from "@/app/api/market-square";
import { getTrybeTypes } from "@/app/api/trybes";
import CategoryScopeTabs from "@/app/components/shared/CategoryScopeTabs";
import { loadCategoryScope } from "@/utils/categoryScope";
import MarketCategoryTable from "../MarketCategoryTable";

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const { trybeTypes, scope, categories } = await loadCategoryScope(
    searchParams.type,
    getTrybeTypes,
    getMarketSquareCategories
  );
  return (
    <CategoryScopeTabs trybeTypes={trybeTypes} type={scope.type}>
      <MarketCategoryTable categories={categories} scope={scope} />
    </CategoryScopeTabs>
  );
};

export default Page;
