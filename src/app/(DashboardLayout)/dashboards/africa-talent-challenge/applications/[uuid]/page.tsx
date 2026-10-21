import { getATCApplication } from "@/app/api/atc";
import ATCApplicationDetail from "./ATCApplicationDetail";

const Page = async (props: { params: Promise<{ uuid: string }> }) => {
  const params = await props.params;
  const res = await getATCApplication(params.uuid);
  return <ATCApplicationDetail application={res?.data || null} />;
};

export default Page;
