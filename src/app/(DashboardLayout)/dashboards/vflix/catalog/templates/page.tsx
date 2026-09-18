import { Suspense } from "react";
import { getTemplates } from "@/app/api/vflix-catalog";
import TemplatesView from "../TemplatesView";

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
    <Suspense
      key={`${page}-${limit}-${status}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} />
    </Suspense>
  );
};

export default Page;
