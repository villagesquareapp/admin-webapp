"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import ReusableTable from "@/app/components/shared/ReusableTable";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { createColumnHelper } from "@/utils/table";
import { reverseLedgerTransaction } from "@/app/api/ledger";
import PostSearch from "../posts/PostSearch";
import { ACCOUNT_LABEL, amount, CATEGORY_LABEL, moved, OwnerCell, parties, StatusChip, TYPE_LABEL, when } from "./ledgerUi";

const FILTERS = [
  {
    label: "Kind",
    key: "category",
    options: [{ value: "", label: "All kinds" }, ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))],
  },
  {
    label: "Status",
    key: "status",
    options: [
      { value: "", label: "Any status" },
      { value: "success", label: "Success" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

// Only a successful coin purchase can be reversed (payouts are declined from
// the payout queue), and never a reversal.
const canReverse = (t: ILedgerTransaction) =>
  t.transaction_type === "purchase" && (t.transaction_status ?? "success") === "success" && !t.reversal_of;

const TransactionDrawer = ({ tx, onClose }: { tx: ILedgerTransaction | null; onClose: () => void }) => {
  const router = useRouter();
  const [reversing, setReversing] = useState(false);
  if (!tx) return <Drawer open={false} onClose={onClose} position="right" />;
  const p = parties(tx);
  return (
    <Drawer open={!!tx} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[480px] p-0">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ld">
          <div className="min-w-0">
            <StatusChip status={tx.transaction_status ?? "success"} />
            <h5 className="text-base font-semibold mt-2">{CATEGORY_LABEL[tx.transaction_category ?? ""] ?? TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type}</h5>
            <p className="text-xs text-darklink mt-0.5">{when(tx.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
            <Icon icon="solar:close-circle-linear" height={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <div className="rounded-xl border border-ld p-4">
            <p className="text-2xl font-bold tabular-nums">{moved(tx)}</p>
            <p className="text-sm text-darklink mt-1">{p.from} → {p.to}</p>
            {tx.description && <p className="text-sm mt-3">{tx.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {[
              ["Type", TYPE_LABEL[tx.transaction_type] ?? tx.transaction_type],
              ["Provider", tx.payment_provider || "—"],
              ["Reference", tx.reference_id ? `${tx.reference_type ?? ""} ${tx.reference_id}`.trim() : "—"],
              ["Transaction id", tx.uuid],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-ld px-3 py-2.5 min-w-0">
                <p className="text-[11px] text-darklink">{k}</p>
                <p className="font-semibold mt-0.5 break-all text-xs">{v}</p>
              </div>
            ))}
          </div>
          {tx.reversal_of && (
            <p className="text-sm rounded-xl bg-lightwarning/50 dark:bg-lightwarning/10 px-3 py-2">
              Reverses transaction <span className="font-mono text-xs">{tx.reversal_of}</span>
            </p>
          )}
          <div>
            <p className="text-sm font-semibold mb-2">Entries</p>
            <div className="flex flex-col gap-2">
              {tx.entries.map((e) => (
                <div key={e.uuid} className="rounded-xl border border-ld p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <OwnerCell owner={e.account?.owner} accountType={e.account?.account_type} />
                    <p className="text-[11px] text-darklink mt-1">{ACCOUNT_LABEL[e.account?.account_type ?? ""] ?? e.account?.account_type}</p>
                  </div>
                  <p className={`text-sm font-semibold tabular-nums whitespace-nowrap ${e.entry_type === "credit" ? "text-success" : "text-error"}`}>
                    {e.entry_type === "credit" ? "+" : "−"}
                    {amount(e.amount, e.currency_type)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-ld">
          {canReverse(tx) ? (
            <Button color="failure" size="sm" onClick={() => setReversing(true)}>
              <Icon icon="solar:undo-left-round-linear" height={16} className="me-1" /> Reverse purchase
            </Button>
          ) : (
            <p className="text-xs text-darklink">Only a successful coin purchase can be reversed here. Payouts are declined from the payout queue.</p>
          )}
        </div>
      </div>
      <ReasonModal
        open={reversing}
        title="Reverse this purchase?"
        text="The coins come back out of the buyer’s wallet and the ledger records a reversal. This can’t be undone."
        confirmLabel="Reverse"
        icon="solar:undo-left-round-bold-duotone"
        onClose={() => setReversing(false)}
        onConfirm={async (reason) => {
          const res = await reverseLedgerTransaction(tx.uuid, reason);
          if (!res?.status) {
            toast.error(res?.message || "The reversal didn’t go through");
            return false;
          }
          toast.success("Purchase reversed");
          onClose();
          router.refresh();
        }}
      />
    </Drawer>
  );
};

const TransactionsTable = ({ page }: { page: ILedgerPage<ILedgerTransaction> | null }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState<ILedgerTransaction | null>(null);
  const accountId = params.get("account_id");
  const col = createColumnHelper<ILedgerTransaction>();

  const columns = [
    col.accessor("created_at", {
      header: () => <span>When</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{when(i.getValue())}</span>,
    }),
    col.display({
      id: "kind",
      header: () => <span>Kind</span>,
      cell: (i) => {
        const t = i.row.original;
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium">{CATEGORY_LABEL[t.transaction_category ?? ""] ?? TYPE_LABEL[t.transaction_type] ?? t.transaction_type}</p>
            {t.reversal_of && <p className="text-[11px] text-warning">Reversal</p>}
          </div>
        );
      },
    }),
    col.display({
      id: "parties",
      header: () => <span>From → to</span>,
      cell: (i) => {
        const p = parties(i.row.original);
        return <p className="text-sm text-darklink truncate max-w-[280px]">{p.from} → {p.to}</p>;
      },
    }),
    col.display({
      id: "amount",
      header: () => <span>Amount</span>,
      cell: (i) => <span className="text-sm font-semibold tabular-nums whitespace-nowrap">{moved(i.row.original)}</span>,
    }),
    col.accessor("transaction_status", {
      header: () => <span>Status</span>,
      cell: (i) => <StatusChip status={i.getValue() ?? "success"} />,
    }),
  ];

  const clearAccount = () => {
    const p = new URLSearchParams(params.toString());
    p.delete("account_id");
    p.set("page", "1");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  return (
    <>
      {accountId && (
        <div className="flex items-center gap-2 text-sm rounded-xl bg-lightprimary/60 dark:bg-lightprimary/10 text-primary px-4 py-2.5 w-fit">
          <Icon icon="solar:filter-linear" height={16} /> Showing one account’s transactions
          <button onClick={clearAccount} className="ms-1 font-semibold hover:underline">Show all</button>
        </div>
      )}
      <ReusableTable
        tableData={page?.data ?? []}
        columns={columns}
        totalPages={page?.last_page || 1}
        currentPage={page?.page || 1}
        pageSize={page?.per_page || 20}
        dense
        compactTitle
        tableTitle="Transactions"
        filterDropdowns={FILTERS}
        extraButtons={<PostSearch placeholder="Transaction id or reference…" />}
        onRowClick={(row: ILedgerTransaction) => setOpen(row)}
      />
      <TransactionDrawer tx={open} onClose={() => setOpen(null)} />
    </>
  );
};

export default TransactionsTable;
