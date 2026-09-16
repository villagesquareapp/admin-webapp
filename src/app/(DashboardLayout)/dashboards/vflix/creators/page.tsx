import { Suspense } from "react";
import { getVflixCreators } from "@/app/api/vflix";
import VflixBreadcrumb from "../VflixBreadcrumb";
import CreatorsView from "./CreatorsView";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/dashboards/vflix", title: "VFlix" },
  { title: "Creators" },
];

const Wrapper = async ({
  page,
  limit,
  search,
  at_risk,
  sort,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  at_risk?: string;
  sort?: string;
  status?: string;
}) => {
  const res = await getVflixCreators(page, limit, {
    search,
    at_risk: at_risk === "true",
    sort,
    status,
  });
  return (
    <CreatorsView
      creators={res?.data?.data || []}
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
  const limit = Number(searchParams.limit) || 15;
  const search = searchParams.search as string | undefined;
  const at_risk = searchParams.at_risk as string | undefined;
  const sort = searchParams.sort as string | undefined;
  const status = searchParams.status as string | undefined;

  return (
    <>
      <VflixBreadcrumb title="VFlix Creators" items={BCrumb} backTo="/dashboards/vflix" />
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <Suspense
            key={`${page}-${limit}-${search}-${at_risk}-${sort}-${status}`}
            fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
          >
            <Wrapper page={page} limit={limit} search={search} at_risk={at_risk} sort={sort} status={status} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
