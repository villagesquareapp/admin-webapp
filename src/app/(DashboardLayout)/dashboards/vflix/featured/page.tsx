import { Suspense } from "react";
import { getVflixVideos } from "@/app/api/vflix";
import VflixTable from "../VflixTable";

const FeaturedWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const res = await getVflixVideos(page, limit, { is_featured: "true" });
  return (
    <VflixTable
      videos={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="Featured Videos"
      backTo="/dashboards/vflix"
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
    <Suspense
      key={`${page}-${limit}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <FeaturedWrapper page={page} limit={limit} />
    </Suspense>
  );
};

export default Page;
