import { getEchoCategories } from "@/app/api/echo";
import EchoCategoryTable from "../EchoCategoryTable";

const Page = async () => {
  const res = await getEchoCategories();
  const categories = Array.isArray(res?.data) ? res.data : [];
  return <EchoCategoryTable categories={categories} />;
};

export default Page;
