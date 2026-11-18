import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getAllReports, getReportReasons, getReportStats } from "@/app/api/report";
import KpiCard from "@/app/components/shared/KpiCard";
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

  const byStatus = reportStats?.data?.by_status;
  const statusCards = [
    { status: "open", label: "Open", icon: "solar:flag-linear", tone: "bg-lightwarning text-warning", value: byStatus?.open },
    { status: "in_review", label: "In review", icon: "solar:eye-linear", tone: "bg-lightinfo text-info", value: byStatus?.in_review },
    { status: "resolved", label: "Resolved", icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success", value: byStatus?.resolved },
    { status: "dismissed", label: "Dismissed", icon: "solar:close-circle-linear", tone: "bg-lightgray dark:bg-dark text-darklink", value: byStatus?.dismissed },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusCards.map((c) => (
          <Link key={c.status} href={`?status=${c.status}&page=1`} className="block">
            <KpiCard icon={c.icon} value={c.value ?? 0} label={c.label} tone={c.tone} />
          </Link>
        ))}
        <KpiCard
          icon="solar:calendar-mark-linear"
          value={byStatus?.closed_today ?? 0}
          label="Closed today"
          tone="bg-lightprimary text-primary"
        />
      </div>
      <SmallCards overviewData={overviewData} />
    </div>
  );
};

const ReportTableWrapper = async ({
  page,
  limit,
  service,
  status,
  reasonId,
  handledBy,
}: {
  page: number;
  limit: number;
  service?: string;
  status?: string;
  reasonId?: string;
  handledBy?: string;
}) => {
  const [reports, reasons] = await Promise.all([
    getAllReports(page, limit, service, status, { reason_id: reasonId, handled_by: handledBy }),
    getReportReasons(),
  ]);

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
      defaultValue: service ?? "",
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
      defaultValue: status ?? "",
    },
    {
      label: "Reason",
      key: "reason_id",
      options: [
        { value: "", label: "All reasons" },
        ...(reasons?.data ?? []).map((r) => ({ value: r.uuid, label: r.is_active ? r.title : `${r.title} (off)` })),
      ],
      defaultValue: reasonId ?? "",
    },
    {
      label: "Handled by",
      key: "handled_by",
      options: [
        { value: "", label: "Anyone" },
        { value: "me", label: "Me" },
      ],
      defaultValue: handledBy ?? "",
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
  const reasonId = searchParams.reason_id?.toString();
  const handledBy = searchParams.handled_by?.toString();

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold">Reports</h4>
            <p className="text-sm text-darklink">
              Take a report to review it, then resolve or dismiss it. Every step is kept in the report&apos;s history.
            </p>
          </div>
          <Link
            href="/dashboards/reports/reasons"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-lightprimary px-3 py-2 rounded-lg"
          >
            <Icon icon="solar:list-check-linear" height={17} />
            Manage reasons
          </Link>
        </div>
        <div className="col-span-12">
          <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportStatsWrapper />
          </Suspense>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}-${service}-${status}-${reasonId}-${handledBy}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <ReportTableWrapper
              page={page}
              limit={limit}
              service={service}
              status={status}
              reasonId={reasonId}
              handledBy={handledBy}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
