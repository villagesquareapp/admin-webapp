"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Label, Modal, Spinner, TextInput, Textarea } from "flowbite-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { getTrybeBroadcasts, getTrybeOverview, sendTrybeBroadcast } from "@/app/api/trybes";
import { KV, Person } from "../trybeUi";
import { dateTime } from "../trybeTime";

const count = (n: number | undefined, one: string, many: string) =>
  `${(n ?? 0).toLocaleString()} ${(n ?? 0) === 1 ? one : many}`;
const ago = (at: string | null) => (at ? formatDistanceToNow(parseISO(at), { addSuffix: true }) : "—");

// Content kinds, the tab that lists them and their label.
const CONTENT: { key: keyof ITrybeOverview["content"]; tab: string; label: string }[] = [
  { key: "posts", tab: "posts", label: "Posts and replies" },
  { key: "videos", tab: "videos", label: "Videos" },
  { key: "echoes", tab: "live", label: "Echoes" },
  { key: "livestreams", tab: "live", label: "Livestreams" },
  { key: "products", tab: "market", label: "Products" },
  { key: "events", tab: "events", label: "Events" },
  { key: "files", tab: "files", label: "Files" },
  { key: "polls", tab: "polls", label: "Polls" },
];

// Staff push to the members who have the Trybe's bell on, within the
// Trybe's push limits, with the recent pushes under it.
const MessageMembers = ({ trybe }: { trybe: ITrybeDetail }) => {
  const [info, setInfo] = useState<ITrybeBroadcasts | null>(null);
  const [title, setTitle] = useState(trybe.name.slice(0, 60));
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await getTrybeBroadcasts(trybe.uuid);
    if (res?.status && res.data) setInfo(res.data);
    else toast.error(res?.message || "Couldn't load the pushes");
  }, [trybe.uuid]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    setBusy(true);
    try {
      const res = await sendTrybeBroadcast(trybe.uuid, { title: title.trim(), body: body.trim() });
      if (res?.status) {
        toast.success(`Sent to ${count(res.data?.recipients, "member", "members")}`);
        setBody("");
        setConfirming(false);
      } else toast.error(res?.message || "Couldn't send it");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
      load();
    }
  };

  const active = trybe.status === "active";
  const canSend = active && !!info?.allowed && !!title.trim() && !!body.trim();

  return (
    <CardBox>
      <p className="text-sm font-semibold">Message members</p>
      <p className="text-xs text-darklink mt-1 mb-4">
        A push to members who have the Trybe&apos;s bell on. A Trybe gets at most {info?.per_hour ?? 1} an hour and{" "}
        {info?.per_day ?? 5} a day, announcement pushes included.
      </p>
      {!info ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="push-title" value="Title" />
            <TextInput id="push-title" sizing="sm" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="push-body" value="Message" />
            <Textarea id="push-body" rows={3} value={body} maxLength={300} onChange={(e) => setBody(e.target.value)} className="mt-1" />
            <p className="text-[11px] text-darklink text-right">{body.length}/300</p>
          </div>
          {!active ? (
            <p className="text-xs text-warning">Only an active Trybe can be messaged.</p>
          ) : !info.allowed ? (
            <p className="text-xs text-warning">
              {info.sent_last_day >= info.per_day ? `${info.per_day} pushes went out in the last 24 hours.` : "A push went out in the last hour."}
              {info.next_allowed_at ? ` The next one can go ${dateTime(info.next_allowed_at)}.` : ""}
            </p>
          ) : (
            <p className="text-xs text-darklink">
              {info.sent_last_day} of {info.per_day} sent in the last 24 hours.
            </p>
          )}
          <Button color="primary" size="sm" className="w-fit" disabled={!canSend || info.recipients === 0} onClick={() => setConfirming(true)}>
            Send to {count(info.recipients, "member", "members")}
          </Button>

          {info.sent.length > 0 && (
            <div className="mt-2 border-t border-border dark:border-darkborder pt-3">
              <p className="text-xs font-semibold text-darklink mb-2">Recent pushes</p>
              <div className="flex flex-col gap-3">
                {info.sent.map((s) => (
                  <div key={s.sent_at} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge color={s.kind === "message" ? "info" : "purple"}>{s.kind === "message" ? "Message" : "Announcement"}</Badge>
                      <span className="font-medium truncate">{s.title}</span>
                    </div>
                    {s.body && <p className="text-xs mt-0.5 line-clamp-2">{s.body}</p>}
                    <p className="text-[11px] text-darklink mt-0.5">
                      {s.sent_by || "Staff"} · {dateTime(s.sent_at)} · {count(s.recipients, "person", "people")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal show={confirming} onClose={() => !busy && setConfirming(false)} size="md" dismissible>
        <Modal.Header>Send this push?</Modal.Header>
        <Modal.Body>
          <div className="rounded-lg border border-border dark:border-darkborder p-3">
            <p className="text-sm font-semibold">{title.trim()}</p>
            <p className="text-sm mt-1 whitespace-pre-line">{body.trim()}</p>
          </div>
          <p className="text-sm mt-3">
            It goes to {count(info?.recipients, "member", "members")} of {trybe.name} now and can&apos;t be taken back.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setConfirming(false)} disabled={busy}>
            Back
          </Button>
          <Button color="primary" onClick={send} isProcessing={busy} disabled={busy}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </CardBox>
  );
};

// A Trybe's numbers: members, join requests, content, reports, its most
// active members, and messaging its members.
const TrybeOverview = ({ trybe, onTab }: { trybe: ITrybeDetail; onTab: (tab: string) => void }) => {
  const [data, setData] = useState<ITrybeOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getTrybeOverview(trybe.uuid).then((res) => {
      if (res?.status && res.data) setData(res.data);
      else {
        setFailed(true);
        toast.error(res?.message || "Couldn't load the overview");
      }
    });
  }, [trybe.uuid]);

  if (!data) {
    return (
      <div className="flex justify-center py-16 text-sm text-darklink">{failed ? "Couldn't load the overview." : <Spinner />}</div>
    );
  }

  const { members, requests } = data;
  const tiles = [
    { icon: "solar:users-group-rounded-line-duotone", value: members.active, label: "Members", tone: "bg-lightprimary text-primary" },
    { icon: "solar:user-plus-rounded-line-duotone", value: members.joined_7_days, label: "Joined this week", tone: "bg-lightsuccess text-success" },
    { icon: "solar:eye-line-duotone", value: members.visited_7_days, label: "Opened it this week", tone: "bg-lightinfo text-info" },
    { icon: "solar:bell-line-duotone", value: members.bell_on, label: "Bell on", tone: "bg-lightsecondary text-secondary" },
    { icon: "solar:user-check-rounded-line-duotone", value: requests.pending, label: "Waiting to join", tone: "bg-lightwarning text-warning" },
    { icon: "solar:danger-triangle-line-duotone", value: data.open_reports, label: "Open reports", tone: "bg-lighterror text-error" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <KpiCard key={t.label} {...t} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-5">
          <CardBox>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Content</p>
              <p className="text-xs text-darklink">Last post {ago(data.last_post_at)}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-darklink text-left">
                  <th className="py-1.5 font-medium">Kind</th>
                  <th className="py-1.5 font-medium text-right">Up now</th>
                  <th className="py-1.5 font-medium text-right">Last 7 days</th>
                </tr>
              </thead>
              <tbody>
                {CONTENT.map((c) => (
                  <tr key={c.key} className="border-t border-border dark:border-darkborder">
                    <td className="py-1.5">
                      <button type="button" className="text-primary" onClick={() => onTab(c.tab)}>
                        {c.key === "polls" ? trybe.type?.poll_label || c.label : c.label}
                      </button>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{data.content[c.key].total.toLocaleString()}</td>
                    <td className="py-1.5 text-right tabular-nums">{data.content[c.key].last_7_days.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CardBox>
              <p className="text-sm font-semibold mb-2">Members</p>
              <KV name="Joined in the last 30 days" value={members.joined_30_days.toLocaleString()} />
              <KV name="Left in the last 7 days" value={members.left_7_days.toLocaleString()} />
              <KV name="Left in the last 30 days" value={members.left_30_days.toLocaleString()} />
              <KV name="Banned" value={members.banned.toLocaleString()} />
              <KV name="Last joined" value={ago(members.last_joined_at)} />
            </CardBox>
            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Join requests</p>
                {requests.pending > 0 && (
                  <Link href={`/dashboards/trybes/requests?trybe_id=${trybe.uuid}`} className="text-xs text-primary">
                    Review
                  </Link>
                )}
              </div>
              <KV name="Waiting" value={requests.pending.toLocaleString()} />
              <KV name="Oldest waiting" value={requests.pending ? ago(requests.oldest_pending_at) : "—"} />
              <KV name="Approved in the last 30 days" value={requests.approved_30_days.toLocaleString()} />
              <KV name="Rejected in the last 30 days" value={requests.rejected_30_days.toLocaleString()} />
              <KV
                name="Typical time to a decision"
                value={requests.median_review_hours === null ? "—" : `${requests.median_review_hours} h`}
              />
            </CardBox>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <MessageMembers trybe={trybe} />
          <CardBox>
            <p className="text-sm font-semibold">Most active members</p>
            <p className="text-xs text-darklink mb-3">By posts in the last 30 days.</p>
            {data.most_active_members.length === 0 ? (
              <p className="text-sm text-darklink">No posts in the last 30 days.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.most_active_members.map((m) => (
                  <div key={m.user.uuid} className="flex items-center justify-between gap-3">
                    <Person user={m.user} />
                    <span className="text-sm tabular-nums text-darklink">{count(m.posts, "post", "posts")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default TrybeOverview;
