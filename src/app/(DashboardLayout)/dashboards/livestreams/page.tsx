import { Suspense } from "react";
import { getLivestreams, getLivestreamStats } from "@/app/api/livestream";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import LivestreamTable from "./LivestreamTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const LivestreamStatsWrapper = async () => {
  const livestreamStats = await getLivestreamStats();

  const overviewData: IOverviewData[] = [
    {
      total: livestreamStats?.data?.total_livestreams || 0,
      icon: "mdi:video-outline",
      bgcolor: "secondary",
      title: "Total Livestreams",
      shape: shape1,
      link: "",
    },
    {
      total: livestreamStats?.data?.new_livestreams || 0,
      icon: "mdi:video-plus-outline",
      bgcolor: "success",
      title: "New Livestreams",
      shape: shape2,
      link: "",
    },
    {
      total: livestreamStats?.data?.currently_live || 0,
      icon: "mdi:broadcast",
      bgcolor: "primary",
      title: "Currently Live",
      shape: shape3,
      link: "",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const LivestreamTableWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const livestreams = await getLivestreams(page, limit);
  return (
    <LivestreamTable
      livestreams={livestreams?.data || null}
      totalPages={livestreams?.data?.last_page || 1}
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
            <LivestreamStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <LivestreamTableWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
