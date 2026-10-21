import { Suspense } from "react";
import { getMeetings } from "@/app/api/meetings";
import MeetingsTable from "./MeetingsTable";

const Wrapper = async ({ filters, page, limit }: { filters: { status?: string; search?: string; host_id?: string }; page: number; limit: number }) => {
  const res = await getMeetings(page, limit, filters);
  return (
    <MeetingsTable
      rows={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const filters = {
    status: (searchParams.status as string) || undefined,
    search: (searchParams.search as string) || undefined,
    host_id: (searchParams.host_id as string) || undefined,
  };
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">All meetings</h4>
        <p className="text-sm text-darklink">Every meeting on VillageSquare Meet, live ones first.</p>
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
