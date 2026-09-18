import { Suspense } from "react";
import { getPostQueue } from "@/app/api/post";
import PostQueueTable from "./PostQueueTable";
import PostSearch from "../PostSearch";

const reasonFilter = {
  label: "Reason",
  key: "reason",
  defaultValue: "",
  options: [
    { value: "", label: "All reasons" },
    { value: "Spam", label: "Spam" },
    { value: "Harassment", label: "Harassment" },
    { value: "Nudity", label: "Nudity / sexual" },
    { value: "Violence", label: "Violence" },
    { value: "Hate speech", label: "Hate speech" },
    { value: "Misinformation", label: "Misinformation" },
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
  reason,
  media_type,
  search,
}: {
  page: number;
  limit: number;
  reason?: string;
  media_type?: string;
  search?: string;
}) => {
  const res = await getPostQueue(page, limit, { reason, media_type, search });
  return (
    <PostQueueTable
      rows={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="Moderation Queue"
      backTo="/dashboards/posts"
      filterDropdowns={[reasonFilter, typeFilter]}
      extraButtons={<PostSearch placeholder="Search reported posts..." />}
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
  const reason = searchParams.reason as string | undefined;
  const media_type = searchParams.media_type as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${reason}-${media_type}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} reason={reason} media_type={media_type} search={search} />
    </Suspense>
  );
};

export default Page;
