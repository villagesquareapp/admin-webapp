import { Suspense } from "react";
import { getTemplates } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import TemplatesView from "../TemplatesView";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Templates" },
];

const Wrapper = async ({ page, limit, status }: { page: number; limit: number; status?: string }) => {
  const res = await getTemplates(page, limit, { status });
  return (
    <TemplatesView
      templates={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const status = searchParams.status as string | undefined;

  return (
    <>
      <VflixBreadcrumb title="Templates" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}-${status}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <Wrapper page={page} limit={limit} status={status} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
