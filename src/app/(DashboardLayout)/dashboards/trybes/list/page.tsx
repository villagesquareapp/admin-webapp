import { Suspense } from "react";
import { getTrybeTypes, getTrybes } from "@/app/api/trybes";
import TrybesTable from "./TrybesTable";

const Wrapper = async ({
  filters,
  page,
  limit,
}: {
  filters: { status?: string; type_id?: string; search?: string };
  page: number;
  limit: number;
}) => {
  const [res, types] = await Promise.all([getTrybes(page, limit, filters), getTrybeTypes()]);
  return (
    <TrybesTable
      rows={res?.data?.data || []}
      types={types?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const filters = {
    status: (searchParams.status as string) || undefined,
    type_id: (searchParams.type_id as string) || undefined,
    search: (searchParams.search as string) || undefined,
  };
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Trybes</h4>
        <p className="text-sm text-darklink">
          Private spaces inside VillageSquare. Create them here, set their admins, and review who joins.
        </p>
      </div>
      <Suspense
        key={JSON.stringify({ ...filters, page, limit })}
        fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <Wrapper filters={filters} page={page} limit={limit} />
      </Suspense>
    </div>
  );
};

export default Page;
