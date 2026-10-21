import { getLivestreamCategories } from "@/app/api/livestream";
import { getTrybeTypes } from "@/app/api/trybes";
import CategoryScopeTabs from "@/app/components/shared/CategoryScopeTabs";
import { loadCategoryScope } from "@/utils/categoryScope";
import LivestreamCategoryTable from "../LivestreamCategoryTable";

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const { trybeTypes, scope, categories } = await loadCategoryScope(
    searchParams.type,
    getTrybeTypes,
    getLivestreamCategories
  );
  return (
    <CategoryScopeTabs trybeTypes={trybeTypes} type={scope.type}>
      <LivestreamCategoryTable categories={categories} scope={scope} />
    </CategoryScopeTabs>
  );
};

export default Page;
