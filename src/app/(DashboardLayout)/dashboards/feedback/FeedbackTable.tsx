"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@/utils/table";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { formatDate } from "@/utils/dateUtils";

const STATUS_TONE: Record<string, string> = {
  active: "bg-lightwarning text-warning",
  completed: "bg-lightsuccess text-success",
  abandoned: "bg-lightgray dark:bg-dark text-darklink",
};
const TYPE_TONE: Record<string, string> = {
  feedback: "bg-lightprimary text-primary",
  feature_request: "bg-lightsecondary text-secondary",
};
const TYPE_LABEL: Record<string, string> = {
  feedback: "Feedback",
  feature_request: "Feature request",
};

const FeedbackTable = ({
  sessions,
  totalPages,
  currentPage,
  pageSize,
  filterDropdowns,
}: {
  sessions: IFeedbackSession[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  filterDropdowns: any;
}) => {
  const router = useRouter();
  const col = createColumnHelper<IFeedbackSession>();

  const columns = [
    col.accessor("user", {
      header: () => <span>User</span>,
      cell: (info) => {
        const u = info.getValue();
        if (!u) return <span className="text-darklink text-sm">—</span>;
        return (
          <div className="flex items-center gap-3">
            {u.profile_picture && (
              <div className="relative size-9 rounded-full overflow-hidden shrink-0">
                <Image src={u.profile_picture} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[150px]">{u.name || "—"}</p>
              <p className="text-xs text-darklink truncate">@{u.username}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("type", {
      header: () => <span>Type</span>,
      cell: (info) => {
        const t = info.getValue();
        return t ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_TONE[t] || ""}`}>{TYPE_LABEL[t] || t}</span>
        ) : (
          <span className="text-darklink text-xs">Not set</span>
        );
      },
    }),
    col.accessor("summary", {
      header: () => <span>Summary</span>,
      cell: (info) => (
        <p className="text-sm text-darklink truncate max-w-[280px]">{info.getValue() || "—"}</p>
      ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => {
        const s = info.getValue() || "active";
        return (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_TONE[s] || ""}`}>{s}</span>
        );
      },
    }),
    col.accessor("message_count", {
      header: () => <span>Msgs</span>,
      cell: (info) => <span className="text-sm text-darklink">{info.getValue() ?? 0}</span>,
    }),
    col.display({
      id: "triage",
      header: () => <span>Triage</span>,
      cell: (info) => {
        const r = info.row.original.review;
        return (
          <div className="flex flex-wrap gap-1.5">
            {r?.reviewed_at && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lightsuccess text-success">Reviewed</span>
            )}
            {r?.converted_ticket_id && (
              <Link
                href={`/dashboards/tickets?ticket=${r.converted_ticket_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lightprimary text-primary hover:underline"
              >
                Ticket
              </Link>
            )}
            {!r?.reviewed_at && !r?.converted_ticket_id && <span className="text-darklink text-xs">—</span>}
          </div>
        );
      },
    }),
    col.accessor("created_at", {
      header: () => <span>Date</span>,
      cell: (info) => <span className="text-sm text-darklink">{formatDate(info.getValue())}</span>,
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <button
          onClick={() => router.push(`/dashboards/feedback/${info.row.original.uuid}`)}
          className="text-xs font-semibold bg-lightprimary text-primary px-2.5 py-1.5 rounded-md"
        >
          View
        </button>
      ),
    }),
  ];

  return (
    <ReusableTable
      tableData={Array.isArray(sessions) ? sessions : []}
      columns={columns}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
      filterDropdowns={filterDropdowns}
      tableTitle="Feedback & Feature Requests"
    />
  );
};

export default FeedbackTable;
