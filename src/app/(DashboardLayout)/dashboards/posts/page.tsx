import { getPosts, getPostStats } from "@/app/api/post";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import PostTable from "./PostTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const [postStats, posts] = await Promise.all([getPostStats(), getPosts()]);

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
      title: "Today Active Posts",
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

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        {/* <div className="lg:col-span-6  col-span-12">
          <Welcome />
        </div> */}
        {/* <div className="lg:col-span-6 col-span-12"> */}
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        <div className="col-span-12">
          <PostTable
            posts={posts?.data || null}
            totalPages={posts?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
