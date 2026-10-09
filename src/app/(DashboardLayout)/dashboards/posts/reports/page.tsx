import { Suspense } from "react";
import { getAllReports } from "@/app/api/report";
import PostReportsView from "./PostReportsView";

const Wrapper = async ({ page, limit, status }: { page: number; limit: number; status?: string }) => {
  const res = await getAllReports(page, limit, "post", status);
  return (
    <PostReportsView
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
  const limit = Number(searchParams.limit) || 20;
  const status = searchParams.status?.toString();

  return (
    <Suspense
      key={`${page}-${limit}-${status}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} />
    </Suspense>
  );
};

export default Page;
