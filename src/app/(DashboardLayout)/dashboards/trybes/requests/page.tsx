import { Suspense } from "react";
import { getJoinRequests, getTrybe } from "@/app/api/trybes";
import JoinRequestsTable from "./JoinRequestsTable";

const STATUSES = ["pending", "approved", "rejected", "withdrawn"];

const Wrapper = async ({
  status,
  trybeId,
  search,
  page,
  limit,
}: {
  status: string;
  trybeId?: string;
  search?: string;
  page: number;
  limit: number;
}) => {
  const [res, trybe] = await Promise.all([
    getJoinRequests(page, limit, { status, trybe_id: trybeId, search }),
    trybeId ? getTrybe(trybeId) : Promise.resolve(null),
  ]);
  return (
    <JoinRequestsTable
      rows={res?.data?.data || []}
      status={status}
      trybeName={trybe?.data?.name}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const raw = searchParams.status as string;
  const status = STATUSES.includes(raw) ? raw : "pending";
  const trybeId = (searchParams.trybe_id as string) || undefined;
  const search = (searchParams.search as string) || undefined;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Trybe join requests</h4>
        <p className="text-sm text-darklink">
          Students asking to join a Campus Trybe. Check their form against their student ID and selfie, then approve
          or reject with a reason they will see.
        </p>
      </div>
      <Suspense
        key={`${status}-${trybeId}-${search}-${page}-${limit}`}
        fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <Wrapper status={status} trybeId={trybeId} search={search} page={page} limit={limit} />
      </Suspense>
    </div>
  );
};

export default Page;
