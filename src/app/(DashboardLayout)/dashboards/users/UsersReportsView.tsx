"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { formatDate } from "@/utils/dateUtils";
import { REPORT_STATUS_TONE } from "@/utils/moderationLabels";

const ACTIONABLE = (s?: string) => s === "open" || s === "in_review";

const statusFilter = {
  label: "Status",
  key: "status",
  defaultValue: "",
  options: [
    { value: "", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "in_review", label: "In review" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ],
};

const UsersReportsView = ({
  reports,
  totalPages,
  currentPage,
  pageSize,
}: {
  reports: IReport[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const [modal, setModal] = useState<{ id: string; action: ReportAction } | null>(null);

  const col = createColumnHelper<IReport>();
  const columns = [
    col.accessor("reason_ref", {
      header: () => <span>Reason</span>,
      cell: (info) => {
        const r = info.row.original;
        return <p className="font-medium truncate max-w-[240px]">{r.reason_ref?.title || r.reason || "Other / unspecified"}</p>;
      },
    }),
    col.accessor("reported_id", {
      header: () => <span>Reported user</span>,
      cell: (info) =>
        info.getValue() ? (
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/dashboards/users/${info.getValue()}`); }}
            className="text-xs font-mono text-primary hover:underline"
          >
            {info.getValue()!.slice(0, 8)}
          </button>
        ) : <span className="text-darklink text-sm">—</span>,
    }),
    col.accessor("reporter", {
      header: () => <span>Reporter</span>,
      cell: (info) => {
        const u = info.getValue();
        return u ? <span className="text-sm">@{u.username}</span> : <span className="text-darklink text-sm">—</span>;
      },
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${REPORT_STATUS_TONE[i.getValue() || ""] || "bg-lightgray text-darklink dark:bg-dark"}`}>
          {(i.getValue() || "open").replace(/_/g, " ")}
        </span>
      ),
    }),
    col.accessor("created_at", {
      header: () => <span>Reported</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {ACTIONABLE(r.status) && (
              <>
                <button onClick={() => setModal({ id: r.id, action: "resolve" })} className="flex items-center gap-1 text-xs font-semibold bg-lightsuccess text-success px-2.5 py-1.5 rounded-md">
                  <Icon icon="solar:check-circle-bold" height={15} /> Resolve
                </button>
                <button onClick={() => setModal({ id: r.id, action: "dismiss" })} className="text-xs font-semibold bg-lightgray dark:bg-dark text-darklink px-2.5 py-1.5 rounded-md">Dismiss</button>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={Array.isArray(reports) ? reports : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        tableTitle="User Reports"
        backTo="/dashboards/users"
        filterDropdowns={[statusFilter]}
      />
      <ResolveReportModal reportId={modal?.id ?? null} action={modal?.action ?? "resolve"} onClose={() => setModal(null)} onDone={() => router.refresh()} />
    </>
  );
};

export default UsersReportsView;
