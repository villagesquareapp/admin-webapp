import { Suspense } from "react";
import { getVflixSeries } from "@/app/api/vflix-insights";
import VflixBreadcrumb from "../VflixBreadcrumb";
import SeriesView from "./SeriesView";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Series" },
];

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
    <>
      <VflixBreadcrumb title="Series & Collections" items={BCrumb} backTo="/dashboards/vflix" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}-${status}-${search}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <Wrapper page={page} limit={limit} status={status} search={search} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
