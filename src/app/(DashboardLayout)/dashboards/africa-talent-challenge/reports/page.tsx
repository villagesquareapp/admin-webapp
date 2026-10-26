import { Suspense } from "react";
import { getAllReports } from "@/app/api/report";
import ReportTable from "../../reports/ReportTable";

const statusFilter = {
  label: "Status",
  key: "status",
  options: [
    { value: "", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "in_review", label: "In review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ],
  defaultValue: "",
};

const Wrapper = async ({ page, limit, status }: { page: number; limit: number; status?: string }) => {
  const reports = await getAllReports(page, limit, "africa-talent-challenge", status);
  return (
    <ReportTable
      reports={reports?.data || null}
      totalPages={reports?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      filterDropdowns={[statusFilter]}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const status = searchParams.status?.toString();
  return (
    <Suspense key={`${page}-${limit}-${status}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper page={page} limit={limit} status={status} />
    </Suspense>
  );
};

export default Page;
