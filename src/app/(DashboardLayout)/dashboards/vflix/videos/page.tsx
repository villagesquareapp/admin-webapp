import { Suspense } from "react";
import { getVflixVideos } from "@/app/api/vflix";
import VflixTable from "../VflixTable";
import VflixSearch from "../VflixSearch";

const VideosWrapper = async ({
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
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="VFlix Videos"
      backTo="/dashboards/vflix"
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
    <Suspense
      key={`${page}-${limit}-${status}-${content_type}-${is_featured}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <VideosWrapper
        page={page}
        limit={limit}
        status={status}
        content_type={content_type}
        is_featured={is_featured}
        search={search}
      />
    </Suspense>
  );
};

export default Page;
