"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Textarea, TextInput } from "flowbite-react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { Button } from "@/app/components/shared/Button";
import { createColumnHelper } from "@/utils/table";
import { changeGrantEnd, revokeGrant } from "@/app/api/verification";
import PostSearch from "../posts/PostSearch";
import { PersonCell, VerifiedBadge, shortDate, untilLabel } from "./verificationUi";

const STATE_COLOR: Record<string, string> = { active: "success", ended: "gray", revoked: "failure" };

const day = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
const tomorrow = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

const VerifiedAccountsTable = ({
  accounts,
  filters,
  totalPages,
  currentPage,
  pageSize,
}: {
  accounts: IVerifiedAccountsResponse | null;
  filters: { state?: string; source?: string; badge?: string };
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const router = useRouter();
  const rows = Array.isArray(accounts?.data) ? accounts!.data : [];
  const [changing, setChanging] = useState<IVerifiedAccount | null>(null);
  const [until, setUntil] = useState("");
  const [revoking, setRevoking] = useState<IVerifiedAccount | null>(null);
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const col = createColumnHelper<IVerifiedAccount>();

  const saveEnd = async () => {
    if (!changing || !until) return;
    setBusy(true);
    try {
      const res = await changeGrantEnd(changing.uuid, new Date(`${until}T23:59:59`).toISOString());
      if (res?.status) {
        toast.success(`Verified until ${shortDate(res.data?.ends_at)}`);
        setChanging(null);
        router.refresh();
      } else toast.error(res?.message || "Couldn't change the end date");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    try {
      const res = await revokeGrant(revoking.uuid, why.trim());
      if (res?.status) {
        const left = res.data?.verification_badge;
        toast.success(left && left !== "none" ? `Revoked. They keep a ${left === "premium" ? "Premium" : "Green check"} badge from another subscription.` : "Revoked. The badge is gone.");
        setRevoking(null);
        setWhy("");
        router.refresh();
      } else toast.error(res?.message || "Couldn't revoke it");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    col.accessor((r) => r.user?.name, {
      id: "person",
      header: () => <span>Person</span>,
      cell: (info) => (
        <Link href={`/dashboards/users/${info.row.original.user.uuid}`} className="hover:opacity-80">
          <PersonCell user={info.row.original.user} />
        </Link>
      ),
    }),
    col.accessor("badge", {
      header: () => <span>Badge</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="flex flex-col gap-1">
            <VerifiedBadge badge={r.badge} />
            {r.state === "active" && r.user.verification_badge !== r.badge && (
              <span className="text-[11px] text-darklink">Shows {r.user.verification_badge === "none" ? "no badge" : r.user.verification_badge}</span>
            )}
          </div>
        );
      },
    }),
    col.accessor("source", {
      header: () => <span>How</span>,
      cell: (info) => {
        const r = info.row.original;
        if (r.source === "paid") {
          return (
            <div className="text-xs text-darklink">
              <p className="text-sm text-dark dark:text-white">Paid</p>
              <p>
                {r.plan.name}
                {r.renewal_count ? ` · renewed ${r.renewal_count}×` : ""}
              </p>
            </div>
          );
        }
        return (
          <div className="text-xs text-darklink max-w-[240px]">
            <p className="text-sm text-dark dark:text-white">Granted{r.by_admin?.name ? ` by ${r.by_admin.name}` : ""}</p>
            {r.note && <p className="truncate" title={r.note}>{r.note}</p>}
          </div>
        );
      },
    }),
    col.accessor("ends_at", {
      header: () => <span>Valid</span>,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="text-xs text-darklink">
            <p className="text-sm text-dark dark:text-white">
              {shortDate(r.starts_at)} – {shortDate(r.ends_at)}
            </p>
            <p>{r.state === "revoked" ? "Revoked" : untilLabel(r.ends_at)}</p>
          </div>
        );
      },
    }),
    col.accessor("state", {
      header: () => <span>Status</span>,
      cell: (i) => (
        <Badge color={STATE_COLOR[i.getValue()] ?? "gray"} className="w-fit capitalize">
          {i.getValue()}
        </Badge>
      ),
    }),
    col.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const r = info.row.original;
        if (r.source !== "granted" || r.state === "revoked") return <span className="text-xs text-darklink">--</span>;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUntil(r.state === "active" ? day(r.ends_at) : "");
                setChanging(r);
              }}
              className="text-xs font-semibold bg-lightprimary text-primary px-2.5 py-1.5 rounded-md"
            >
              {r.state === "active" ? "Change end" : "Extend"}
            </button>
            {r.state === "active" && (
              <button
                onClick={() => {
                  setWhy("");
                  setRevoking(r);
                }}
                className="text-xs font-semibold bg-lighterror text-error px-2.5 py-1.5 rounded-md"
              >
                Revoke
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={rows}
        columns={columns}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        tableTitle="Verified accounts"
        filterDropdowns={[
          {
            label: "Status",
            key: "state",
            options: [
              { value: "", label: "Any status" },
              { value: "active", label: "Active" },
              { value: "expiring", label: "Ending within 7 days" },
              { value: "ended", label: "Ended" },
              { value: "revoked", label: "Revoked" },
            ],
            defaultValue: filters.state ?? "",
          },
          {
            label: "How",
            key: "source",
            options: [
              { value: "", label: "Paid and granted" },
              { value: "paid", label: "Paid" },
              { value: "granted", label: "Granted by staff" },
            ],
            defaultValue: filters.source ?? "",
          },
          {
            label: "Badge",
            key: "badge",
            options: [
              { value: "", label: "Any badge" },
              { value: "greencheck", label: "Green check" },
              { value: "premium", label: "Premium" },
            ],
            defaultValue: filters.badge ?? "",
          },
        ]}
        extraButtons={<PostSearch placeholder="Name, username or note..." />}
      />
      {rows.length === 0 && <p className="text-sm text-darklink text-center -mt-2 mb-4">No verified accounts match.</p>}

      <Modal show={!!changing} onClose={() => setChanging(null)} size="md">
        <ModalHeader>{changing?.state === "active" ? "Change the end date" : "Extend this verification"}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-darklink mb-3">
            {changing?.user.name} keeps the {changing?.badge === "premium" ? "Premium" : "Green check"} badge until the end of this day.
          </p>
          <Label htmlFor="grant-until">Verified until</Label>
          <TextInput id="grant-until" type="date" min={tomorrow()} value={until} onChange={(e) => setUntil(e.target.value)} />
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button color="light" onClick={() => setChanging(null)}>
            Cancel
          </Button>
          <Button color="primary" onClick={saveEnd} disabled={busy || !until}>
            {busy && <Spinner size="sm" light className="me-2" />}
            Save
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={!!revoking} onClose={() => setRevoking(null)} size="md">
        <ModalHeader>Revoke verification?</ModalHeader>
        <ModalBody>
          <p className="text-sm mb-3">
            {revoking?.user.name} loses this badge now. A paid subscription they have stays.
          </p>
          <Label htmlFor="revoke-why">Why (optional, staff only)</Label>
          <Textarea id="revoke-why" rows={3} maxLength={500} value={why} onChange={(e) => setWhy(e.target.value)} />
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button color="light" onClick={() => setRevoking(null)}>
            Cancel
          </Button>
          <Button color="failure" onClick={revoke} disabled={busy}>
            {busy && <Spinner size="sm" light className="me-2" />}
            Revoke
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default VerifiedAccountsTable;
