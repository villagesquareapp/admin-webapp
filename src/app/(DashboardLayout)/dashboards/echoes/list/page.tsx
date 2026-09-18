import { Suspense } from "react";
import { getEchoes, getEchoCategories } from "@/app/api/echo";
import EchoTable from "../EchoTable";
import PostSearch from "../../posts/PostSearch";

const statusFilter = {
  label: "Status",
  key: "status",
  defaultValue: "",
  options: [
    { value: "", label: "All statuses" },
    { value: "live", label: "Live" },
    { value: "scheduled", label: "Scheduled" },
    { value: "ended", label: "Ended" },
    { value: "saved", label: "Saved" },
  ],
};

const Wrapper = async ({
  page,
  limit,
  status,
  category,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  category?: string;
  search?: string;
}) => {
  const [res, cats] = await Promise.all([
    getEchoes(page, limit, { status, category, search }),
    getEchoCategories(),
  ]);

  const categoryFilter = {
    label: "Category",
    key: "category",
    defaultValue: "",
    options: [
      { value: "", label: "All categories" },
      ...(cats?.data || []).map((c) => ({ value: String(c.id), label: c.name })),
    ],
  };

  return (
    <EchoTable
      echoes={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="All Echoes"
      backTo="/dashboards/echoes"
      filterDropdowns={[statusFilter, categoryFilter]}
      extraButtons={<PostSearch placeholder="Search echoes or host..." />}
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
  const category = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${status}-${category}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} category={category} search={search} />
    </Suspense>
  );
};

export default Page;
