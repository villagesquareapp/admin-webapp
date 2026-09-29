import { getATCApplication } from "@/app/api/atc";
import ATCApplicationDetail from "./ATCApplicationDetail";

const Page = async ({ params }: { params: { uuid: string } }) => {
  const res = await getATCApplication(params.uuid);
  return <ATCApplicationDetail application={res?.data || null} />;
};

export default Page;
