import { getFaqs } from "@/app/api/faq";
import FaqEditor from "./FaqEditor";

const Page = async () => {
  const res = await getFaqs();
  return <FaqEditor data={res?.data ?? null} />;
};

export default Page;
