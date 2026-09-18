import { Suspense } from "react";
import { getUsers } from "@/app/api/user";
import UserTable from "../UserTable";
import PostSearch from "../../posts/PostSearch";

const statusFilter = {
  label: "Status",
  key: "status",
  defaultValue: "",
  options: [
    { value: "", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "flagged", label: "Flagged" },
    { value: "reported", label: "Reported" },
    { value: "suspended", label: "Suspended" },
    { value: "shadow_hidden", label: "Shadow hidden" },
    { value: "disabled", label: "Disabled" },
    { value: "banned", label: "Banned" },
    { value: "archived", label: "Archived" },
  ],
};

const typeFilter = {
  label: "Account",
  key: "account_type",
  defaultValue: "",
  options: [
    { value: "", label: "All accounts" },
    { value: "personal", label: "Personal" },
    { value: "business", label: "Business" },
    { value: "creator", label: "Creator" },
  ],
};

const Wrapper = async ({
  page,
  limit,
  status,
  account_type,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  account_type?: string;
  search?: string;
}) => {
  const res = await getUsers(page, limit, { status, account_type, search });
  return (
    <UserTable
      users={res?.data?.data || []}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      tableTitle="All Users"
      backTo="/dashboards/users"
      filterDropdowns={[statusFilter, typeFilter]}
      extraButtons={<PostSearch placeholder="Search name, username or email..." />}
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
  const status = searchParams.status as string | undefined;
  const account_type = searchParams.account_type as string | undefined;
  const search = searchParams.search as string | undefined;

  return (
    <Suspense
      key={`${page}-${limit}-${status}-${account_type}-${search}`}
      fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
    >
      <Wrapper page={page} limit={limit} status={status} account_type={account_type} search={search} />
    </Suspense>
  );
};

export default Page;
