"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import ReasonModal from "@/app/components/shared/ReasonModal";
import { Button } from "@/app/components/shared/Button";
import { rebuildLedgerBalance } from "@/app/api/ledger";
import { ACCOUNT_LABEL, amount, when } from "./ledgerUi";

// Sets an account's stored balance from its entries (the source of truth).
export const RebuildBalanceModal = ({
  target,
  onClose,
  onDone,
}: {
  target: { accountId: string; name: string; frozen: boolean; entries: string; stored: string; currency: string } | null;
  onClose: () => void;
  onDone?: () => void;
}) => {
  const router = useRouter();
  const [unfreeze, setUnfreeze] = useState(true);
  return (
    <ReasonModal
      open={!!target}
      title="Rebuild this balance?"
      color="warning"
      icon="solar:refresh-circle-bold-duotone"
      confirmLabel="Rebuild balance"
      text={
        // Inline elements only: the dialog puts this inside a <p>.
        target && (
          <span className="flex flex-col gap-3 text-sm">
            <span>
              {target.name}&apos;s balance is set from its entries: {amount(target.entries, target.currency)} (it shows{" "}
              {amount(target.stored, target.currency)} now). Check why they differed before you do this.
            </span>
            {target.frozen && (
              <span className="flex items-center justify-center gap-2">
                <Checkbox id="rebuild-unfreeze" checked={unfreeze} onChange={(e) => setUnfreeze(e.target.checked)} />
                <Label htmlFor="rebuild-unfreeze">Unfreeze the account afterwards</Label>
              </span>
            )}
          </span>
        )
      }
      onClose={onClose}
      onConfirm={async (reason) => {
        if (!target) return false;
        const res = await rebuildLedgerBalance(target.accountId, reason, target.frozen && unfreeze);
        if (!res?.status) {
          toast.error(res?.message || "That didn’t work");
          return false;
        }
        toast.success(res.data?.unfrozen ? "Balance rebuilt and account unfrozen" : "Balance rebuilt");
        onDone?.();
        onClose();
        router.refresh();
      }}
    />
  );
};

// What the nightly check found: accounts whose stored balance disagreed with
// their entries. A person's account is frozen until it's rebuilt.
const BalanceChecks = ({ mismatches }: { mismatches: ILedgerBalanceMismatch[] | null }) => {
  const [target, setTarget] = useState<ILedgerBalanceMismatch | null>(null);
  if (mismatches === null) return null;

  if (!mismatches.length) {
    return (
      <p className="text-xs text-darklink flex items-center gap-1.5">
        <Icon icon="solar:shield-check-linear" height={15} className="text-success" />
        Every balance checked matched its entries. Checked every night.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-warning/40 bg-lightwarning/40 p-4">
      <div className="flex items-start gap-2 mb-3">
        <Icon icon="solar:danger-triangle-bold-duotone" height={20} className="text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">
            {mismatches.length} balance{mismatches.length === 1 ? "" : "s"} didn&apos;t match {mismatches.length === 1 ? "its" : "their"} entries
          </p>
          <p className="text-xs text-darklink">
            Found by the nightly check. People&apos;s accounts are frozen until rebuilt; system pools stay open.
          </p>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-border dark:divide-darkborder">
        {mismatches.map((m) => {
          const name = m.owner_type === "user" ? m.owner_name || (m.owner_username ? `@${m.owner_username}` : "A user") : ACCOUNT_LABEL[m.account_type] ?? m.account_type;
          return (
            <li key={m.uuid} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {name}
                  <span className="text-xs text-darklink ms-2">{ACCOUNT_LABEL[m.account_type] ?? m.account_type}</span>
                </p>
                <p className="text-xs text-darklink">
                  Entries add up to {amount(m.ledger_balance, m.currency_type)} · stored {amount(m.stored_balance, m.currency_type)} · found{" "}
                  {when(m.found_at)}
                  {m.account_status === "frozen" && <span className="text-warning"> · frozen</span>}
                </p>
              </div>
              <Button size="xs" color="warning" onClick={() => setTarget(m)}>
                Rebuild
              </Button>
            </li>
          );
        })}
      </ul>
      <RebuildBalanceModal
        target={
          target && {
            accountId: target.account_id,
            name: target.owner_type === "user" ? target.owner_name || "This person" : ACCOUNT_LABEL[target.account_type] ?? "This pool",
            frozen: target.account_status === "frozen",
            entries: target.ledger_balance,
            stored: target.stored_balance,
            currency: target.currency_type,
          }
        }
        onClose={() => setTarget(null)}
      />
    </div>
  );
};

export default BalanceChecks;
