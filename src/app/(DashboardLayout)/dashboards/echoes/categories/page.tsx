import { getEchoCategories } from "@/app/api/echo";
import { getTrybeTypes } from "@/app/api/trybes";
import CategoryScopeTabs from "@/app/components/shared/CategoryScopeTabs";
import { loadCategoryScope } from "@/utils/categoryScope";
import EchoCategoryTable from "../EchoCategoryTable";

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const { trybeTypes, scope, categories } = await loadCategoryScope(searchParams.type, getTrybeTypes, getEchoCategories);
  return (
    <CategoryScopeTabs trybeTypes={trybeTypes} type={scope.type}>
      <EchoCategoryTable categories={categories} scope={scope} />
    </CategoryScopeTabs>
  );
};

export default Page;
