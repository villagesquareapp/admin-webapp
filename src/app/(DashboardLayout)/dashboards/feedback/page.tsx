import { Suspense } from "react";
import { getFeedbackSessions, getFeedbackStats } from "@/app/api/feedback";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import FeedbackTable from "./FeedbackTable";
import shape1 from "../../../../../public/images/shapes/danger-card-shape.png";
import shape2 from "../../../../../public/images/shapes/secondary-card-shape.png";
import shape3 from "../../../../../public/images/shapes/success-card-shape.png";

const StatsWrapper = async () => {
  const stats = await getFeedbackStats();
  const d = stats?.data;
  const overviewData: IOverviewData[] = [
    { total: d?.total_sessions || 0, icon: "mdi:message-text", bgcolor: "secondary", title: "All Sessions", shape: shape1, link: "" },
    { total: d?.total_feedback || 0, icon: "mdi:comment-quote", bgcolor: "primary", title: "Feedback", shape: shape3, link: "" },
    { total: d?.total_feature_requests || 0, icon: "mdi:lightbulb-on", bgcolor: "success", title: "Feature Requests", shape: shape2, link: "" },
    { total: d?.total_active || 0, icon: "mdi:progress-clock", bgcolor: "primary", title: "Active", shape: shape3, link: "" },
    { total: d?.total_completed || 0, icon: "mdi:check-circle", bgcolor: "primary", title: "Completed", shape: shape3, link: "" },
    { total: d?.total_reviewed || 0, icon: "mdi:eye-check", bgcolor: "primary", title: "Reviewed", shape: shape3, link: "" },
    { total: d?.total_converted || 0, icon: "mdi:ticket-confirmation", bgcolor: "primary", title: "Made Tickets", shape: shape3, link: "" },
  ];
  return <SmallCards overviewData={overviewData} />;
};

const TableWrapper = async ({
  page, limit, type, status, reviewed, search,
}: { page: number; limit: number; type?: string; status?: string; reviewed?: string; search?: string }) => {
  const res = await getFeedbackSessions(page, limit, { type, status, reviewed, search });

  const filterDropdowns = [
    {
      label: "Type",
      key: "type",
      defaultValue: "",
      options: [
        { value: "", label: "All types" },
        { value: "feedback", label: "Feedback" },
        { value: "feature_request", label: "Feature request" },
        { value: "untyped", label: "Not set" },
      ],
    },
    {
      label: "Status",
      key: "status",
      defaultValue: "",
      options: [
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "abandoned", label: "Abandoned" },
      ],
    },
    {
      label: "Reviewed",
      key: "reviewed",
      defaultValue: "",
      options: [
        { value: "", label: "All" },
        { value: "false", label: "Not reviewed" },
        { value: "true", label: "Reviewed" },
      ],
    },
  ];

  return (
    <FeedbackTable
      sessions={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      filterDropdowns={filterDropdowns}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const type = searchParams.type?.toString();
  const status = searchParams.status?.toString();
  const reviewed = searchParams.reviewed?.toString();
  const search = searchParams.search?.toString();

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12">
        <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
          <StatsWrapper />
        </Suspense>
      </div>
      <div className="col-span-12">
        <Suspense key={`${page}-${limit}-${type}-${status}-${reviewed}-${search}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
          <TableWrapper page={page} limit={limit} type={type} status={status} reviewed={reviewed} search={search} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
