"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, ModalBody, Spinner, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { Button } from "@/app/components/shared/Button";
import { reconcileLedger } from "@/app/api/ledger";
import { ACCOUNT_LABEL, amount, CATEGORY_LABEL, StatusChip } from "./ledgerUi";

const Reconcile = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const [from, setFrom] = useState(format(new Date(Date.now() - 7 * 86_400_000), "yyyy-MM-dd"));
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ILedgerReconciliation | null>(null);

  const run = async () => {
    const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
    if (days < 0) return toast.error("The start date is after the end date");
    if (days > 31) return toast.error("Check at most 31 days at a time");
    setBusy(true);
    setResult(null);
    const res = await reconcileLedger(new Date(`${from}T00:00:00`).toISOString(), new Date(`${to}T23:59:59`).toISOString());
    setBusy(false);
    if (res?.status && res.data) setResult(res.data);
    else toast.error(res?.message || "The check didn’t run");
  };

  return (
    <Modal show={open} size="lg" onClose={() => !busy && onClose()} popup>
      <ModalBody>
        <div className="pt-6">
          <h3 className="text-lg font-semibold">Check the books</h3>
          <p className="text-sm text-darklink mt-1">
            Every transaction’s debits should equal its credits. This checks a date range (up to 31 days) and lists any that don’t.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <TextInput type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} disabled={busy} />
            <TextInput type="date" value={to} max={today} onChange={(e) => setTo(e.target.value)} disabled={busy} />
            <Button color="primary" className="h-10" onClick={run} disabled={busy}>
              {busy ? <Spinner size="sm" light /> : <Icon icon="solar:checklist-minimalistic-linear" height={16} className="me-1" />}
              Run check
            </Button>
          </div>
          {result && (
            <div className={`mt-5 rounded-xl p-4 ${result.discrepancies.length ? "bg-lighterror/60 dark:bg-lighterror/10" : "bg-lightsuccess/60 dark:bg-lightsuccess/10"}`}>
              <p className={`text-sm font-semibold ${result.discrepancies.length ? "text-error" : "text-success"}`}>
                {result.discrepancies.length
                  ? `${result.discrepancies.length} of ${result.total_transactions.toLocaleString()} transactions don’t balance`
                  : `All ${result.total_transactions.toLocaleString()} transactions balance`}
              </p>
              {result.discrepancies.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto text-xs font-mono flex flex-col gap-1">
                  {result.discrepancies.map((d) => (
                    <p key={d.transaction_id}>
                      {d.transaction_id.slice(0, 8)}… debits {d.debit_sum} · credits {d.credit_sum} · off by {d.difference}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-5">
            <Button color="light" onClick={onClose} disabled={busy}>Close</Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

const LedgerOverview = ({ overview }: { overview: ILedgerOverview | null }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [reconcile, setReconcile] = useState(false);
  const tab = params.get("tab") === "accounts" ? "accounts" : "transactions";

  const setTab = (next: string) => {
    const p = new URLSearchParams();
    p.set("tab", next);
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const top = (overview?.last_7d ?? []).slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Ledger</h4>
          <p className="text-sm text-darklink">Every coin and cowry movement, double-entry: accounts, balances and transactions.</p>
        </div>
        <Button color="light" className="h-10" onClick={() => setReconcile(true)}>
          <Icon icon="solar:checklist-minimalistic-linear" height={16} className="me-1.5" /> Check the books
        </Button>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <KpiCard icon="solar:wallet-2-bold-duotone" value={overview.accounts.total} label={`Accounts · ${overview.accounts.users.toLocaleString()} people`} tone="bg-lightprimary text-primary" />
            <KpiCard icon="solar:snowflake-bold-duotone" value={overview.accounts.frozen} label="Frozen accounts" tone={overview.accounts.frozen ? "bg-lightwarning text-warning" : "bg-lightsuccess text-success"} />
            <KpiCard icon="solar:transfer-horizontal-bold-duotone" value={overview.last_24h.transactions} label="Transactions (24h)" tone="bg-lightsecondary text-secondary" />
            <KpiCard icon="solar:close-circle-bold-duotone" value={overview.last_24h.failed} label="Failed (24h)" tone={overview.last_24h.failed ? "bg-lighterror text-error" : "bg-lightsuccess text-success"} />
            <KpiCard icon="solar:undo-left-round-bold-duotone" value={overview.last_30d.reversals} label="Reversals (30 days)" tone="bg-lightwarning text-warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CardBox>
              <h5 className="text-sm font-semibold mb-3">System pools</h5>
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {overview.system_accounts.map((a) => (
                  <div key={a.uuid} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-8 rounded-lg grid place-items-center bg-lightsecondary text-secondary shrink-0">
                        <Icon icon="solar:safe-square-bold-duotone" height={17} />
                      </span>
                      <p className="text-sm font-medium truncate">{ACCOUNT_LABEL[a.account_type] ?? a.account_type}</p>
                      {a.status !== "active" && <StatusChip status={a.status} />}
                    </div>
                    <p className="text-sm font-semibold tabular-nums whitespace-nowrap">{amount(a.balance, a.currency_type)}</p>
                  </div>
                ))}
                {!overview.system_accounts.length && <p className="text-sm text-darklink py-3">No system pools yet.</p>}
              </div>
            </CardBox>
            <CardBox>
              <h5 className="text-sm font-semibold mb-3">Last 7 days by kind</h5>
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {top.map((r) => (
                  <div key={`${r.category}-${r.currency_type}`} className="flex items-center justify-between gap-3 py-2.5">
                    <p className="text-sm truncate">{CATEGORY_LABEL[r.category] ?? r.category}</p>
                    <p className="text-sm text-darklink whitespace-nowrap tabular-nums">
                      {r.count.toLocaleString()} · <span className="font-semibold text-dark dark:text-white">{amount(r.volume, r.currency_type)}</span>
                    </p>
                  </div>
                ))}
                {!top.length && <p className="text-sm text-darklink py-3">Nothing moved this week.</p>}
              </div>
            </CardBox>
          </div>
        </>
      )}

      <div className="inline-flex rounded-xl border border-ld p-1 w-fit">
        {[
          { key: "transactions", label: "Transactions", icon: "solar:transfer-horizontal-linear" },
          { key: "accounts", label: "Accounts", icon: "solar:wallet-2-linear" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-white" : "text-darklink hover:text-primary"}`}
          >
            <Icon icon={t.icon} height={16} /> {t.label}
          </button>
        ))}
      </div>

      <Reconcile open={reconcile} onClose={() => setReconcile(false)} />
    </div>
  );
};

export default LedgerOverview;
