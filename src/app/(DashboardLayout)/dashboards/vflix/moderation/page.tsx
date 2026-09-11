import { Suspense } from "react";
import { getVflixModerationQueue } from "@/app/api/vflix";
import VflixBreadcrumb from "../VflixBreadcrumb";
import VflixTable from "../VflixTable";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Moderation Queue" },
];

const ModerationWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const res = await getVflixModerationQueue(page, limit);
  return (
    <VflixTable
      videos={res?.data?.data || []}
      totalPages={res?.data?.totalPages || 1}
      currentPage={page}
      pageSize={limit}
      showReportCount
      tableTitle="Moderation Queue"
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

  return (
    <>
      <VflixBreadcrumb title="Moderation Queue" items={BCrumb} backTo="/dashboards/vflix" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <ModerationWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
