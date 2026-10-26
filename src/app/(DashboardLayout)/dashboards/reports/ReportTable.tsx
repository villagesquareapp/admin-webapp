"use client";

import LoadingComponent from "@/app/components/shared/LoadingComponent";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { formatDate } from "@/utils/dateUtils";
import { createColumnHelper } from "@/utils/table";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-lightwarning text-warning",
  in_review: "bg-lightinfo text-info",
  resolved: "bg-lightsuccess text-success",
  dismissed: "bg-lightgray dark:bg-dark text-darklink",
};
const NEUTRAL_BADGE = "bg-lightgray dark:bg-dark text-darklink";
const ACTIONABLE = (s?: string) => s === "open" || s === "in_review";

// Where each kind of reported item opens in the dashboard.
const ITEM_PAGE: Record<string, string> = {
  user: "/dashboards/users/",
  post: "/dashboards/posts/",
  vflix: "/dashboards/vflix/videos/",
  echo: "/dashboards/echoes/",
  livestream: "/dashboards/livestreams/",
  marketsquare: "/dashboards/markets/products/",
  marketplace: "/dashboards/markets/products/",
  trybe: "/dashboards/trybes/",
  "africa-talent-challenge": "/dashboards/africa-talent-challenge/applications/",
};

const ReportTable = ({
  reports,
  totalPages,
  currentPage,
  pageSize,
  filterDropdowns,
}: {
  reports: IReportResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filterDropdowns: any;
}) => {
  const router = useRouter();
  const [modal, setModal] = useState<{ id: string; action: ReportAction } | null>(null);
  if (!reports) return <LoadingComponent />;
  const columnHelper = createColumnHelper<IReport>();

  const columns = [
    columnHelper.accessor("reason_ref", {
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="min-w-0">
            <p className="text-darklink dark:text-bodytext font-[500] text-sm truncate max-w-[240px]">
              {r.reason_ref?.title || r.reason || "--"}
            </p>
            {r.reason && r.reason_ref?.title && (
              <p className="text-xs text-darklink truncate max-w-[240px]">{r.reason}</p>
            )}
          </div>
        );
      },
      header: () => <span>Reason</span>,
    }),
    columnHelper.accessor("report_service_type", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm capitalize">{info.getValue() || "--"}</p>
      ),
      header: () => <span>Service</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const s = info.getValue() || "open";
        return (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[s] || NEUTRAL_BADGE}`}>
            {s.replace(/_/g, " ")}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),
    columnHelper.accessor("reported_id", {
      cell: (info) => {
        const r = info.row.original;
        const base = ITEM_PAGE[r.report_service_type];
        const label = `${r.report_service_type || "item"} ${r.reported_id?.slice(0, 8) || ""}`;
        if (!base || !r.reported_id) {
          return <p className="text-darklink dark:text-bodytext text-sm capitalize">{label}</p>;
        }
        return (
          <Link href={`${base}${r.reported_id}`} className="text-sm text-primary capitalize hover:underline">
            {label}
          </Link>
        );
      },
      header: () => <span>Reported</span>,
    }),
    columnHelper.accessor("reporter.uuid", {
      cell: (info) => {
        const rp = info.row.original.reporter;
        if (!rp) return <p className="text-darklink dark:text-bodytext text-sm">--</p>;
        return (
          <div className="flex gap-3 items-center">
            {rp.profile_picture && (
              <div className="relative size-12 rounded-full">
                <Image src={rp.profile_picture} alt="icon" fill className="rounded-full object-cover" />
              </div>
            )}
            <div className="truncat line-clamp-2 sm:max-w-56 flex flex-col">
              <p className="font-medium">{rp.name}</p>
              <p className="text-sm text-darklink dark:text-bodytext">@{rp.username}</p>
            </div>
          </div>
        );
      },
      header: () => <span>Reporter</span>,
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">{formatDate(info.getValue())}</p>
      ),
      header: () => <span>Date Reported</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const r = info.row.original;
        const view = (
          <button
            onClick={() => router.push(`/dashboards/reports/${r.id}`)}
            className="text-xs font-semibold bg-lightprimary text-primary px-2.5 py-1.5 rounded-md"
          >
            View
          </button>
        );
        if (!ACTIONABLE(r.status)) return view;
        return (
          <div className="flex items-center gap-2">
            {view}
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
          </div>
        );
      },
    }),
  ];
  return (
    <div className="col-span-12">
      <ReusableTable
        tableData={reports?.data && Array.isArray(reports?.data) ? reports?.data : []}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        filterDropdowns={filterDropdowns}
        tableTitle="All Reports"
      />
      <ResolveReportModal
        reportId={modal?.id ?? null}
        action={modal?.action ?? "resolve"}
        onClose={() => setModal(null)}
        onDone={() => router.refresh()}
      />
    </div>
  );
};

export default ReportTable;
