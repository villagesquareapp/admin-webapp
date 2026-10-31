"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { createColumnHelper } from "@/utils/table";
import { getLedgerAccount, setLedgerAccountStatus } from "@/app/api/ledger";
import PostSearch from "../posts/PostSearch";
import { ACCOUNT_LABEL, amount, OwnerCell, StatusChip, when } from "./ledgerUi";

const FILTERS = [
  {
    label: "Owner",
    key: "owner_type",
    options: [
      { value: "", label: "People and pools" },
      { value: "user", label: "People" },
      { value: "system", label: "System pools" },
    ],
  },
  {
    label: "Currency",
    key: "currency_type",
    options: [
      { value: "", label: "Coins and cowries" },
      { value: "vs_coin", label: "Coins" },
      { value: "cowry", label: "Cowries" },
    ],
  },
  {
    label: "Status",
    key: "status",
    options: [
      { value: "", label: "Any status" },
      { value: "active", label: "Active" },
      { value: "frozen", label: "Frozen" },
      { value: "closed", label: "Closed" },
    ],
  },
];

type StatusChange = { to: "active" | "frozen" | "closed"; title: string; text: string; cta: string; color: "warning" | "failure" | "success" };

const CHANGES: Record<string, StatusChange> = {
  frozen: {
    to: "frozen",
    title: "Freeze this account?",
    text: "Nothing can move in or out of it until it’s unfrozen: gifts, rewards, purchases and payouts all stop.",
    cta: "Freeze",
    color: "warning",
  },
  active: { to: "active", title: "Unfreeze this account?", text: "Money can move through it again.", cta: "Unfreeze", color: "success" },
  closed: {
    to: "closed",
    title: "Close this account?",
    text: "A closed account stays in the books but takes no more transactions.",
    cta: "Close account",
    color: "failure",
  },
};

const AccountDrawer = ({ account, onClose }: { account: ILedgerAccount | null; onClose: () => void }) => {
  const router = useRouter();
  const [detail, setDetail] = useState<ILedgerAccountDetail | null>(null);
  const [change, setChange] = useState<StatusChange | null>(null);

  useEffect(() => {
    if (!account) return;
    let live = true;
    setDetail(null);
    getLedgerAccount(account.uuid).then((r) => live && setDetail(r?.data ?? null));
    return () => {
      live = false;
    };
  }, [account]);

  if (!account) return <Drawer open={false} onClose={onClose} position="right" />;
  const status = detail?.account.status ?? account.status;
  const system = account.owner_type === "system";

  return (
    <Drawer open={!!account} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[440px] p-0">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ld">
          <OwnerCell owner={account.owner} />
          <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
            <Icon icon="solar:close-circle-linear" height={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          <div className="rounded-xl border border-ld p-4">
            <p className="text-[11px] text-darklink">{ACCOUNT_LABEL[account.account_type] ?? account.account_type} balance</p>
            <p className="text-3xl font-bold tabular-nums mt-1">{amount(detail?.balance ?? account.balance, account.currency_type)}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusChip status={status} />
              {system && <span className="text-[11px] text-darklink">Only a super admin can change a system pool</span>}
            </div>
          </div>
          {!detail ? (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-xl border border-ld px-3 py-2.5">
                <p className="text-[11px] text-darklink">Entries</p>
                <p className="font-semibold mt-0.5">{(detail.entries ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-ld px-3 py-2.5">
                <p className="text-[11px] text-darklink">Last movement</p>
                <p className="font-semibold mt-0.5 text-xs">{when(detail.last_entry_at)}</p>
              </div>
              <div className="rounded-xl border border-ld px-3 py-2.5 col-span-2">
                <p className="text-[11px] text-darklink">Account id</p>
                <p className="font-mono text-xs mt-0.5 break-all">{account.uuid}</p>
              </div>
            </div>
          )}
          <Button color="light" size="sm" className="w-fit" onClick={() => router.push(`/dashboards/ledger?tab=transactions&account_id=${account.uuid}`)}>
            <Icon icon="solar:transfer-horizontal-linear" height={16} className="me-1" /> View its transactions
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-ld">
          {status === "active" && (
            <Button color="warning" size="sm" onClick={() => setChange(CHANGES.frozen)}>
              <Icon icon="solar:snowflake-linear" height={16} className="me-1" /> Freeze
            </Button>
          )}
          {status === "frozen" && (
            <Button color="success" size="sm" onClick={() => setChange(CHANGES.active)}>
              <Icon icon="solar:sun-linear" height={16} className="me-1" /> Unfreeze
            </Button>
          )}
          {status !== "closed" && (
            <Button color="light" size="sm" className="ms-auto text-error" onClick={() => setChange(CHANGES.closed)}>
              Close account
            </Button>
          )}
        </div>
      </div>
      <ReasonModal
        open={!!change}
        title={change?.title ?? ""}
        text={change?.text}
        confirmLabel={change?.cta ?? ""}
        color={change?.color}
        icon="solar:wallet-2-bold-duotone"
        onClose={() => setChange(null)}
        onConfirm={async (reason) => {
          if (!change) return;
          const res = await setLedgerAccountStatus(account.uuid, change.to, reason);
          if (!res?.status) {
            toast.error(res?.message || "That didn’t work");
            return false;
          }
          toast.success(`Account ${change.to === "active" ? "unfrozen" : change.to}`);
          onClose();
          router.refresh();
        }}
      />
    </Drawer>
  );
};

const AccountsTable = ({ page }: { page: ILedgerPage<ILedgerAccount> | null }) => {
  const [open, setOpen] = useState<ILedgerAccount | null>(null);
  const col = createColumnHelper<ILedgerAccount>();
  const columns = [
    col.display({
      id: "owner",
      header: () => <span>Owner</span>,
      cell: (i) => <OwnerCell owner={i.row.original.owner} />,
    }),
    col.accessor("account_type", {
      header: () => <span>Account</span>,
      cell: (i) => <span className="text-sm">{ACCOUNT_LABEL[i.getValue()] ?? i.getValue()}</span>,
    }),
    col.accessor("balance", {
      header: () => <span>Balance</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums whitespace-nowrap">{amount(i.getValue(), i.row.original.currency_type)}</span>,
    }),
    col.accessor("status", {
      header: () => <span>Status</span>,
      cell: (i) => <StatusChip status={i.getValue()} />,
    }),
    col.accessor("created_at", {
      header: () => <span>Opened</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{when(i.getValue())}</span>,
    }),
  ];

  return (
    <>
      <ReusableTable
        tableData={page?.data ?? []}
        columns={columns}
        totalPages={page?.last_page || 1}
        currentPage={page?.page || 1}
        pageSize={page?.per_page || 20}
        dense
        compactTitle
        tableTitle="Accounts"
        filterDropdowns={FILTERS}
        extraButtons={<PostSearch placeholder="Owner name, username or email…" />}
        onRowClick={(row: ILedgerAccount) => setOpen(row)}
      />
      <AccountDrawer account={open} onClose={() => setOpen(null)} />
    </>
  );
};

export default AccountsTable;
