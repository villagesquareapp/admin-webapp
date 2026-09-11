import { Suspense } from "react";
import { getVflixVideos } from "@/app/api/vflix";
import VflixBreadcrumb from "../VflixBreadcrumb";
import VflixTable from "../VflixTable";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Featured" },
];

const FeaturedWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const res = await getVflixVideos(page, limit, { is_featured: "true" });
  return (
    <VflixTable
      videos={res?.data?.data || []}
      totalPages={res?.data?.totalPages || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="Featured Videos"
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
      <VflixBreadcrumb title="Featured Videos" items={BCrumb} backTo="/dashboards/vflix" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <FeaturedWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
