import { Suspense } from "react";
import { getEnforcementLog } from "@/app/api/moderation";
import EnforcementTable from "../../posts/enforcement/EnforcementTable";

const actionFilter = {
  label: "Action",
  key: "action",
  defaultValue: "",
  options: [
    { value: "", label: "All actions" },
    { value: "remove_content", label: "Take down" },
    { value: "restore_content", label: "Restore" },
    { value: "unfeature_content", label: "Unfeature" },
    { value: "warn_user", label: "Warn owner" },
    { value: "suspend_user", label: "Suspend owner" },
    { value: "ban_user", label: "Ban owner" },
  ],
};

const Wrapper = async ({ page, limit, action, target_id }: { page: number; limit: number; action?: string; target_id?: string }) => {
  const res = await getEnforcementLog(page, limit, { service_type: "marketplace", action, target_id });
  return (
    <EnforcementTable
      rows={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="Enforcement Log"
      backTo="/dashboards/markets"
      filterDropdowns={[actionFilter]}
    />
  );
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const action = searchParams.action as string | undefined;
  const target_id = searchParams.target_id as string | undefined;
  return (
    <Suspense key={`${page}-${limit}-${action}-${target_id}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper page={page} limit={limit} action={action} target_id={target_id} />
    </Suspense>
  );
};

export default Page;
