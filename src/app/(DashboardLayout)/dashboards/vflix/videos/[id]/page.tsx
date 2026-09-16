import { Suspense } from "react";
import { getVflixVideoDetail } from "@/app/api/vflix";
import VideoDetailContent from "./VideoDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getVflixVideoDetail(id);
  return <VideoDetailContent video={res?.data ?? null} />;
};

const Page = ({ params }: { params: { id: string } }) => (
  <Suspense
    fallback={<div className="h-[640px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
  >
    <Wrapper id={params.id} />
  </Suspense>
);

export default Page;
