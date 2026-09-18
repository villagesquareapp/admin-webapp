"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import { actionIcon, actionLabel, actionTone } from "@/utils/moderationLabels";

const RESULT_TONE: Record<string, string> = {
  executed: "bg-lightsuccess text-success",
  failed: "bg-lighterror text-error",
  unsupported: "bg-lightgray text-darklink dark:bg-dark",
};

const EnforcementTable = ({
  rows,
  totalPages,
  currentPage,
  pageSize,
  tableTitle,
  backTo,
  filterDropdowns,
}: {
  rows: IEnforcementAction[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  tableTitle?: string;
  backTo?: string;
  filterDropdowns?: any;
}) => {
  const col = createColumnHelper<IEnforcementAction>();

  const columns = [
    col.accessor("action", {
      header: () => <span>Action</span>,
      cell: (info) => (
        <div className="flex items-center gap-2.5">
          <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${actionTone(info.getValue())}`}>
            <Icon icon={actionIcon(info.getValue())} height={16} />
          </span>
          <span className="font-medium">{actionLabel(info.getValue())}</span>
        </div>
      ),
    }),
    col.accessor("target_id", {
      header: () => <span>Target</span>,
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="text-xs font-mono">
            {a.target_id && <div className="truncate">{a.service_type || "content"} {a.target_id.slice(0, 8)}</div>}
            {a.target_user_id && <div className="text-darklink truncate">user {a.target_user_id.slice(0, 8)}</div>}
          </div>
        );
      },
    }),
    col.accessor("reason", {
      header: () => <span>Reason</span>,
      cell: (info) => (
        <span className="text-sm text-darklink line-clamp-2 max-w-[280px]">{info.getValue() || "—"}</span>
      ),
    }),
    col.accessor("result", {
      header: () => <span>Result</span>,
      cell: (info) => (
        <span className={`text-xs px-2.5 py-1 capitalize rounded-full ${RESULT_TONE[info.getValue()] || "bg-lightgray text-darklink dark:bg-dark"}`}>
          {info.getValue()}
        </span>
      ),
    }),
    col.accessor("created_at", {
      header: () => <span>When</span>,
      cell: (info) => (
        <span className="text-sm text-darklink">
          {info.getValue() ? formatDistanceToNow(new Date(info.getValue()), { addSuffix: true }) : "—"}
        </span>
      ),
    }),
  ];

  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={Array.isArray(rows) ? rows : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        tableTitle={tableTitle}
        backTo={backTo}
        filterDropdowns={filterDropdowns}
      />
    </div>
  );
};

export default EnforcementTable;
