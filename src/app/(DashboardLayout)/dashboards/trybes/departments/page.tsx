import { Suspense } from "react";
import { getDepartmentFields, getDepartments, getUnmatchedDepartments } from "@/app/api/trybeCampus";
import DepartmentsContent from "./DepartmentsContent";

type Params = { [key: string]: string | string[] | undefined };

const Wrapper = async ({ searchParams }: { searchParams: Params }) => {
  const pick = (key: string) => (searchParams[key] as string) || undefined;
  const tab = searchParams.tab === "unmatched" ? "unmatched" : "list";
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const [departments, unmatched, fields] = await Promise.all([
    tab === "list"
      ? getDepartments(page, limit, { search: pick("search"), field: pick("field"), kind: pick("kind"), active: pick("active") })
      : null,
    // Always loaded: the tab shows how many are waiting.
    getUnmatchedDepartments(tab === "unmatched" ? page : 1, tab === "unmatched" ? limit : 1, {
      search: tab === "unmatched" ? pick("search") : undefined,
      trybe_id: pick("trybe_id"),
      institution_id: pick("institution_id"),
    }),
    getDepartmentFields(),
  ]);
  const shown = tab === "list" ? departments?.data : unmatched?.data;
  return (
    <DepartmentsContent
      tab={tab}
      departments={departments?.data?.data || []}
      unmatched={tab === "unmatched" ? unmatched?.data?.data || [] : []}
      unmatchedTotal={unmatched?.data?.total ?? 0}
      fields={(fields?.data || []).map((f) => f.field).filter((f): f is string => !!f)}
      total={shown?.total ?? 0}
      totalPages={shown?.last_page || 1}
      page={page}
      limit={limit}
    />
  );
};

const Page = async (props: { searchParams: Promise<Params> }) => {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Departments</h4>
        <p className="text-sm text-darklink">
          One list for every institution. Students type their department when they ask to join a Campus Trybe; an answer
          matching a name or another spelling (ignoring case, punctuation and spacing) is linked to it, and the rest wait
          under Unmatched until you add them.
        </p>
      </div>
      <Suspense
        key={JSON.stringify(searchParams)}
        fallback={<div className="h-[520px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <Wrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Page;
