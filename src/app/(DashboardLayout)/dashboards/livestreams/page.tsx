import { Suspense } from "react";
import { getLivestreams, getLivestreamStats, getLivestreamCategories } from "@/app/api/livestream";
import LivestreamTable from "./LivestreamTable";
import LivestreamCategories from "./LivestreamCategories";
import LivestreamStatsSection from "./LivestreamStatsSection";

const LivestreamDataWrapper = async () => {
  const [livestreamStats, categoriesRes] = await Promise.all([
    getLivestreamStats(),
    getLivestreamCategories(),
  ]);

  const categories = categoriesRes?.data && Array.isArray(categoriesRes.data)
    ? categoriesRes.data
    : [];

  return (
    <>
      <LivestreamStatsSection
        totalLivestreams={livestreamStats?.data?.total_livestreams || 0}
        currentlyLive={livestreamStats?.data?.currently_live || 0}
        categoriesCount={categories.length}
        initialCategories={categories}
      />
      <div className="mt-6">
        <LivestreamCategories initialCategories={categories} />
      </div>
    </>
  );
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
          <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <LivestreamDataWrapper />
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
