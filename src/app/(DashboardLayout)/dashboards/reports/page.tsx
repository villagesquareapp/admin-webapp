import { Suspense } from "react";
import { getAllReports, getReportStats } from "@/app/api/report";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ReportTable from "./ReportTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

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
      title: "Marketplace Reports",
      shape: shape3,
      link: "",
    },
    {
      total: reportStats?.data?.total_comment_reports || 0,
      icon: "mdi:comment-alert",
      bgcolor: "primary",
      title: "Comment Reports",
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
  type,
}: {
  page: number;
  limit: number;
  service?: string;
  type?: string;
}) => {
  const reports = await getAllReports(page, limit, service, type);

  const filterDropdowns = [
    {
      label: "Service Type",
      key: "service",
      options: [
        { value: "", label: "All Services" },
        { value: "post", label: "Post" },
        { value: "echo", label: "Echo" },
        { value: "livestream", label: "Live Stream" },
        { value: "comment", label: "Comment" },
      ],
      defaultValue: "",
    },
    {
      label: "Report Type",
      key: "type",
      options: [
        { value: "", label: "All Report Types" },
        { value: "spam", label: "Spam" },
        { value: "nudity", label: "Nudity" },
        { value: "parody", label: "Parody" },
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

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const service = searchParams.service?.toString();
  const type = searchParams.type?.toString();

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}-${service}-${type}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportTableWrapper
              page={page}
              limit={limit}
              service={service}
              type={type}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
