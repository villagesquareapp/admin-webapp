"use client";

import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import PostActions from "../PostActions";
import PostTypeBadge from "../PostTypeBadge";
import { getPostStatus } from "@/app/api/post";
import { POST_STATUS_TONE } from "@/utils/moderationLabels";

const Strikes = ({ n }: { n: number }) => (
  <span className="flex gap-0.5" title={`${n} strike${n === 1 ? "" : "s"}`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-3.5 rounded-sm ${i < n ? "bg-error" : "bg-lightgray dark:bg-dark"}`}
      />
    ))}
  </span>
);

const PostQueueTable = ({
  rows,
  totalPages,
  currentPage,
  pageSize,
  tableTitle,
  backTo,
  filterDropdowns,
  extraButtons,
}: {
  rows: IPostQueueRow[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  tableTitle?: string;
  backTo?: string;
  filterDropdowns?: any;
  extraButtons?: React.ReactNode;
}) => {
  const router = useRouter();
  const [statuses, setStatuses] = useState<IPostStatusList[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setStatusLoading(true);
      try {
        const res = await getPostStatus();
        setStatuses(res?.data || []);
      } catch (e) {
        console.error("Failed to load post statuses:", e);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  const col = createColumnHelper<IPostQueueRow>();

  const columns = [
    col.accessor("caption", {
      header: () => <span>Post</span>,
      cell: (info) => {
        const p = info.row.original;
        return (
          <div className="flex gap-3 items-center min-w-0">
            <div className="relative w-9 h-12 rounded-md overflow-hidden bg-lightgray dark:bg-dark shrink-0">
              {p.media?.[0]?.thumbnail && (
                <Image src={p.media[0].thumbnail} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium truncate max-w-[200px]">{p.caption || "Untitled"}</p>
                <PostTypeBadge post={p} />
              </div>
              <p className="text-xs text-darklink font-mono truncate">{p.uuid.slice(0, 8)}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor("author_risk", {
      header: () => <span>Author</span>,
      cell: (info) => {
        const a = info.row.original.author_risk;
        const u = info.row.original.user;
        return (
          <div className="flex gap-2.5 items-center">
            <div className="relative size-8 rounded-full shrink-0 overflow-hidden">
              {u?.profile_picture && (
                <Image src={u.profile_picture} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[130px]">{u?.name || "Unknown"}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-darklink truncate">@{u?.username}</span>
                {a && a.strike_count > 0 && <Strikes n={a.strike_count} />}
              </div>
            </div>
          </div>
        );
      },
    }),
    col.accessor("top_reason", {
      header: () => <span>Top reason</span>,
      cell: (info) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightgray dark:bg-dark text-darklink">
          {info.getValue()}
        </span>
      ),
    }),
    col.accessor("priority", {
      header: () => <span>Priority</span>,
      cell: (info) => {
        const p = info.getValue() || 0;
        const w = Math.min(100, p * 8);
        return (
          <div className="flex items-center gap-2">
            <span className="w-10 h-1.5 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
              <span className="block h-full rounded-full bg-gradient-to-r from-warning to-error" style={{ width: `${w}%` }} />
            </span>
            <span className="font-bold tabular-nums text-sm">{p}</span>
          </div>
        );
      },
    }),
    col.accessor("report_count", {
      header: () => <span>Reports</span>,
      cell: (info) => <span className="font-bold tabular-nums text-error">{info.getValue()}</span>,
    }),
    col.accessor("last_reported", {
      header: () => <span>Last reported</span>,
      cell: (info) => (
        <span className="text-sm text-darklink">
          {info.getValue() ? formatDistanceToNow(new Date(info.getValue()), { addSuffix: true }) : "—"}
        </span>
      ),
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (info) => {
        const s = info.getValue();
        return (
          <span className={`text-xs px-2.5 py-1 capitalize rounded-full ${POST_STATUS_TONE[s] || "bg-lightgray text-darklink dark:bg-dark"}`}>
            {s?.replace(/_/g, " ")}
          </span>
        );
      },
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <PostActions post={info.row.original} statuses={statuses} statusLoading={statusLoading} />
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
        extraButtons={extraButtons}
        onRowClick={(p: IPostQueueRow) => router.push(`/dashboards/posts/${p.uuid}`)}
      />
    </div>
  );
};

export default PostQueueTable;
