import { getPostCategories } from "@/app/api/post-categories";
import { getTrybeTypes } from "@/app/api/trybes";
import CategoryScopeTabs from "@/app/components/shared/CategoryScopeTabs";
import { loadCategoryScope } from "@/utils/categoryScope";
import PostCategoryTable from "../PostCategoryTable";

const NOTES = {
  general: "Shown as tabs on the main app's home after For you, Following and Trending.",
  trybes: "Shown as tabs inside Trybes of this type after For you and Trending.",
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const { trybeTypes, scope, categories } = await loadCategoryScope(searchParams.type, getTrybeTypes, getPostCategories);
  return (
    <CategoryScopeTabs trybeTypes={trybeTypes} type={scope.type} notes={NOTES}>
      <PostCategoryTable categories={categories} scope={scope} />
    </CategoryScopeTabs>
  );
};

export default Page;
