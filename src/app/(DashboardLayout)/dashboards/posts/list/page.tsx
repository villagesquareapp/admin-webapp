import { Suspense } from "react";
import { getPosts } from "@/app/api/post";
import PostTable from "../PostTable";
import PostSearch from "../PostSearch";

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
  label: "Media",
  key: "media_type",
  defaultValue: "",
  options: [
    { value: "", label: "All media" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
  ],
};

const Wrapper = async ({
  page,
  limit,
  status,
  media_type,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  media_type?: string;
  search?: string;
}) => {
  const posts = await getPosts(page, limit, { status, media_type, search });
  return (
    <PostTable
      posts={posts?.data || null}
      totalPages={posts?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="All Posts"
      backTo="/dashboards/posts"
      filterDropdowns={[statusFilter, typeFilter]}
      extraButtons={<PostSearch />}
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
  const media_type = searchParams.media_type as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${status}-${media_type}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} media_type={media_type} search={search} />
    </Suspense>
  );
};

export default Page;
