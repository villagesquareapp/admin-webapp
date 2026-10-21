"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, ModalBody, ModalFooter, ModalHeader, TextInput, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { grantMeetingHosting, revokeMeetingHosting } from "@/app/api/meetings";
import { getUsers } from "@/app/api/user";
import CardBox from "@/app/components/shared/CardBox";
import { formatDate } from "@/utils/dateUtils";
import { PersonCell } from "../meetingsUi";

type Found = { id: string; name: string; username: string; email: string; profile_picture?: string | null };

const HostsContent = ({ hosts, message }: { hosts: IMeetingHost[]; message?: string }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<IMeetingHost | null>(null);
  const isHost = new Set(hosts.map((h) => h.user_id));

  const find = async () => {
    if (!search.trim()) return;
    setBusy("search");
    try {
      const res = await getUsers(1, 8, { search: search.trim() });
      const rows = (res?.data?.data || []) as any[];
      setFound(rows.map((u) => ({ ...u.user_details?.profile, profile_picture: u.user_details?.profile?.profile_picture })));
    } catch {
      toast.error("Couldn't search accounts");
    } finally {
      setBusy(null);
    }
  };

  const grant = async (u: Found) => {
    setBusy(u.id);
    try {
      const res = await grantMeetingHosting(u.id);
      if (res?.status) {
        toast.success(`${u.name || u.username} can now host meetings`);
        router.refresh();
      } else toast.error(res?.message || "Couldn't grant hosting");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    setBusy(revoking.user_id);
    try {
      const res = await revokeMeetingHosting(revoking.user_id);
      if (res?.status) {
        toast.success("Hosting removed");
        setRevoking(null);
        router.refresh();
      } else toast.error(res?.message || "Couldn't remove hosting");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <CardBox className="xl:col-span-2">
        <p className="text-sm font-semibold mb-3">
          {hosts.length} {hosts.length === 1 ? "host" : "hosts"}
        </p>
        {message ? (
          <p className="text-sm text-darklink py-6 text-center">{message}</p>
        ) : hosts.length === 0 ? (
          <p className="text-sm text-darklink py-6 text-center">Nobody can host meetings yet. Add someone on the right.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {hosts.map((h) => (
              <div key={h.user_id} className="flex flex-wrap items-center gap-4 py-3">
                <div className="flex-1 min-w-[200px]">
                  <PersonCell person={h.user} sub={h.user?.email || undefined} />
                </div>
                <div className="text-sm text-darklink">
                  <Link href={`/dashboards/meetings/list?host_id=${h.user_id}`} className="hover:text-primary">
                    {h.meetings_count} {h.meetings_count === 1 ? "meeting" : "meetings"}
                  </Link>
                  {h.live_meeting && (
                    <Link href={`/dashboards/meetings/${h.live_meeting}`} className="ml-2 text-success font-medium">
                      · live now
                    </Link>
                  )}
                </div>
                <div className="text-xs text-darklink w-40">
                  Since {formatDate(h.granted_at)}
                  {h.granted_by && h.granted_by !== "seed" ? ` · by ${h.granted_by}` : ""}
                </div>
                <Button size="xs" color="light" onClick={() => setRevoking(h)} disabled={busy === h.user_id}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardBox>

      <CardBox>
        <p className="text-sm font-semibold">Add a host</p>
        <p className="text-xs text-darklink mb-3">Find a VillageSquare account by name, username or email.</p>
        <div className="flex gap-2">
          <TextInput
            className="flex-1"
            value={search}
            placeholder="Search accounts..."
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void find()}
          />
          <Button color="primary" onClick={() => void find()} disabled={!search.trim()}>
            {(busy === "search") && <Spinner size="sm" light />}
            <Icon icon="solar:magnifer-linear" height={16} />
          </Button>
        </div>
        {found && (
          <div className="flex flex-col gap-2 mt-4">
            {found.length === 0 && <p className="text-sm text-darklink">No accounts match.</p>}
            {found.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <PersonCell person={{ name: u.name, username: u.username, email: u.email, profile_picture: u.profile_picture }} />
                </div>
                {isHost.has(u.id) ? (
                  <span className="text-xs text-darklink">Host</span>
                ) : (
                  <Button size="xs" color="primary" onClick={() => void grant(u)} disabled={!!busy}>
                    {(busy === u.id) && <Spinner size="sm" light />}
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBox>

      <Modal show={!!revoking} onClose={() => !busy && setRevoking(null)} size="md">
        <ModalHeader>Remove this host?</ModalHeader>
        <ModalBody>
          <p className="text-sm">
            <b>{revoking?.user?.name || revoking?.user?.username}</b> won&apos;t be able to start new meetings. A meeting
            they&apos;re hosting right now carries on.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setRevoking(null)} disabled={!!busy}>
            Cancel
          </Button>
          <Button color="failure" onClick={() => void revoke()} disabled={!!busy}>
            {!!busy && <Spinner size="sm" light />}
            Remove
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default HostsContent;
