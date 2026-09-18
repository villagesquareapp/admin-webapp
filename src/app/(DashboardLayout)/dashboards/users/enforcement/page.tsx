import { Suspense } from "react";
import { getEnforcementLog } from "@/app/api/moderation";
import EnforcementTable from "../../posts/enforcement/EnforcementTable";

const actionFilter = {
  label: "Action",
  key: "action",
  defaultValue: "",
  options: [
    { value: "", label: "All actions" },
    { value: "warn_user", label: "Warn" },
    { value: "strike_user", label: "Strike" },
    { value: "restrict_user", label: "Restrict" },
    { value: "suspend_user", label: "Suspend" },
    { value: "ban_user", label: "Ban" },
    { value: "reinstate_user", label: "Reinstate" },
    { value: "force_logout", label: "Force logout" },
  ],
};

const Wrapper = async ({ page, limit, action }: { page: number; limit: number; action?: string }) => {
  const res = await getEnforcementLog(page, limit, { service_type: "user", action });
  return (
    <EnforcementTable
      rows={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="User Enforcement Log"
      backTo="/dashboards/users"
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
    <Suspense key={`${page}-${limit}-${action}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <Wrapper page={page} limit={limit} action={action} />
    </Suspense>
  );
};

export default Page;
