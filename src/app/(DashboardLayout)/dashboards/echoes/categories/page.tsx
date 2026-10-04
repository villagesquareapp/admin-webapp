import { getEchoCategories } from "@/app/api/echo";
import { getTrybeTypes } from "@/app/api/trybes";
import CategoryScopeTabs from "@/app/components/shared/CategoryScopeTabs";
import { loadCategoryScope } from "@/utils/categoryScope";
import EchoCategoryTable from "../EchoCategoryTable";

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const { trybeTypes, scope, categories } = await loadCategoryScope(searchParams.type, getTrybeTypes, getEchoCategories);
  return (
    <CategoryScopeTabs trybeTypes={trybeTypes} type={scope.type}>
      <EchoCategoryTable categories={categories} scope={scope} />
    </CategoryScopeTabs>
  );
};

export default Page;
