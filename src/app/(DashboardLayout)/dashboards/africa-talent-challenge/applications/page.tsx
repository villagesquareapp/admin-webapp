import { Suspense } from "react";
import { getATCApplications, getATCPeriods } from "@/app/api/atc";
import ATCApplicationsTable from "./ATCApplicationsTable";

const Wrapper = async ({
  period, status, search, page, limit,
}: { period: string; status: string; search: string; page: number; limit: number }) => {
  const [apps, periods] = await Promise.all([
    getATCApplications(period, status, search, page, limit),
    getATCPeriods(),
  ]);

  const periodOptions = periods?.data?.periods || [];
  const periodFilter = periodOptions.length
    ? {
        label: "Period", key: "period", defaultValue: "",
        options: [{ value: "", label: "All periods" }, ...periodOptions.map((p) => ({ value: p.value, label: p.label }))],
      }
    : undefined;

  return (
    <ATCApplicationsTable
      applications={apps?.data?.data || []}
      totalPages={apps?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      periodFilter={periodFilter}
    />
  );
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const period = (searchParams.period as string) || "";
  const status = (searchParams.status as string) || "";
  const search = (searchParams.search as string) || "";
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  return (
    <Suspense key={`${period}-${status}-${search}-${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper period={period} status={status} search={search} page={page} limit={limit} />
    </Suspense>
  );
};

export default Page;
