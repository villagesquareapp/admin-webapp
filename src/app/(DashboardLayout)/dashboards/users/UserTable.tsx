"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { getUserStatus } from "@/app/api/user";
import { POST_STATUS_TONE } from "@/utils/moderationLabels";
import UserActions from "./UserActions";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const UserTable = ({
  users,
  totalPages,
  currentPage,
  pageSize,
  tableTitle,
  backTo,
  filterDropdowns,
  extraButtons,
}: {
  users: IUser[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  tableTitle?: string;
  backTo?: string;
  filterDropdowns?: any;
  extraButtons?: React.ReactNode;
}) => {
  const router = useRouter();
  const [statuses, setStatuses] = useState<IUserStatusList[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setStatusLoading(true);
      try {
        const res = await getUserStatus();
        setStatuses(res?.data || []);
      } catch (e) {
        console.error("Failed to load user statuses:", e);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  const col = createColumnHelper<IUser>();
  const columns = [
    col.accessor("user_details.profile.name", {
      header: () => <span>User</span>,
      cell: (info) => {
        const p = info.row.original.user_details.profile;
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
              {p.profile_picture && <Image src={p.profile_picture} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[180px] flex items-center gap-1">
                {p.name || "Unknown"}
                {p.premium ? <Icon icon="solar:crown-star-bold" className="text-warning" height={13} /> : p.check_mark ? <Icon icon="solar:verified-check-bold" className="text-info" height={13} /> : null}
              </p>
              <p className="text-xs text-darklink truncate">@{p.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("user_details.profile.email", {
      header: () => <span>Email</span>,
      cell: (info) => <span className="text-sm text-darklink truncate block max-w-[200px]">{info.getValue() || "—"}</span>,
    }),
    col.accessor("user_details.profile.posts_count", {
      header: () => <span>Posts</span>,
      cell: (info) => <span className="text-sm tabular-nums">{fmt(info.getValue())}</span>,
    }),
    col.accessor("user_details.profile.followers", {
      header: () => <span>Followers</span>,
      cell: (info) => <span className="text-sm tabular-nums">{fmt(info.getValue())}</span>,
    }),
    col.accessor("user_details.profile.account_type", {
      header: () => <span>Type</span>,
      cell: (info) => <span className="text-sm text-darklink capitalize">{info.getValue() || "—"}</span>,
    }),
    col.accessor("user_details.profile.status", {
      header: () => <span>Status</span>,
      cell: (info) => (
        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${POST_STATUS_TONE[info.getValue()] || "bg-lightgray text-darklink dark:bg-dark"}`}>
          {info.getValue()?.replace(/_/g, " ")}
        </span>
      ),
    }),
    col.accessor("user_details.profile.created_at", {
      header: () => <span>Joined</span>,
      cell: (info) => <span className="text-sm text-darklink">{formatDate(info.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => <UserActions user={info.row.original} statuses={statuses} statusLoading={statusLoading} />,
    }),
  ];

  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={Array.isArray(users) ? users : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        tableTitle={tableTitle}
        backTo={backTo}
        filterDropdowns={filterDropdowns}
        extraButtons={extraButtons}
        onRowClick={(u: IUser) => router.push(`/dashboards/users/${u.user_details.profile.id}`)}
      />
    </div>
  );
};

export default UserTable;
