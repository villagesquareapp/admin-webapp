// page.tsx
// import ClientPostPage from "./ClientPostPage";

// const Page = () => {
//   return <ClientPostPage />;
// };

// export default Page;


import { Suspense } from "react";
import { getPosts, getPostStats } from "@/app/api/post";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import PostTable from "./PostTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const PostStatsWrapper = async () => {
  const postStats = await getPostStats();

  const overviewData: IOverviewData[] = [
    {
      total: postStats?.data?.total_posts || 0,
      icon: "mdi:post-outline",
      bgcolor: "secondary",
      title: "Total Posts",
      shape: shape1,
      link: "",
    },
    {
      total: postStats?.data?.today_posts || 0,
      icon: "mdi:calendar-today",
      bgcolor: "primary",
      title: "Today's Active Posts",
      shape: shape3,
      link: "",
    },
    {
      total: postStats?.data?.reported_posts || 0,
      icon: "mdi:flag-outline",
      bgcolor: "primary",
      title: "Reported Posts",
      shape: shape3,
      link: "",
    },
    {
      total: postStats?.data?.total_likes || 0,
      icon: "mdi:heart-outline",
      bgcolor: "primary",
      title: "Total Likes",
      shape: shape3,
      link: "",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const PostTableWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const posts = await getPosts(page, limit);
  return (
    <PostTable
      posts={posts?.data || null}
      totalPages={posts?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <PostStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <PostTableWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
