import { Suspense } from "react";
import { getPostDetail } from "@/app/api/post";
import PostDetailContent from "./PostDetailContent";

const Wrapper = async ({ id }: { id: string }) => {
  const res = await getPostDetail(id);
  return <PostDetailContent detail={res?.data?.post_details ?? null} postId={id} />;
};

const Page = async (props: { params: Promise<{ post_id: string }> }) => {
  const params = await props.params;
  return (
    <Suspense
      key={params.post_id}
      fallback={<div className="h-[640px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper id={params.post_id} />
    </Suspense>
  );
};

export default Page;
