import { Suspense } from "react";
import { getPostOverview } from "@/app/api/post";
import PostsOverviewContent from "./PostsOverviewContent";

const OverviewWrapper = async () => {
  const res = await getPostOverview();
  return <PostsOverviewContent data={res?.data || null} />;
};

const Page = () => {
  return (
    <Suspense
      fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <OverviewWrapper />
    </Suspense>
  );
};

export default Page;
