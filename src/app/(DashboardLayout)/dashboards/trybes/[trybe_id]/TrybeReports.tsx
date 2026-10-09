"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Select, Spinner } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ResolveReportModal, { ReportAction } from "@/app/components/shared/ResolveReportModal";
import { formatDate } from "@/utils/dateUtils";
import { getTrybeReports } from "@/app/api/trybes";

const LIMIT = 20;

const ABOUT: Record<string, string> = {
  trybe: "This Trybe",
  post: "A post",
  vflix: "A video",
  echo: "An Echo",
  livestream: "A Livestream",
  marketsquare: "A product",
  marketplace: "A product",
  user: "A member",
  comment: "A comment",
};

const STATUS_COLOR: Record<string, string> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  dismissed: "gray",
};

// Reports about the Trybe and about content inside it, handled here or on
// the report's own page.
const TrybeReports = ({ trybeId }: { trybeId: string }) => {
  const [rows, setRows] = useState<IReport[] | null>(null);
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [open, setOpen] = useState<{ id: string; action: ReportAction } | null>(null);

  const load = useCallback(async () => {
    setRows(null);
    const res = await getTrybeReports(trybeId, page, LIMIT, status || undefined);
    if (res?.status) {
      setRows(res.data?.data ?? []);
      setLastPage(res.data?.last_page || 1);
    } else {
      setRows([]);
      toast.error(res?.message || "Couldn't load the reports");
    }
  }, [trybeId, page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CardBox>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          sizing="sm"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </Select>
        <p className="text-xs text-darklink">About this Trybe and about posts, videos, live sessions, products and people in it.</p>
      </div>

      {!rows ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-darklink py-6 text-center">No reports.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/dashboards/reports/${r.id}`} className="text-sm font-medium text-primary">
                    {ABOUT[r.report_service_type] ?? r.report_service_type}
                  </Link>
                  <Badge color={STATUS_COLOR[r.status ?? "open"] ?? "gray"}>{(r.status ?? "open").replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-sm mt-0.5">{r.reason_ref?.title ?? "Other"}{r.reason ? ` · "${r.reason}"` : ""}</p>
                <p className="text-xs text-darklink">
                  Reported by {r.reporter?.name || r.reporter?.username || "someone"} on {formatDate(r.created_at)}
                </p>
              </div>
              {(r.status === "open" || r.status === "in_review") && (
                <div className="flex gap-2">
                  <Button size="xs" color="primary" onClick={() => setOpen({ id: r.id, action: "resolve" })}>
                    Resolve
                  </Button>
                  <Button size="xs" color="light" onClick={() => setOpen({ id: r.id, action: "dismiss" })}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-sm">
          <Button size="xs" color="light" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="tabular-nums">
            {page} / {lastPage}
          </span>
          <Button size="xs" color="light" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      <ResolveReportModal
        reportId={open?.id ?? null}
        action={open?.action ?? "resolve"}
        onClose={() => setOpen(null)}
        onDone={() => {
          setOpen(null);
          load();
        }}
      />
    </CardBox>
  );
};

export default TrybeReports;
