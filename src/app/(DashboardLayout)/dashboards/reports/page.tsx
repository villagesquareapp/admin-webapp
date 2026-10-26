import { Suspense } from "react";
import { getAllReports, getReportStats } from "@/app/api/report";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ReportTable from "./ReportTable";
import shape1 from "../../../../../public/images/shapes/danger-card-shape.png";
import shape2 from "../../../../../public/images/shapes/secondary-card-shape.png";
import shape3 from "../../../../../public/images/shapes/success-card-shape.png";

const ReportStatsWrapper = async () => {
  const reportStats = await getReportStats();

  const overviewData: IOverviewData[] = [
    {
      total: reportStats?.data?.total_reports || 0,
      icon: "mdi:flag",
      bgcolor: "secondary",
      title: "Total Reports",
      shape: shape1,
      link: "",
    },
    {
      total: reportStats?.data?.total_user_reports || 0,
      icon: "mdi:account-alert",
      bgcolor: "success",
      title: "User Reports",
      shape: shape2,
      link: "",
    },
    {
      total: reportStats?.data?.total_post_reports || 0,
      icon: "mdi:post",
      bgcolor: "primary",
      title: "Post Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_echo_reports || 0,
      icon: "mdi:video-wireless",
      bgcolor: "primary",
      title: "Echo Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_live_stream_reports || 0,
      icon: "mdi:video",
      bgcolor: "primary",
      title: "Live Stream Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_marketplace_reports || 0,
      icon: "mdi:store",
      bgcolor: "primary",
      title: "MarketSquare Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_vflix_reports || 0,
      icon: "mdi:movie-open-play",
      bgcolor: "primary",
      title: "VFlix Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_trybe_reports || 0,
      icon: "mdi:account-group",
      bgcolor: "primary",
      title: "Trybe Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_atc_reports || 0,
      icon: "mdi:trophy",
      bgcolor: "primary",
      title: "ATC Reports",
      shape: shape3,
      link: "",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const ReportTableWrapper = async ({
  page,
  limit,
  service,
  status,
}: {
  page: number;
  limit: number;
  service?: string;
  status?: string;
}) => {
  const reports = await getAllReports(page, limit, service, status);

  const filterDropdowns = [
    {
      label: "Service Type",
      key: "service",
      options: [
        { value: "", label: "All Services" },
        { value: "user", label: "User" },
        { value: "post", label: "Post" },
        { value: "echo", label: "Echo" },
        { value: "livestream", label: "Live Stream" },
        { value: "marketsquare", label: "MarketSquare" },
        { value: "vflix", label: "VFlix" },
        { value: "trybe", label: "Trybe" },
        { value: "africa-talent-challenge", label: "ATC" },
      ],
      defaultValue: "",
    },
    {
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
    },
  ];

  return (
    <ReportTable
      reports={reports?.data || null}
      totalPages={reports?.data?.last_page || 1}
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
  const service = searchParams.service?.toString();
  const status = searchParams.status?.toString();

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}-${service}-${status}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportTableWrapper
              page={page}
              limit={limit}
              service={service}
              status={status}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
