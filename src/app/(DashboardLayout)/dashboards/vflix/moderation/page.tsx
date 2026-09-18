import { Suspense } from "react";
import { getVflixModerationQueue } from "@/app/api/vflix";
import VflixTable from "../VflixTable";

const ModerationWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const res = await getVflixModerationQueue(page, limit);
  return (
    <VflixTable
      videos={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      showReportCount
      tableTitle="Moderation Queue"
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
      <ModerationWrapper page={page} limit={limit} />
    </Suspense>
  );
};

export default Page;
