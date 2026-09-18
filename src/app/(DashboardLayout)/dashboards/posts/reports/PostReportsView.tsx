"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { formatDate } from "@/utils/dateUtils";
import { REPORT_STATUS_TONE } from "@/utils/moderationLabels";

const NEUTRAL = "bg-lightgray dark:bg-dark text-darklink";
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

const PostReportsView = ({
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
        return (
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[240px]">
              {r.reason_ref?.title || r.reason || "Other / unspecified"}
            </p>
            {r.reason && r.reason_ref?.title && (
              <p className="text-xs text-darklink truncate max-w-[240px]">{r.reason}</p>
            )}
          </div>
        );
      },
    }),
    col.accessor("reported_id", {
      header: () => <span>Reported post</span>,
      cell: (info) => (
        <span className="text-xs font-mono text-darklink">{info.getValue()?.slice(0, 8) || "—"}</span>
      ),
    }),
    col.accessor("reporter", {
      header: () => <span>Reporter</span>,
      cell: (info) => {
        const u = info.getValue();
        return u ? (
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[150px]">{u.name}</p>
            <p className="text-xs text-darklink truncate">@{u.username}</p>
          </div>
        ) : (
          <span className="text-darklink text-sm">—</span>
        );
      },
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${REPORT_STATUS_TONE[i.getValue() || ""] || NEUTRAL}`}>
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
                <button
                  onClick={() => setModal({ id: r.id, action: "resolve" })}
                  className="flex items-center gap-1 text-xs font-semibold bg-lightsuccess text-success px-2.5 py-1.5 rounded-md"
                >
                  <Icon icon="solar:check-circle-bold" height={15} /> Resolve
                </button>
                <button
                  onClick={() => setModal({ id: r.id, action: "dismiss" })}
                  className="text-xs font-semibold bg-lightgray dark:bg-dark text-darklink px-2.5 py-1.5 rounded-md"
                >
                  Dismiss
                </button>
              </>
            )}
            <Dropdown
              label=""
              inline
              renderTrigger={() => (
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <HiOutlineDotsVertical />
                </button>
              )}
            >
              {ACTIONABLE(r.status) ? (
                <>
                  <Dropdown.Item onClick={() => setModal({ id: r.id, action: "resolve" })}>Resolve</Dropdown.Item>
                  <Dropdown.Item onClick={() => setModal({ id: r.id, action: "dismiss" })}>Dismiss</Dropdown.Item>
                </>
              ) : (
                <Dropdown.Item disabled>No actions</Dropdown.Item>
              )}
            </Dropdown>
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
        tableTitle="Post Reports"
        backTo="/dashboards/posts"
        filterDropdowns={[statusFilter]}
      />
      <ResolveReportModal
        reportId={modal?.id ?? null}
        action={modal?.action ?? "resolve"}
        onClose={() => setModal(null)}
        onDone={() => router.refresh()}
      />
    </>
  );
};

export default PostReportsView;
