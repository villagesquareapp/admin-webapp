import { Suspense } from "react";
import { getReport } from "@/app/api/report";
import ReportDetail from "./ReportDetail";

const Wrapper = async ({ id }: { id: string }) => {
  const report = await getReport(id);
  return <ReportDetail report={report?.status ? report.data ?? null : null} />;
};

const Page = async (props: { params: Promise<{ report_id: string }> }) => {
  const params = await props.params;
  return (
    <Suspense
      key={params.report_id}
      fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper id={params.report_id} />
    </Suspense>
  );
};

export default Page;
