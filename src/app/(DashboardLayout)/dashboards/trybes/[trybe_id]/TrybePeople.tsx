"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createColumnHelper } from "@/utils/table";
import { formatDistanceToNow } from "date-fns";
import { Modal, ModalBody, ModalFooter, ModalHeader, Select, Textarea, TextInput, Spinner } from "flowbite-react";
import { Button } from "@/app/components/shared/Button";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { assignTrybeRole, changeTrybeMember, setTrybeIntro } from "@/app/api/trybes";
import PostSearch from "../../posts/PostSearch";
import { formatDate } from "@/utils/dateUtils";
import { Chip, Person } from "../trybeUi";
import MemberDetailModal from "./MemberDetailModal";

// A Trybe can have several admins; everyone else is a member.
const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

type MemberAction = { member: ITrybeMember; action: "remove" | "ban" | "unban" };

const ACTION_COPY = {
  remove: { title: "Remove from Trybe", body: "They lose access now and can ask to join again later.", button: "Remove", color: "warning" },
  ban: { title: "Ban from Trybe", body: "They lose access now and can't ask to join again. Their matric number stays taken.", button: "Ban", color: "failure" },
  unban: { title: "Lift ban", body: "They are not added back; they can ask to join again.", button: "Lift ban", color: "primary" },
} as const;

