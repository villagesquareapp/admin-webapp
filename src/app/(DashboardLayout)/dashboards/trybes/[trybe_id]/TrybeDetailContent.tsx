"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Modal, Tabs, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { setTrybeStatus, uploadTrybeImage } from "@/app/api/trybes";
import TrybeForm from "../TrybeForm";
import TrybePeople from "./TrybePeople";
import TrybeAnnouncement from "./TrybeAnnouncement";
import TrybeContent from "./TrybeContent";
import { TRYBE_TABS, TrybeTab } from "./trybeTabs";
import { Chip, TrybeAvatar } from "../trybeUi";

type StatusAction = "suspend" | "activate" | "archive";

const STATUS_COPY: Record<StatusAction, { title: string; body: string; button: string; color: string }> = {
  suspend: {
    title: "Suspend this Trybe",
    body: "It disappears from the app and members can't open it until you reactivate it. Nothing is deleted.",
    button: "Suspend",
    color: "warning",
  },
  archive: {
    title: "Archive this Trybe",
    body: "It is closed for good: hidden from the app, no new members. Its content is kept for records.",
    button: "Archive",
    color: "failure",
  },
  activate: {
    title: "Reactivate this Trybe",
    body: "Members get access again and it shows in Explore.",
    button: "Reactivate",
    color: "primary",
  },
};

const ImagePicker = ({ trybe, kind }: { trybe: ITrybeDetail; kind: "avatar" | "cover" }) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const current = trybe[kind];

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
      <Button size="xs" color="light" className="w-fit" onClick={() => input.current?.click()} isProcessing={busy} disabled={busy}>
        {current ? "Replace" : "Upload"}
      </Button>
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

  const runAction = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const res = await setTrybeStatus(trybe.uuid, action, reason.trim() || undefined);
      if (res?.status) {
        toast.success(`${trybe.name}: ${STATUS_COPY[action].button.toLowerCase()}d`);
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
              {trybe.subtitle && <span>{trybe.subtitle} ·</span>}
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
          {trybe.status === "active" ? (
            <Button color="light" onClick={() => setAction("suspend")}>
              Suspend
            </Button>
          ) : (
            <Button color="light" onClick={() => setAction("activate")}>
              Reactivate
            </Button>
          )}
          {trybe.status !== "archived" && (
            <Button color="light" onClick={() => setAction("archive")}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <Tabs aria-label="Trybe" variant="underline" onActiveTabChange={changeTab}>
        <Tabs.Item active={tab === "profile"} title="Profile" icon={() => <Icon icon="solar:document-text-line-duotone" height={18} className="me-2" />}>
          <div className="grid grid-cols-12 gap-30">
            <div className="col-span-12 lg:col-span-4">
              <CardBox>
                <div className="flex flex-col gap-5">
                  <ImagePicker trybe={trybe} kind="avatar" />
                  <ImagePicker trybe={trybe} kind="cover" />
                  <p className="text-xs text-darklink">
                    Created {trybe.created_by_name ? `by ${trybe.created_by_name}` : ""} on{" "}
                    {new Date(trybe.created_at).toLocaleDateString()}
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
        <Tabs.Item active={tab === "events"} title="Events" icon={() => <Icon icon="solar:calendar-line-duotone" height={18} className="me-2" />}>
          {tab === "events" && <TrybeContent trybeId={trybe.uuid} kind="events" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "files"} title="Files" icon={() => <Icon icon="solar:folder-with-files-line-duotone" height={18} className="me-2" />}>
          {tab === "files" && <TrybeContent trybeId={trybe.uuid} kind="files" />}
        </Tabs.Item>
        <Tabs.Item active={tab === "polls"} title={trybe.type?.poll_label || "Polls"} icon={() => <Icon icon="solar:chart-square-line-duotone" height={18} className="me-2" />}>
          {tab === "polls" && <TrybeContent trybeId={trybe.uuid} kind="polls" />}
        </Tabs.Item>
      </Tabs>

      <Modal show={!!action} onClose={() => !busy && setAction(null)} size="md">
        <Modal.Header>{copy?.title}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3">
            <p className="text-sm">{copy?.body}</p>
            {action !== "activate" && (
              <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
            )}
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
