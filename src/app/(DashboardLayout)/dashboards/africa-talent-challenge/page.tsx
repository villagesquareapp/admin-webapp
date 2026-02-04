import { getATCStats, getATCApplications } from "@/app/api/atc";
import StatsWithMonthsFilter from "./StatsWithMonthsFilter";
import SearchAndFilter from "./SearchAndFilter";
import ATCTable from "./ATCTable";
import { Suspense } from "react";
import TableLoader from "./TableLoader";

const ATCTableWrapper = async ({
  period,
  status,
  search,
  page,
  limit,
}: {
  period: string;
  status: string;
  search: string;
  page: number;
  limit: number;
}) => {
  const applications = await getATCApplications(period, status, search, page, limit);

  return (
    <ATCTable
      applications={applications?.data || null}
      totalPages={applications?.data?.last_page || 1}
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
  const limit = Number(searchParams.limit) || 20;
  const search = searchParams.search as string;
  const status = searchParams.status as string;
  const period = searchParams.period as string;

  const atcStats = await getATCStats();

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <StatsWithMonthsFilter initialStats={atcStats} />
        </div>

        <div className="col-span-12">
          <SearchAndFilter period={period} />
          <Suspense key={`${period}-${status}-${search}-${page}-${limit}`} fallback={<TableLoader />}>
            <ATCTableWrapper
              period={period}
              status={status}
              search={search}
              page={page}
              limit={limit}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;
