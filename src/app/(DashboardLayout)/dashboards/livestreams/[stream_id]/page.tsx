import { Suspense } from "react";
import { getLivestreamDetail } from "@/app/api/livestream";
import LivestreamDetailContent from "./LivestreamDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getLivestreamDetail(id);
  return <LivestreamDetailContent detail={res?.data?.stream_details ?? null} streamId={id} />;
};

const Page = ({ params }: { params: { stream_id: string } }) => (
  <Suspense
    key={params.stream_id}
    fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
  >
    <Wrapper id={params.stream_id} />
  </Suspense>
);

export default Page;
