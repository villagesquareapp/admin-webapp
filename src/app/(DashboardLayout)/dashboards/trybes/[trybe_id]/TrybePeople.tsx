"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Modal, Select, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { assignTrybeRole, changeTrybeMember, setTrybeIntro } from "@/app/api/trybes";
import PostSearch from "../../posts/PostSearch";
import { formatDate } from "@/utils/dateUtils";
import { Chip, Person } from "../trybeUi";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
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
            onChange={(e) => assign({ user_id: m.uuid, role: e.target.value })}
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
    col.accessor("joined_at", {
      header: () => <span>Joined</span>,
      cell: (info) => {
        const m = info.row.original;
        return (
          <div className="text-xs text-darklink">
            <p>{formatDate(m.joined_at)}</p>
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
          <div className="flex gap-2 justify-end">
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
        <p className="text-sm text-darklink mb-4">
          Admins and moderators run the Trybe in the app. A Trybe has one owner; making someone owner turns the current
          owner into an admin.
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
            isProcessing={assigning}
            disabled={assigning || !username.trim()}
          >
            Add
          </Button>
        </div>
        {trybe.admins.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {trybe.admins.map((a) => (
              <div key={a.uuid} className="flex flex-wrap items-start gap-3">
                <div className="flex items-center gap-2 min-w-[220px]">
                  <Person user={a} />
                  <Chip value={a.role} />
                </div>
                {(a.role === "owner" || a.role === "admin") && (
                  <div className="flex-1 min-w-[240px]">
                    <p className="text-sm text-darklink italic">
                      {a.intro || "No intro. The About tab shows only their name."}
                    </p>
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
                  </div>
                )}
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
      />

      <Modal show={!!introFor} onClose={() => !busy && setIntroFor(null)} size="md">
        <Modal.Header>Intro on the About tab</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-darklink">
              The line under {introFor?.name || introFor?.username}&apos;s card, e.g. what they study or do in the Trybe.
              They can also edit it in the app. Empty clears it.
            </p>
            <Textarea rows={3} maxLength={300} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setIntroFor(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="primary" onClick={saveIntro} isProcessing={busy} disabled={busy}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!pending} onClose={() => !busy && setPending(null)} size="md">
        <Modal.Header>{copy?.title}</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-semibold">{pending?.member.name || pending?.member.username}</span>: {copy?.body}
            </p>
            {pending?.action !== "unban" && (
              <Textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the audit log)" />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setPending(null)} disabled={busy}>
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

export default TrybePeople;