const TrybePeople = ({
  trybe,
  members,
  totalPages,
  page,
  limit,
}: {
  trybe: ITrybeDetail;
  members: ITrybeMember[];
  totalPages: number;
  page: number;
  limit: number;
}) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("admin");
  const [assigning, setAssigning] = useState(false);
  const [pending, setPending] = useState<MemberAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [introFor, setIntroFor] = useState<ITrybeAdminMember | null>(null);
  const [intro, setIntro] = useState("");
  const [roleChange, setRoleChange] = useState<{
    member: Pick<ITrybeMember, "uuid" | "name" | "username">;
    role: string;
  } | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const saveIntro = async () => {
    if (!introFor) return;
    setBusy(true);
    try {
      const res = await setTrybeIntro(trybe.uuid, introFor.uuid, intro.trim());
      if (res?.status) {
        toast.success(intro.trim() ? "Intro saved" : "Intro cleared");
        setIntroFor(null);
      } else toast.error(res?.message || "Couldn't save the intro");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };
  const col = createColumnHelper<ITrybeMember>();

  const assign = async (body: { username?: string; user_id?: string; role: string }) => {
    setAssigning(true);
    try {
      const res = await assignTrybeRole(trybe.uuid, body);
      if (res?.status) {
        toast.success("Role saved");
        setUsername("");
        setRoleChange(null);
      } else toast.error(res?.message || "Couldn't assign the role");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAssigning(false);
    }
  };

  const runAction = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await changeTrybeMember(trybe.uuid, pending.member.uuid, pending.action, reason.trim() || undefined);
      if (res?.status) {
        toast.success(`${ACTION_COPY[pending.action].button}: done`);
        setPending(null);
        setReason("");
      } else toast.error(res?.message || "Couldn't update this member");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    col.accessor("name", {
      header: () => <span>Person</span>,
      cell: (info) => <Person user={info.row.original} />,
    }),
    col.accessor((r) => r.campus?.matric_no, {
      id: "campus",
      header: () => <span>Student details</span>,
      cell: (info) => {
        const c = info.row.original.campus;
        return c ? (
          <div className="text-xs text-darklink">
            <p className="text-sm text-dark dark:text-white">{c.matric_no}</p>
            <p>
              {c.department} · {c.level}
            </p>
          </div>
        ) : (
          <span className="text-xs text-darklink">Added by staff</span>
        );
      },
    }),
    col.accessor("role", {
      header: () => <span>Role</span>,
      cell: (info) => {
        const m = info.row.original;
        if (m.status !== "active") return <Chip value={m.role} />;
        return (
          <Select
            sizing="sm"
            value={m.role}
            disabled={assigning}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setRoleChange({ member: m, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        );
      },
    }),
    col.accessor("last_seen_at", {
      header: () => <span>Last visit</span>,
      cell: (info) => {
        const m = info.row.original;
        return (
          <span className="text-xs text-darklink flex items-center gap-1.5">
            {m.last_seen_at ? formatDistanceToNow(new Date(m.last_seen_at), { addSuffix: true }) : "Never"}
            {!m.notifications_enabled && (
              <span title="Notifications off">
                <Icon icon="solar:bell-off-linear" height={14} />
              </span>
            )}
          </span>
        );
      },
    }),
    col.accessor("joined_at", {
      header: () => <span>Joined</span>,
      cell: (info) => {
        const m = info.row.original;
        return (
          <div className="text-xs text-darklink">
            <p>{formatDate(m.joined_at)}</p>
            <p>{m.joined_via === "staff" ? "Added by staff" : "By request"}</p>
            {m.status !== "active" && <Chip value={m.status} />}
            {m.ended_by && (
              <p className="mt-1">
                by {m.ended_by.name || "unknown"} ({m.ended_by.kind === "staff" ? "staff" : "Trybe admin"})
              </p>
            )}
          </div>
        );
      },
    }),
    col.display({
      id: "actions",
      header: () => <span />,
      cell: (info) => {
        const m = info.row.original;
        return (
          <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
            {m.status === "active" && (
              <Button size="xs" color="light" onClick={() => setPending({ member: m, action: "remove" })}>
                Remove
              </Button>
            )}
            {m.status === "banned" ? (
              <Button size="xs" color="light" onClick={() => setPending({ member: m, action: "unban" })}>
                Lift ban
              </Button>
            ) : (
              <Button size="xs" color="failure" onClick={() => setPending({ member: m, action: "ban" })}>
                Ban
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const copy = pending ? ACTION_COPY[pending.action] : null;

  return (
    <div className="flex flex-col gap-30">
      <CardBox>
        <h5 className="font-semibold">Trybe admins</h5>
        <p className="text-sm text-darklink max-w-2xl mb-4">
          Admins run the Trybe in the app: they approve join requests, manage people, and post announcements, polls,
          events and files. A Trybe can have several. Add someone by username (they join if they aren&apos;t in it),
          or change anyone&apos;s role in the table below.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
            placeholder="username"
            addon="@"
            className="min-w-[220px]"
          />
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <Button
            color="primary"
            onClick={() => assign({ username: username.trim(), role })}
            disabled={assigning || !username.trim()}
          >
            {assigning && <Spinner size="sm" light />}
            Add
          </Button>
        </div>
        {trybe.admins.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {trybe.admins.map((a) => (
              <div key={a.uuid} className="flex flex-wrap items-start gap-3">
                <div className="min-w-[220px]">
                  <Person user={a} />
                </div>
                <div className="flex-1 min-w-[240px]">
                  <p className="text-sm text-darklink italic">
                    {a.intro || "No intro. The About tab shows only their name."}
                  </p>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="text-xs text-primary font-semibold"
                      onClick={() => {
                        setIntroFor(a);
                        setIntro(a.intro ?? "");
                      }}
                    >
                      Edit intro
                    </button>
                    <button
                      type="button"
                      className="text-xs text-error font-semibold"
                      onClick={() => setRoleChange({ member: a, role: "member" })}
                    >
                      Remove as admin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBox>

      <ReusableTable
        tableData={members}
        columns={columns}
        totalPages={totalPages}
        currentPage={page}
        pageSize={limit}
        dense
        compactTitle
        tableTitle="People"
        filterDropdowns={[
          {
            label: "Status",
            key: "status",
            options: [
              { value: "", label: "Members" },
              { value: "banned", label: "Banned" },
              { value: "removed", label: "Removed" },
              { value: "left", label: "Left" },
            ],
          },
          { label: "Role", key: "role", options: [{ value: "", label: "Any role" }, ...ROLES] },
        ]}
        extraButtons={<PostSearch placeholder="Name, username or matric no..." />}
        onRowClick={(row: ITrybeMember) => setViewing(row.uuid)}
      />

      <MemberDetailModal trybeId={trybe.uuid} userId={viewing} onClose={() => setViewing(null)} />

      <Modal show={!!roleChange} onClose={() => !assigning && setRoleChange(null)} size="md">
        <ModalHeader>Change role</ModalHeader>
        <ModalBody>
          <p className="text-sm">
            Make <span className="font-semibold">{roleChange?.member.name || roleChange?.member.username}</span>{" "}
            {roleChange?.role === "member" ? "a plain member" : "an admin"}?
            {roleChange?.role === "admin"
              ? " Admins approve requests and manage people in the app."
              : " They stay in the Trybe but stop being an admin."}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setRoleChange(null)} disabled={assigning}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => roleChange && assign({ user_id: roleChange.member.uuid, role: roleChange.role })}
            disabled={assigning}
          >
            {assigning && <Spinner size="sm" light />}
            Change role
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={!!introFor} onClose={() => !busy && setIntroFor(null)} size="md">
        <ModalHeader>Intro on the About tab</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-darklink">
              The line under {introFor?.name || introFor?.username}&apos;s card, e.g. what they study or do in the Trybe.
              They can also edit it in the app. Empty clears it.
            </p>
            <Textarea rows={3} maxLength={300} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setIntroFor(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="primary" onClick={saveIntro} disabled={busy}>
            {busy && <Spinner size="sm" light />}
            Save
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={!!pending} onClose={() => !busy && setPending(null)} size="md">
        <ModalHeader>{copy?.title}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-semibold">{pending?.member.name || pending?.member.username}</span>: {copy?.body}
            </p>
            {pending?.action !== "unban" && (
              <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setPending(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color={copy?.color} onClick={runAction} disabled={busy}>
            {busy && <Spinner size="sm" light />}
            {copy?.button}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TrybePeople;
