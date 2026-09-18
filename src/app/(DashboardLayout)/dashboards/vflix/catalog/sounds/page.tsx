import { Suspense } from "react";
import { getSounds } from "@/app/api/vflix-catalog";
import SoundsView from "../SoundsView";

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
    <Suspense
      key={`${page}-${limit}-${category}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} category={category} search={search} />
    </Suspense>
  );
};

export default Page;
