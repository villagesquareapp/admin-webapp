import { Suspense } from "react";
import { getEchoDetail } from "@/app/api/echo";
import EchoDetailContent from "./EchoDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getEchoDetail(id);
  return <EchoDetailContent detail={res?.data?.echo_details ?? null} echoId={id} />;
};

const Page = ({ params }: { params: { echo_id: string } }) => (
  <Suspense
    key={params.echo_id}
    fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
  >
    <Wrapper id={params.echo_id} />
  </Suspense>
);

export default Page;
