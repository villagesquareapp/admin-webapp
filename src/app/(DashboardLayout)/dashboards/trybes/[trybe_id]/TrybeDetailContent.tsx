"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Modal, Tabs, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { formatDate } from "@/utils/dateUtils";
import { setTrybeStatus, updateTrybe, uploadTrybeImage } from "@/app/api/trybes";
import TrybeForm from "../TrybeForm";
import TrybePeople from "./TrybePeople";
import TrybeAnnouncement from "./TrybeAnnouncement";
import TrybeContent from "./TrybeContent";
import TrybeModeration from "./TrybeModeration";
import TrybeReports from "./TrybeReports";
import TrybeOverview from "./TrybeOverview";
import TrybeAudit from "./TrybeAudit";
import { TRYBE_TABS, TrybeTab } from "./trybeTabs";
import { Chip, TrybeAvatar } from "../trybeUi";

type StatusAction = "suspend" | "activate" | "archive" | "restore";

const STATUS_COPY: Record<StatusAction, { title: string; body: string; button: string; color: string }> = {
  suspend: {
    title: "Suspend this Trybe",
    body: "It disappears from the app and members can't open it until you reactivate it. Nothing is deleted.",
    button: "Suspend",
    color: "warning",
  },
  archive: {
    title: "Archive this Trybe",
    body: "It closes: hidden from the app, members lose access and no one can ask to join. Nothing is deleted; you can restore it from the archive later.",
    button: "Archive",
    color: "failure",
  },
  activate: {
    title: "Lift the suspension",
    body: "Members get access again and it shows in Explore.",
    button: "Reactivate",
    color: "primary",
  },
  restore: {
    title: "Restore from archive",
    body: "It opens again: back in Explore, members get access and people can ask to join.",
    button: "Restore",
    color: "primary",
  },
};

