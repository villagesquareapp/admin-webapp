import { Suspense } from "react";
import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
import { getVflixStats, getVflixVideos } from "@/app/api/vflix";
import VflixTable from "./VflixTable";
import VflixSearch from "./VflixSearch";
import shape1 from "/public/images/shapes/danger-card-shape.png";
import shape2 from "/public/images/shapes/secondary-card-shape.png";
import shape3 from "/public/images/shapes/success-card-shape.png";
import shape4 from "/public/images/shapes/circlr-shape.png";
import shape5 from "/public/images/shapes/circle-white-shape.png";

const VflixStatsWrapper = async () => {
  const stats = await getVflixStats();
  const data = stats?.data;
  const reported = (data?.by_status?.reported || 0) + (data?.by_status?.flagged || 0);

  const overviewData: IOverviewData[] = [
    {
      total: data?.total || 0,
      icon: "solar:videocamera-record-bold",
      bgcolor: "secondary",
      title: "Total Videos",
      shape: shape1,
      link: "",
    },
    {
      total: data?.by_status?.active || 0,
      icon: "solar:play-circle-bold",
      bgcolor: "success",
      title: "Active",
      shape: shape3,
      link: "",
    },
    {
      total: reported,
      icon: "solar:flag-bold",
      bgcolor: "warning",
      title: "Reported / Flagged",
      shape: shape2,
      link: "/dashboards/vflix/moderation",
    },
    {
      total: data?.featured || 0,
      icon: "solar:star-bold",
      bgcolor: "primary",
      title: "Featured",
      shape: shape4,
      link: "/dashboards/vflix/featured",
    },
    {
      total: data?.removed || 0,
      icon: "solar:trash-bin-trash-bold",
      bgcolor: "error",
      title: "Removed",
      shape: shape5,
      link: "",
    },
  ];

  return <SmallCards overviewData={overviewData} />;
};

const VflixTableWrapper = async ({
  page,
  limit,
  status,
  content_type,
  is_featured,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  content_type?: string;
  is_featured?: string;
  search?: string;
}) => {
  const res = await getVflixVideos(page, limit, { status, content_type, is_featured, search });

  const statusFilter = {
    label: "Status",
    key: "status",
    defaultValue: "",
    options: [
      { value: "", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "reported", label: "Reported" },
      { value: "flagged", label: "Flagged" },
      { value: "shadow_hidden", label: "Shadow hidden" },
      { value: "disabled", label: "Disabled" },
      { value: "banned", label: "Banned" },
      { value: "archived", label: "Archived" },
    ],
  };

  const typeFilter = {
    label: "Type",
    key: "content_type",
    defaultValue: "",
    options: [
      { value: "", label: "All types" },
      { value: "video", label: "Video" },
      { value: "carousel", label: "Carousel" },
    ],
  };

  return (
    <VflixTable
      videos={res?.data?.data || []}
      totalPages={res?.data?.totalPages || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="VFlix Videos"
      filterDropdowns={[statusFilter, typeFilter]}
      extraButtons={<VflixSearch />}
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
  const status = searchParams.status as string | undefined;
  const content_type = searchParams.content_type as string | undefined;
  const is_featured = searchParams.is_featured as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="col-span-12">
        <Suspense fallback={<div className="h-[150px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
          <VflixStatsWrapper />
        </Suspense>
      </div>
      <div className="col-span-12">
        <Suspense
          key={`${page}-${limit}-${status}-${content_type}-${is_featured}-${search}`}
          fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
        >
          <VflixTableWrapper
            page={page}
            limit={limit}
            status={status}
            content_type={content_type}
            is_featured={is_featured}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
