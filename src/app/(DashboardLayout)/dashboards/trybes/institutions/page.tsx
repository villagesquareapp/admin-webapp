import { Suspense } from "react";
import { getInstitutions, getInstitutionsSummary } from "@/app/api/trybeCampus";
import InstitutionsTable from "./InstitutionsTable";

type Filters = {
  search?: string;
  kind?: string;
  ownership?: string;
  state?: string;
  linked?: string;
  active?: string;
  sort?: string;
};

const Wrapper = async ({ filters, page, limit }: { filters: Filters; page: number; limit: number }) => {
  const [res, summary] = await Promise.all([getInstitutions(page, limit, filters), getInstitutionsSummary()]);
  return (
    <InstitutionsTable
      rows={res?.data?.data || []}
      summary={summary?.data ?? null}
      total={res?.data?.total ?? 0}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const pick = (key: string) => (searchParams[key] as string) || undefined;
  const filters: Filters = {
    search: pick("search"),
    kind: pick("kind"),
    ownership: pick("ownership"),
    state: pick("state"),
    linked: pick("linked"),
    active: pick("active"),
    sort: pick("sort"),
  };
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Institutions</h4>
        <p className="text-sm text-darklink">
          Universities, polytechnics, colleges of education and other schools a Campus Trybe can belong to — one Trybe
          each. Seeded from the NUC, NBTE and NCCE lists.
        </p>
      </div>
      <Suspense
        key={JSON.stringify({ ...filters, page, limit })}
        fallback={<div className="h-[520px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <Wrapper filters={filters} page={page} limit={limit} />
      </Suspense>
    </div>
  );
};

export default Page;
