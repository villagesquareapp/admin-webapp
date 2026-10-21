"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Select, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { getTrybeAudit } from "@/app/api/trybes";
import { dateTime } from "../trybeTime";

const LIMIT = 20;

const ICON: Record<TrybeAuditCategory, string> = {
  staff: "solar:shield-user-line-duotone",
  content: "solar:trash-bin-minimalistic-line-duotone",
  requests: "solar:user-check-rounded-line-duotone",
  people: "solar:user-block-rounded-line-duotone",
  photos: "solar:eye-line-duotone",
};

// What staff did to the Trybe itself, by moderation action.
const STAFF: Record<string, string> = {
  trybe_create: "created the Trybe",
  trybe_update: "edited the Trybe",
  trybe_link_institution: "linked its institution",
  trybe_unlink_institution: "unlinked its institution",
  trybe_suspended: "suspended the Trybe",
  trybe_active: "lifted the suspension",
  trybe_archived: "archived the Trybe",
  trybe_restored: "restored the Trybe from the archive",
  trybe_featured_set: "posted the announcement",
  trybe_featured_cleared: "removed the announcement",
  trybe_announcement_push: "pushed the announcement to members",
  trybe_broadcast: "messaged members",
  trybe_set_intro: "edited the About line of",
  trybe_remove_member: "removed",
  trybe_ban_member: "banned",
  trybe_unban_member: "lifted the ban on",
  trybe_event_cancel: "cancelled an event",
  trybe_event_restore: "restored an event",
  trybe_file_remove: "removed a file",
  trybe_file_restore: "restored a file",
  trybe_poll_remove: "removed a poll",
  trybe_poll_restore: "restored a poll",
  trybe_poll_close: "closed a poll early",
  remove_content: "took the Trybe down from a report",
  restore_content: "restored the Trybe after a report",
};

const CONTENT: Record<string, { name: string; href: (id: string) => string }> = {
  post: { name: "a post", href: (id) => `/dashboards/posts/${id}` },
  vflix: { name: "a video", href: (id) => `/dashboards/vflix/videos/${id}` },
  echo: { name: "an Echo", href: (id) => `/dashboards/echoes/${id}` },
  livestream: { name: "a Livestream", href: (id) => `/dashboards/livestreams/${id}` },
  marketsquare: { name: "a product", href: (id) => `/dashboards/markets/products/${id}` },
  marketplace: { name: "a product", href: (id) => `/dashboards/markets/products/${id}` },
};

const words = (s: string) => s.replace(/^trybe_/, "").replace(/_/g, " ");

const subjectName = (e: ITrybeAuditEntry) =>
  e.subject ? e.subject.name || (e.subject.username ? `@${e.subject.username}` : "someone") : "someone";

// The sentence after the actor's name.
const Sentence = ({ e }: { e: ITrybeAuditEntry }) => {
  const who = <span className="font-medium">{subjectName(e)}</span>;
  switch (e.category) {
    case "content": {
      const c = CONTENT[e.metadata?.service_type];
      const verb = e.action === "remove_content" ? "took down" : e.action === "restore_content" ? "restored" : words(e.action);
      return (
        <>
          {verb}{" "}
          {c && e.metadata?.target_id ? (
            <Link href={c.href(e.metadata.target_id)} className="text-primary">
              {c.name}
            </Link>
          ) : (
            "an item"
          )}
        </>
      );
    }
    case "requests":
      return (
        <>
          {e.action === "join_approved" ? "approved" : "rejected"} {who}&apos;s request to join
        </>
      );
    case "people":
      return <>{e.action === "member_banned" ? "banned" : "removed"} {who}</>;
    case "photos":
      return <>looked at {who}&apos;s ID photos</>;
    default:
      if (e.action === "trybe_transfer_owner") return <>made {who} the owner</>;
      if (e.action === "trybe_assign_role") return <>made {who} {e.metadata?.role ?? "a member"}</>;
      return (
        <>
          {STAFF[e.action] ?? words(e.action)}
          {e.subject && <> {who}</>}
        </>
      );
  }
};

// Extra lines kept with the action: what a push said, what was edited.
const Details = ({ e }: { e: ITrybeAuditEntry }) => {
  const m = e.metadata ?? {};
  const lines: string[] = [];
  if (e.action === "trybe_broadcast" || e.action === "trybe_announcement_push") {
    lines.push(`"${m.title ?? ""}${m.body ? ` — ${m.body}` : ""}" to ${m.recipients ?? 0} ${m.recipients === 1 ? "person" : "people"}`);
  } else if (e.action === "trybe_featured_set" && m.title) lines.push(`"${m.title}"`);
  else if (Array.isArray(m.fields) && m.fields.length) lines.push(`Changed: ${m.fields.map(words).join(", ")}`);
  if (m.question) lines.push(`"${m.question}"`);
  if (m.left_live_rooms) {
    lines.push(`${m.left_live_rooms} ${m.left_live_rooms === 1 ? "member was" : "members were"} taken out of its live rooms`);
  }
  if (e.reason) lines.push(`Reason: "${e.reason}"`);
  if (!lines.length) return null;
  return (
    <>
      {lines.map((l) => (
        <p key={l} className="text-xs text-darklink mt-0.5 break-words">
          {l}
        </p>
      ))}
    </>
  );
};

// Everything done to the Trybe: by staff here, and by its own admins in
// the app (join decisions, removals and bans, looks at ID photos).
const TrybeAudit = ({ trybeId }: { trybeId: string }) => {
  const [rows, setRows] = useState<ITrybeAuditEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [category, setCategory] = useState("");
  const [actor, setActor] = useState("");

  const load = useCallback(async () => {
    setRows(null);
    const res = await getTrybeAudit(trybeId, page, LIMIT, {
      category: category || undefined,
      actor: actor || undefined,
    });
    if (res?.status) {
      setRows(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      setLastPage(res.data?.last_page || 1);
    } else {
      setRows([]);
      toast.error(res?.message || "Couldn't load the audit log");
    }
  }, [trybeId, page, category, actor]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CardBox>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          sizing="sm"
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">Everything</option>
          <option value="staff">Changes to the Trybe</option>
          <option value="content">Content taken down or restored</option>
          <option value="requests">Join decisions</option>
          <option value="people">Members removed or banned in the app</option>
          <option value="photos">ID photos viewed</option>
        </Select>
        <Select
          sizing="sm"
          value={actor}
          onChange={(e) => {
            setPage(1);
            setActor(e.target.value);
          }}
        >
          <option value="">By anyone</option>
          <option value="staff">By staff</option>
          <option value="trybe_admin">By the Trybe&apos;s admins</option>
        </Select>
        <span className="text-sm text-darklink ms-auto">{total.toLocaleString()} entries</span>
      </div>

      {!rows ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-darklink py-6 text-center">Nothing yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
          {rows.map((e, i) => (
            <div key={`${e.at}-${e.action}-${i}`} className="flex items-start gap-3 py-3">
              <span className="size-8 rounded-md grid place-items-center bg-lightgray dark:bg-darkgray text-darklink shrink-0">
                <Icon icon={ICON[e.category]} height={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">
                    {e.actor.name || (e.actor.kind === "staff" ? "Staff" : "A Trybe admin")}
                  </span>{" "}
                  <Sentence e={e} />
                </p>
                <Details e={e} />
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge color={e.actor.kind === "staff" ? "info" : "gray"}>{e.actor.kind === "staff" ? "Staff" : "Trybe admin"}</Badge>
                <span className="text-[11px] text-darklink tabular-nums">{dateTime(e.at)}</span>
              </div>
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
    </CardBox>
  );
};

export default TrybeAudit;
