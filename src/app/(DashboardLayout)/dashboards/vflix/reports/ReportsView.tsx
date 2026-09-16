"use client";

import { useTransition } from "react";
import Image from "next/image";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { resolveVflixReport, dismissVflixReport } from "@/app/api/vflix";
import { formatDate } from "@/utils/dateUtils";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-lightwarning text-warning",
  in_review: "bg-lightinfo text-info",
  resolved: "bg-lightsuccess text-success",
  dismissed: "bg-lightgray dark:bg-dark text-darklink",
};
const NEUTRAL_BADGE = "bg-lightgray dark:bg-dark text-darklink";
const ACTIONABLE = (s: string) => s === "open" || s === "in_review";

const ReportsView = ({
  reports,
  totalPages,
  currentPage,
  pageSize,
}: {
  reports: IVflixReportRow[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [pending, startTransition] = useTransition();

  const resolve = (r: IVflixReportRow) =>
    startTransition(async () => {
      const res = await resolveVflixReport(r.id, "content_removed");
      if (res?.status) toast.success("Report resolved — content removed");
      else toast.error(res?.message || "Failed");
    });
  const dismiss = (r: IVflixReportRow) =>
    startTransition(async () => {
      const res = await dismissVflixReport(r.id, "No violation found");
      if (res?.status) toast.success("Report dismissed");
      else toast.error(res?.message || "Failed");
    });

  const col = createColumnHelper<IVflixReportRow>();
  const columns = [
    col.accessor("video", {
      header: () => <span>Reported video</span>,
      cell: (info) => {
        const v = info.getValue();
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-[52px] rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
              {v.thumbnail && <Image src={v.thumbnail} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate max-w-[220px]">{v.caption || "Untitled"}</p>
              <p className="text-xs text-darklink truncate">by @{info.row.original.reported_user.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("type", {
      header: () => <span>Type</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${NEUTRAL_BADGE}`}>
          {i.getValue() || "—"}
        </span>
      ),
    }),
    col.accessor("reason", {
      header: () => <span>Reason</span>,
      cell: (i) => <span className="text-sm text-darklink truncate block max-w-[220px]">{i.getValue()}</span>,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[i.getValue()] || NEUTRAL_BADGE}`}>
          {i.getValue().replace(/_/g, " ")}
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
          <div className="flex items-center justify-end gap-2">
            {ACTIONABLE(r.status) && (
              <>
                <button
                  onClick={() => resolve(r)}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs font-semibold bg-lightsuccess text-success px-2.5 py-1.5 rounded-md disabled:opacity-50"
                >
                  <Icon icon="solar:check-circle-bold" height={15} /> Resolve
                </button>
                <button
                  onClick={() => dismiss(r)}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs font-semibold bg-lightgray dark:bg-dark text-darklink px-2.5 py-1.5 rounded-md disabled:opacity-50"
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
              <Dropdown.Item onClick={() => toast.info("Open video — links to the video detail")}>View video</Dropdown.Item>
              {ACTIONABLE(r.status) && <Dropdown.Item onClick={() => resolve(r)}>Resolve (remove content)</Dropdown.Item>}
              {ACTIONABLE(r.status) && <Dropdown.Item onClick={() => dismiss(r)}>Dismiss</Dropdown.Item>}
            </Dropdown>
          </div>
        );
      },
    }),
  ];

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

  return (
    <ReusableTable
      tableData={reports}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      tableTitle="VFlix Reports"
      filterDropdowns={[statusFilter]}
    />
  );
};

export default ReportsView;
