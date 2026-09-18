import { Suspense } from "react";
import { getVflixSeries } from "@/app/api/vflix-insights";
import SeriesView from "./SeriesView";

const Wrapper = async ({ page, limit, status, search }: { page: number; limit: number; status?: string; search?: string }) => {
  const res = await getVflixSeries(page, limit, { status, search });
  return (
    <SeriesView
      series={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
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
  const limit = Number(searchParams.limit) || 12;
  const status = searchParams.status as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${status}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} search={search} />
    </Suspense>
  );
};

export default Page;
