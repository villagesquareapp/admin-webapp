import { Suspense } from "react";
import { getTrybe, getTrybeMembers, getTrybeTypes } from "@/app/api/trybes";
import TrybeDetailContent from "./TrybeDetailContent";
import { TRYBE_TABS, TrybeTab } from "./trybeTabs";

type Params = { [key: string]: string | string[] | undefined };

const Wrapper = async ({ id, searchParams }: { id: string; searchParams: Params }) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const [trybe, types, members] = await Promise.all([
    getTrybe(id),
    getTrybeTypes(),
    getTrybeMembers(id, page, limit, {
      role: (searchParams.role as string) || undefined,
      status: (searchParams.status as string) || undefined,
      search: (searchParams.search as string) || undefined,
    }),
  ]);
  return (
    <TrybeDetailContent
      trybe={trybe?.data ?? null}
      types={types?.data || []}
      members={members?.data?.data || []}
      membersPages={members?.data?.last_page || 1}
      page={page}
      limit={limit}
      tab={TRYBE_TABS.includes(searchParams.tab as TrybeTab) ? (searchParams.tab as TrybeTab) : TRYBE_TABS[0]}
    />
  );
};

const Page = ({ params, searchParams }: { params: { trybe_id: string }; searchParams: Params }) => (
  <Suspense
    key={`${params.trybe_id}-${JSON.stringify(searchParams)}`}
    fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
  >
    <Wrapper id={params.trybe_id} searchParams={searchParams} />
  </Suspense>
);

export default Page;
