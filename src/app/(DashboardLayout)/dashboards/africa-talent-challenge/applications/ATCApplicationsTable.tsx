"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";
import { ATC_STATUS_TONE } from "../ATCOverviewContent";

const statusLabel = (s: string) => (s === "in_review" ? "Under review" : s.charAt(0).toUpperCase() + s.slice(1));

const statusFilter = {
  label: "Status",
  key: "status",
  defaultValue: "",
  options: [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "in_review", label: "Under review" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
  ],
};

const ATCApplicationsTable = ({
  applications, totalPages, currentPage, pageSize, periodFilter,
}: {
  applications: IATCApplication[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  periodFilter?: { label: string; key: string; defaultValue: string; options: { value: string; label: string }[] };
}) => {
  const router = useRouter();
  const col = createColumnHelper<IATCApplication>();

  const columns = [
    col.accessor("fullname", {
      header: () => <span>Contestant</span>,
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
              {a.profile_picture_url && <Image src={a.profile_picture_url} alt="" fill className="object-cover" unoptimized />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate max-w-[180px]">{a.fullname}</p>
              <p className="text-xs text-darklink truncate max-w-[180px]">{a.occupation}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("episode", {
      header: () => <span>Episode</span>,
      cell: (i) => <span className="text-sm truncate max-w-[130px] inline-block">{i.getValue()?.name || "—"}</span>,
    }),
    col.display({
      id: "engagement",
      header: () => <span>Engagement</span>,
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="flex items-center gap-3 text-xs text-darklink">
            <span className="flex items-center gap-1"><Icon icon="solar:like-bold" className="text-secondary" height={13} />{a.votes_count}</span>
            <span className="flex items-center gap-1"><Icon icon="solar:heart-bold" className="text-error" height={13} />{a.likes_count}</span>
            <span className="flex items-center gap-1"><Icon icon="solar:chat-round-line-bold" className="text-info" height={13} />{a.comments_count}</span>
          </div>
        );
      },
    }),
    col.accessor("application_type", {
      header: () => <span>Type</span>,
      cell: (i) => <span className="text-xs capitalize text-darklink">{i.getValue() || "solo"}</span>,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ATC_STATUS_TONE[i.getValue()] || ""}`}>{statusLabel(i.getValue())}</span>
      ),
    }),
    col.accessor("created_at", {
      header: () => <span>Applied</span>,
      cell: (i) => <span className="text-sm text-darklink">{formatDate(i.getValue())}</span>,
    }),
  ];

  return (
    <ReusableTable
      tableData={Array.isArray(applications) ? applications : []}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      dense
      compactTitle
      tableTitle="Applications"
      backTo="/dashboards/africa-talent-challenge"
      filterDropdowns={periodFilter ? [statusFilter, periodFilter] : [statusFilter]}
      onRowClick={(row: IATCApplication) => router.push(`/dashboards/africa-talent-challenge/applications/${row.uuid}`)}
    />
  );
};

export default ATCApplicationsTable;