const ImagePicker = ({ trybe, kind }: { trybe: ITrybeDetail; kind: "avatar" | "cover" }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const current = trybe[kind];

  const clear = async () => {
    setBusy(true);
    try {
      const res = await updateTrybe(trybe.uuid, { [kind]: null });
      if (res?.status) toast.success(kind === "avatar" ? "Avatar removed" : "Cover removed");
      else toast.error(res?.message || "Couldn't remove it");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setBusy(true);
    try {
      const res = await uploadTrybeImage(trybe.uuid, kind, form);
      if (res?.status) toast.success(kind === "avatar" ? "Avatar updated" : "Cover updated");
      else toast.error(res?.message || "Upload failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{kind === "avatar" ? "Avatar" : "Cover"}</p>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt=""
          className={kind === "avatar" ? "size-24 rounded-full object-cover" : "h-24 w-full max-w-md rounded-xl object-cover"}
        />
      ) : (
        <div className={`${kind === "avatar" ? "size-24 rounded-full" : "h-24 w-full max-w-md rounded-xl"} border border-dashed border-border dark:border-darkborder grid place-items-center text-xs text-darklink`}>
          None yet
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <div className="flex gap-2">
        <Button size="xs" color="light" className="w-fit" onClick={() => input.current?.click()} isProcessing={busy} disabled={busy}>
          {current ? "Replace" : "Upload"}
        </Button>
        {current && (
          <Button size="xs" color="light" className="w-fit" onClick={clear} disabled={busy}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

const TrybeDetailContent = ({
  trybe,
  types,
  members,
  membersPages,
  page,
  limit,
  tab,
}: {
  trybe: ITrybeDetail | null;
  types: ITrybeType[];
  members: ITrybeMember[];
  membersPages: number;
  page: number;
  limit: number;
  tab: TrybeTab;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState<StatusAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!trybe) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:users-group-two-rounded-linear" height={40} className="mx-auto mb-3" />
          <p>Trybe not found.</p>
          <Link href="/dashboards/trybes/list" className="text-primary text-sm font-semibold mt-3 inline-block">
            ← Back to Trybes
          </Link>
        </div>
      </CardBox>
    );
  }

  const changeTab = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (index > 0) params.set("tab", TRYBE_TABS[index]);
    else params.delete("tab");
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const openTab = (name: string) => changeTab(Math.max(0, TRYBE_TABS.indexOf(name as TrybeTab)));

  const runAction = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const res = await setTrybeStatus(trybe.uuid, action, reason.trim() || undefined);
      if (res?.status) {
        toast.success(`${trybe.name}: ${STATUS_COPY[action].button.toLowerCase()}d`.replace("restored", "restored from the archive"));
        setAction(null);
        setReason("");
      } else toast.error(res?.message || "Couldn't change the status");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const copy = action ? STATUS_COPY[action] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TrybeAvatar src={trybe.avatar} name={trybe.name} size={56} />
          <div>
            <Link href="/dashboards/trybes/list" className="text-sm text-darklink">
              ← Trybes
            </Link>
            <h4 className="text-lg font-bold">{trybe.name}</h4>
            <p className="text-sm text-darklink flex flex-wrap items-center gap-2">
              {trybe.institution ? (
                <span>
                  <Link href={`/dashboards/trybes/institutions/${trybe.institution.uuid}`} className="text-primary">
                    {trybe.institution.short_name ?? trybe.institution.name}
                  </Link>{" "}
                  ·
                </span>
              ) : (
                trybe.subtitle && <span>{trybe.subtitle} ·</span>
              )}
              <span>{trybe.type?.name}</span> · <span>{Number(trybe.member_count).toLocaleString()} members</span>
              <Chip value={trybe.status} />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trybe.pending_requests > 0 && (
            <Button color="warning" onClick={() => router.push(`/dashboards/trybes/requests?trybe_id=${trybe.uuid}`)}>
              Review {trybe.pending_requests} {trybe.pending_requests === 1 ? "request" : "requests"}
            </Button>
          )}
          {trybe.status === "active" && (
            <Button color="light" onClick={() => setAction("suspend")}>
              Suspend
            </Button>
          )}
          {trybe.status === "suspended" && (
            <Button color="light" onClick={() => setAction("activate")}>
              Reactivate
            </Button>
          )}
          {trybe.status === "archived" ? (
            <Button color="primary" onClick={() => setAction("restore")}>
              Restore from archive
            </Button>
          ) : (
            <Button color="light" onClick={() => setAction("archive")}>
              Archive
            </Button>
          )}
        </div>
      </div>

      {trybe.type?.join_form === "campus" && !trybe.institution && (
        <div className="flex items-center gap-2 rounded-lg bg-lightwarning text-warning text-sm px-3 py-2">
          <Icon icon="solar:danger-triangle-line-duotone" height={18} />
          <span>
            No institution linked. Its join form uses the Trybe&apos;s own levels until you pick its institution under
            Profile.
          </span>
        </div>
      )}

      <Tabs aria-label="Trybe" variant="underline" onActiveTabChange={changeTab}>
        <Tabs.Item active={tab === "overview"} title="Overview" icon={() => <Icon icon="solar:chart-2-line-duotone" height={18} className="me-2" />}>
          {tab === "overview" && <TrybeOverview trybe={trybe} onTab={openTab} />}
        </Tabs.Item>
        <Tabs.Item active={tab === "profile"} title="Profile" icon={() => <Icon icon="solar:document-text-line-duotone" height={18} className="me-2" />}>
          <div className="grid grid-cols-12 gap-30">
            <div className="col-span-12 lg:col-span-4">
              <CardBox>
                <div className="flex flex-col gap-5">
                  <ImagePicker trybe={trybe} kind="avatar" />
                  <ImagePicker trybe={trybe} kind="cover" />
                  <p className="text-xs text-darklink">
                    Created {trybe.created_by_name ? `by ${trybe.created_by_name}` : ""} on{" "}
                    {formatDate(trybe.created_at)}
                  </p>
                </div>
              </CardBox>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <CardBox>
                <TrybeForm types={types} trybe={trybe} />
              </CardBox>
            </div>
          </div>
        </Tabs.Item>
        <Tabs.Item active={tab === "people"} title="Admins & members" icon={() => <Icon icon="solar:users-group-rounded-line-duotone" height={18} className="me-2" />}>
          <TrybePeople trybe={trybe} members={members} totalPages={membersPages} page={page} limit={limit} />
        </Tabs.Item>
        <Tabs.Item active={tab === "announcement"} title="Announcement" icon={() => <Icon icon="solar:speaker-minimalistic-line-duotone" height={18} className="me-2" />}>
          <TrybeAnnouncement trybe={trybe} />
        </Tabs.Item>
        <Tabs.Item active={tab === "posts"} title="Posts" icon={() => <Icon icon="solar:document-text-line-duotone" height={18} className="me-2" />}>
          {tab === "posts" && <TrybeModeration trybeId={trybe.uuid} kind="posts" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "videos"} title="Videos" icon={() => <Icon icon="solar:videocamera-record-line-duotone" height={18} className="me-2" />}>
          {tab === "videos" && <TrybeModeration trybeId={trybe.uuid} kind="videos" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "live"} title="Live" icon={() => <Icon icon="solar:microphone-3-line-duotone" height={18} className="me-2" />}>
          {tab === "live" && <TrybeModeration trybeId={trybe.uuid} kind="live" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "market"} title="Market" icon={() => <Icon icon="solar:shop-2-line-duotone" height={18} className="me-2" />}>
          {tab === "market" && <TrybeModeration trybeId={trybe.uuid} kind="products" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "events"} title="Events" icon={() => <Icon icon="solar:calendar-line-duotone" height={18} className="me-2" />}>
          {tab === "events" && <TrybeContent trybeId={trybe.uuid} kind="events" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "files"} title="Files" icon={() => <Icon icon="solar:folder-with-files-line-duotone" height={18} className="me-2" />}>
          {tab === "files" && <TrybeContent trybeId={trybe.uuid} kind="files" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "polls"} title={trybe.type?.poll_label || "Polls"} icon={() => <Icon icon="solar:chart-square-line-duotone" height={18} className="me-2" />}>
          {tab === "polls" && <TrybeContent trybeId={trybe.uuid} kind="polls" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "reports"} title="Reports" icon={() => <Icon icon="solar:danger-triangle-line-duotone" height={18} className="me-2" />}>
          {tab === "reports" && <TrybeReports trybeId={trybe.uuid} />}
        </Tabs.Item>
        <Tabs.Item active={tab === "audit"} title="Audit" icon={() => <Icon icon="solar:history-line-duotone" height={18} className="me-2" />}>
          {tab === "audit" && <TrybeAudit trybeId={trybe.uuid} />}
        </Tabs.Item>
      </Tabs>

      <Modal show={!!action} onClose={() => !busy && setAction(null)} size="md">
        <Modal.Header>{copy?.title}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <p className="text-sm">{copy?.body}</p>
            <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setAction(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color={copy?.color} onClick={runAction} isProcessing={busy} disabled={busy}>
            {copy?.button}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TrybeDetailContent;
