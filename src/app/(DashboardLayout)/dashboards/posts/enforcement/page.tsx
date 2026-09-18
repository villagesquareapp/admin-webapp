import { Suspense } from "react";
import { getEnforcementLog } from "@/app/api/moderation";
import EnforcementTable from "./EnforcementTable";

const actionFilter = {
  label: "Action",
  key: "action",
  defaultValue: "",
  options: [
    { value: "", label: "All actions" },
    { value: "remove_content", label: "Take down" },
    { value: "restore_content", label: "Restore" },
    { value: "limit_visibility", label: "Limit reach" },
    { value: "warn_user", label: "Warn author" },
    { value: "strike_user", label: "Strike" },
    { value: "suspend_user", label: "Suspend author" },
    { value: "ban_user", label: "Ban author" },
  ],
};

const Wrapper = async ({ page, limit, action }: { page: number; limit: number; action?: string }) => {
  const res = await getEnforcementLog(page, limit, { service_type: "post", action });
  return (
    <EnforcementTable
      rows={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="Enforcement Log"
      backTo="/dashboards/posts"
      filterDropdowns={[actionFilter]}
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
  const action = searchParams.action as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${action}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} action={action} />
    </Suspense>
  );
};

export default Page;
