import { Suspense } from "react";
import { getMarketSquareProducts } from "@/app/api/market-square";
import ProductTable from "./ProductTable";

const ProductsWrapper = async ({
  page,
  limit,
  search,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const res = await getMarketSquareProducts(page, limit, { search, status });
  return (
    <ProductTable
      products={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search = (searchParams.search as string) || undefined;
  const status = (searchParams.status as string) || undefined;

  return (
    <Suspense key={`${page}-${limit}-${search}-${status}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <ProductsWrapper page={page} limit={limit} search={search} status={status} />
    </Suspense>
  );
};

export default Page;
