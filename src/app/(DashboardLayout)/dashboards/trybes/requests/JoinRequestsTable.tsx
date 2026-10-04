"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import ReusableTable from "@/app/components/shared/ReusableTable";
import PostSearch from "../../posts/PostSearch";
import { formatDate } from "@/utils/dateUtils";
import { Chip, Person } from "../trybeUi";

const statusFilter = {
  label: "Status",
  key: "status",
  options: [
    { value: "", label: "Waiting for review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
  ],
};

const JoinRequestsTable = ({
  rows,
  status,
  trybeName,
  totalPages,
  currentPage,
  pageSize,
}: {
  rows: ITrybeJoinRequest[];
  status: string;
  trybeName?: string;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const col = createColumnHelper<ITrybeJoinRequest>();

  const clearTrybe = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("trybe_id");
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const columns = [
    col.accessor((r) => r.user?.name, {
      id: "student",
      header: () => <span>Student</span>,
      cell: (info) => <Person user={info.row.original.user} />,
    }),
    col.accessor((r) => r.answers?.full_name, {
      id: "form",
      header: () => <span>Form</span>,
      cell: (info) => {
        const a = info.row.original.answers;
        return (
          <div className="text-sm min-w-0">
            <p className="font-medium truncate max-w-[220px]">{a?.full_name}</p>
            <p className="text-xs text-darklink truncate max-w-[220px]">
              {a?.matric_no} · {a?.department} · {a?.level}
            </p>
          </div>
        );
      },
    }),
    col.accessor((r) => r.trybe?.name, {
      id: "trybe",
      header: () => <span>Trybe</span>,
      cell: (info) => {
        const t = info.row.original.trybe;
        return (
          <div className="text-sm min-w-0">
            <p className="truncate max-w-[180px]">{t?.name}</p>
            <p className="text-xs text-darklink truncate max-w-[180px]">{t?.subtitle}</p>
          </div>
        );
      },
    }),
    col.accessor("created_at", {
      header: () => <span>Sent</span>,
      cell: (i) => (
        <span className="text-sm text-darklink" title={formatDate(i.getValue())}>
          {formatDistanceToNow(new Date(i.getValue()), { addSuffix: true })}
        </span>
      ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="text-xs text-darklink">
            <Chip value={r.status} />
            {r.reviewer?.name && <p className="mt-1">by {r.reviewer.name}</p>}
          </div>
        );
      },
    }),
  ];

  return (
    <div className="flex flex-col gap-3">
      {trybeName && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-darklink">Showing requests for</span>
          <span className="font-semibold">{trybeName}</span>
          <button onClick={clearTrybe} className="text-primary text-xs font-semibold">
            Show all Trybes
          </button>
        </div>
      )}
      <ReusableTable
        tableData={rows}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle={status === "pending" ? "Waiting for review" : `${status.charAt(0).toUpperCase()}${status.slice(1)} requests`}
        filterDropdowns={[statusFilter]}
        extraButtons={<PostSearch placeholder="Search name, username or matric no..." />}
        onRowClick={(row: ITrybeJoinRequest) => router.push(`/dashboards/trybes/requests/${row.uuid}`)}
      />
      {rows.length === 0 && status === "pending" && (
        <p className="text-sm text-darklink">
          Nothing waiting. <Link href="/dashboards/trybes/list" className="text-primary font-semibold">See all Trybes</Link>
        </p>
      )}
    </div>
  );
};

export default JoinRequestsTable;
