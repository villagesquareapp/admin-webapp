import { Suspense } from "react";
import { getAllReports } from "@/app/api/report";
import UsersReportsView from "../UsersReportsView";

const Wrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const res = await getAllReports(page, limit, "user");
  return (
    <UsersReportsView
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
  return (
    <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper page={page} limit={limit} />
    </Suspense>
  );
};

export default Page;
