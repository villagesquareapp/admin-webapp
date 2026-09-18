import { Suspense } from "react";
import { getVflixReports } from "@/app/api/vflix";
import ReportsView from "./ReportsView";

const Wrapper = async ({
  page,
  limit,
  status,
  type,
}: {
  page: number;
  limit: number;
  status?: string;
  type?: string;
}) => {
  const res = await getVflixReports(page, limit, { status, type });
  return (
    <ReportsView
      reports={res?.data?.data || []}
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
  const limit = Number(searchParams.limit) || 15;
  const status = searchParams.status as string | undefined;
  const type = searchParams.type as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${status}-${type}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} type={type} />
    </Suspense>
  );
};

export default Page;
