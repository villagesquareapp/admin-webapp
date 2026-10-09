"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Button, Checkbox, Modal, Textarea } from "flowbite-react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { decideJoinRequests } from "@/app/api/trybes";
import PostSearch from "../../posts/PostSearch";
import { formatDate } from "@/utils/dateUtils";
import { Chip, Person, REJECT_REASONS } from "../trybeUi";

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
  const [selected, setSelected] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = status === "pending";
  const onPage = rows.map((r) => r.uuid);
  const allOnPage = onPage.length > 0 && onPage.every((id) => selected.includes(id));
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const decide = async (action: "approve" | "reject") => {
    setBusy(true);
    try {
      const res = await decideJoinRequests(selected, action, action === "reject" ? reason.trim() : undefined);
      if (res?.status && res.data) {
        const { done, failed } = res.data;
        if (done.length) toast.success(`${action === "approve" ? "Approved" : "Rejected"} ${done.length}`);
        failed.forEach((f) => toast.error(f.message));
        setSelected([]);
        setRejecting(false);
        setReason("");
      } else toast.error(res?.message || "Couldn't decide these requests");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const clearTrybe = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("trybe_id");
    params.set("page", "1");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const columns = [
    ...(pending
      ? [
          col.display({
            id: "select",
            header: () => (
              <Checkbox
                checked={allOnPage}
                onChange={() => setSelected(allOnPage ? selected.filter((id) => !onPage.includes(id)) : Array.from(new Set([...selected, ...onPage])))}
                aria-label="Select all on this page"
              />
            ),
            cell: (info) => (
              <span onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.includes(info.row.original.uuid)} onChange={() => toggle(info.row.original.uuid)} aria-label="Select" />
              </span>
            ),
          }),
        ]
      : []),
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
            {info.row.original.matric_check === "mismatch" && (
              <p className="text-xs text-warning">
                Matric no doesn&apos;t look like {info.row.original.matric_example ? `"${info.row.original.matric_example}"` : "this school's"}
              </p>
            )}
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
      {pending && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-lightprimary px-3 py-2 text-sm">
          <span className="font-semibold">{selected.length} selected</span>
          <Button size="xs" color="primary" onClick={() => decide("approve")} isProcessing={busy} disabled={busy}>
            Approve {selected.length}
          </Button>
          <Button size="xs" color="failure" onClick={() => setRejecting(true)} disabled={busy}>
            Reject {selected.length}
          </Button>
          <button className="text-xs text-darklink" onClick={() => setSelected([])}>
            Clear
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
      <Modal show={rejecting} onClose={() => !busy && setRejecting(false)} size="md">
        <Modal.Header>
          Reject {selected.length} {selected.length === 1 ? "request" : "requests"}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-darklink">Every student sees this reason, so keep it general.</p>
            <div className="flex flex-col gap-1">
              {REJECT_REASONS.map((r) => (
                <button key={r} className="text-left text-sm text-primary" onClick={() => setReason(r)}>
                  {r}
                </button>
              ))}
            </div>
            <Textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason the students will see" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setRejecting(false)} disabled={busy}>
            Cancel
          </Button>
          <Button color="failure" onClick={() => decide("reject")} isProcessing={busy} disabled={busy || reason.trim().length < 3}>
            Reject {selected.length}
          </Button>
        </Modal.Footer>
      </Modal>
      {rows.length === 0 && status === "pending" && (
        <p className="text-sm text-darklink">
          Nothing waiting. <Link href="/dashboards/trybes/list" className="text-primary font-semibold">See all Trybes</Link>
        </p>
      )}
    </div>
  );
};

export default JoinRequestsTable;
