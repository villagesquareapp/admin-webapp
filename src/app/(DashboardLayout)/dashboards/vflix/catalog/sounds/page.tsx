import { Suspense } from "react";
import { getSounds } from "@/app/api/vflix-catalog";
import VflixBreadcrumb from "../../VflixBreadcrumb";
import SoundsView from "../SoundsView";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix/catalog", title: "Catalog" },
  { title: "Sounds" },
];

const Wrapper = async ({
  page,
  limit,
  category,
  search,
}: {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}) => {
  const res = await getSounds(page, limit, { category, search });
  return (
    <SoundsView
      sounds={res?.data?.data || []}
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
  const category = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <>
      <VflixBreadcrumb title="Sounds" items={BCrumb} backTo="/dashboards/vflix/catalog" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}-${category}-${search}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <Wrapper page={page} limit={limit} category={category} search={search} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
