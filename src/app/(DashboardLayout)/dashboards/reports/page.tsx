import { getAllReports, getReportStats } from "@/app/api/report";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import ReportTable from "./ReportTable";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.all_reports_page) || 1;
  const limit = Number(searchParams.all_reports_limit) || 20;
  const service = searchParams.service?.toString();
  const type = searchParams.type?.toString();

  const filterDropdowns = [
    {
      label: "Service Type",
      key: "service",
      options: [
        { value: "", label: "All" },
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
        { value: "", label: "All" },
        { value: "spam", label: "Spam" },
        { value: "nudity", label: "Nudity" },
        { value: "parody", label: "Parody" },
      ],
      defaultValue: "",
    },
  ];

  const [reportStats, reports] = await Promise.all([
    getReportStats(),
    getAllReports(page, limit, service, type),
  ]);

  console.log("reports:", reports?.data?.data[0]);

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

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <SmallCards overviewData={overviewData} />
        </div>
        <div className="col-span-12">
          <ReportTable
            reports={reports?.data || null}
            totalPages={reports?.data?.last_page || 1}
            currentPage={page}
            pageSize={limit}
            filterDropdowns={filterDropdowns}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
