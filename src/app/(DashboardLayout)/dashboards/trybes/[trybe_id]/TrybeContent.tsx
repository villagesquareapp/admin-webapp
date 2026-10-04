"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Modal, Select, Spinner, TextInput, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { getTrybeEvents, getTrybeFiles, getTrybePolls, takeDownTrybeContent } from "@/app/api/trybes";

type Kind = "events" | "files" | "polls";
type Row = ITrybeEvent | ITrybeFile | ITrybePoll;

const LIMIT = 10;

const COPY: Record<Kind, { empty: string; action: string; confirm: string; done: string }> = {
  events: {
    empty: "No events.",
    action: "Cancel event",
    confirm: "The event stays, marked cancelled, and leaves the Trybe's Active list. An Echo scheduled for it is cancelled too.",
    done: "Event cancelled",
  },
  files: {
    empty: "No files.",
    action: "Remove file",
    confirm: "The file disappears from the Trybe's Files tab and its stored copy is deleted.",
    done: "File removed",
  },
  polls: {
    empty: "No polls.",
    action: "Remove poll",
    confirm: "The poll and its results disappear from the Trybe.",
    done: "Poll removed",
  },
};

const who = (p: ITrybePersonRef | null) => (p?.uuid ? p.name || p.username || "Unknown" : "Unknown");
const when = (value: string) => new Date(value).toLocaleString();
const size = (bytes: ITrybeFile["size_bytes"]) => {
  const n = Number(bytes);
  if (!n) return "";
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};

const EventRow = ({ e }: { e: ITrybeEvent }) => (
  <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-medium">{e.title}</p>
      <Badge color={e.state === "cancelled" ? "failure" : e.state === "live" ? "success" : e.state === "ended" ? "gray" : "info"}>
        {e.state}
      </Badge>
      <span className="text-xs text-darklink">
        {e.event_type === "online" ? `Online · ${e.online_platform}` : [e.venue, e.city].filter(Boolean).join(", ") || "In person"}
      </span>
    </div>
    <p className="text-xs text-darklink">
      {when(e.starts_at)} – {when(e.ends_at)} ({e.timezone}) · host {e.host_name} · {e.going_count} going · by {who(e.created_by)}
    </p>
    {e.description && <p className="text-xs mt-1 truncate max-w-xl">{e.description}</p>}
  </div>
);

const FileRow = ({ f }: { f: ITrybeFile }) => {
  const href = f.kind === "link" ? f.link_url : f.url;
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary truncate max-w-md">
            {f.name}
          </a>
        ) : (
          <p className="text-sm font-medium">{f.name}</p>
        )}
        <Badge color="gray">{f.kind}</Badge>
        <span className="text-xs text-darklink">{size(f.size_bytes)}</span>
      </div>
      <p className="text-xs text-darklink">
        Added {when(f.created_at)} by {who(f.uploaded_by)}
      </p>
    </div>
  );
};

const PollRow = ({ p }: { p: ITrybePoll }) => (
  <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-medium">{p.question}</p>
      <Badge color={p.is_open ? "success" : "gray"}>{p.is_open ? "Open" : "Closed"}</Badge>
    </div>
    <div className="mt-2 flex flex-col gap-1 max-w-md">
      {p.options.map((o) => {
        const pct = p.total_votes ? Math.round((o.votes / p.total_votes) * 100) : 0;
        return (
          <div key={o.index} className="text-xs">
            <div className="flex justify-between">
              <span>{o.text}</span>
              <span className="tabular-nums">
                {o.votes} · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded bg-lightgray dark:bg-darkgray">
              <div className="h-1.5 rounded bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
    <p className="text-xs text-darklink mt-2">
      {p.total_votes} votes · closes {when(p.closes_at)} · by {who(p.created_by)}
    </p>
  </div>
);

// A Trybe's events, files or polls, with staff take-down (audited).
const TrybeContent = ({ trybeId, kind }: { trybeId: string; kind: Kind }) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [target, setTarget] = useState<Row | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = COPY[kind];

  const load = useCallback(async () => {
    setRows(null);
    const res =
      kind === "events"
        ? await getTrybeEvents(trybeId, page, LIMIT, { status: filter || undefined, search: search || undefined })
        : kind === "files"
          ? await getTrybeFiles(trybeId, page, LIMIT, { kind: filter || undefined, search: search || undefined })
          : await getTrybePolls(trybeId, page, LIMIT);
    if (res?.status) {
      setRows((res.data?.data as Row[]) ?? []);
      setLastPage(res.data?.last_page || 1);
    } else {
      setRows([]);
      toast.error(res?.message || "Couldn't load the list");
    }
  }, [trybeId, kind, page, filter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const takeDown = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const res = await takeDownTrybeContent(trybeId, kind, target.uuid, reason.trim() || undefined);
      if (res?.status) {
        toast.success(copy.done);
        setTarget(null);
        setReason("");
        await load();
      } else toast.error(res?.message || "Couldn't do that");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const canTakeDown = (row: Row) => kind !== "events" || (row as ITrybeEvent).status === "active";

  return (
    <CardBox>
      {kind !== "polls" && (
        <form
          className="flex flex-wrap gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            setPage(1);
            setSearch(String(value ?? "").trim());
          }}
        >
          <TextInput name="q" placeholder={kind === "events" ? "Search titles" : "Search names"} sizing="sm" defaultValue={search} />
          <Select
            sizing="sm"
            value={filter}
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value);
            }}
          >
            {kind === "events" ? (
              <>
                <option value="">All events</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="">All kinds</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="link">Links</option>
              </>
            )}
          </Select>
          <Button size="sm" color="light" type="submit">
            Search
          </Button>
        </form>
      )}

      {!rows ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-darklink py-6 text-center">{copy.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
          {rows.map((row) => (
            <div key={row.uuid} className="flex items-start justify-between gap-4 py-3">
              {kind === "events" ? (
                <EventRow e={row as ITrybeEvent} />
              ) : kind === "files" ? (
                <FileRow f={row as ITrybeFile} />
              ) : (
                <PollRow p={row as ITrybePoll} />
              )}
              {canTakeDown(row) && (
                <Button size="xs" color="light" onClick={() => setTarget(row)}>
                  <Icon icon="solar:trash-bin-minimalistic-linear" height={16} className="me-1" />
                  {copy.action}
                </Button>
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

      <Modal show={!!target} onClose={() => !busy && setTarget(null)} size="md">
        <Modal.Header>{copy.action}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <p className="text-sm">{copy.confirm}</p>
            <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setTarget(null)} disabled={busy}>
            Back
          </Button>
          <Button color="failure" onClick={takeDown} isProcessing={busy} disabled={busy}>
            {copy.action}
          </Button>
        </Modal.Footer>
      </Modal>
    </CardBox>
  );
};

export default TrybeContent;
