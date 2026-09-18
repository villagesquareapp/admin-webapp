import { getLivestreamCategories } from "@/app/api/livestream";
import LivestreamCategoryTable from "../LivestreamCategoryTable";

const Page = async () => {
  const res = await getLivestreamCategories();
  const categories = Array.isArray(res?.data) ? res.data : [];
  return <LivestreamCategoryTable categories={categories} />;
};

export default Page;
