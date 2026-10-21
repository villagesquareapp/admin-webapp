"use client";

import { useState } from "react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import { formatNumber } from "@/utils/formatNumber";
import { applyMissingLegacyTransfers } from "@/app/api/wallet";

// Cowry Transfers from before transfers moved to the ledger that never
// reached the users' wallets. Crediting them is safe to repeat: each old
// transfer is credited once.
const MissingLegacyTransfers = ({ report }: { report: ILegacyTransferReport | null }) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!report?.missing_count) return null;

  const apply = async () => {
    setBusy(true);
    try {
      const ids = report.missing.map((m) => m.legacy_transaction_id);
      const res = await applyMissingLegacyTransfers(ids);
      if (res?.status) {
        toast.success(
          `Credited ${res.data?.credited ?? 0} transfer(s), ${formatNumber(res.data?.cowries)} Cowries`,
        );
        setConfirming(false);
      } else {
        toast.error(res?.message || "Couldn't credit the transfers");
      }
    } catch {
      toast.error("Couldn't credit the transfers");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CardBox>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-sm font-semibold text-dark dark:text-white">
            Old transfers missing from wallets
          </h5>
          <p className="text-xs text-darklink mt-1">
            {report.missing_count} Cowry Transfer(s), {formatNumber(report.missing_cowries)} Cowries
            to {report.users} user(s), were sent before transfers moved to the new wallet and
            never reached the balance the app shows.
          </p>
        </div>
        {confirming ? (
          <div className="flex gap-2">
            <Button size="sm" color="light" className="h-8" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" color="success" className="h-8" onClick={apply} disabled={busy}>
              {busy ? "Crediting…" : `Credit ${formatNumber(report.missing_cowries)} Cowries`}
            </Button>
          </div>
        ) : (
          <Button size="sm" color="primary" className="h-8" onClick={() => setConfirming(true)}>
            Credit them
          </Button>
        )}
      </div>
      <div className="mt-3 flex flex-col max-h-[320px] overflow-y-auto">
        {report.missing.map((m) => (
          <div
            key={m.legacy_transaction_id}
            className="flex gap-3 items-center border-b border-ld py-2 text-sm"
          >
            <span className="truncate min-w-0">@{m.username ?? m.user_id}</span>
            <span className="text-xs text-darklink">{formatDate(m.transferred_at)}</span>
            <span className="ml-auto font-semibold tabular-nums">CWR {formatNumber(m.amount)}</span>
          </div>
        ))}
      </div>
    </CardBox>
  );
};

export default MissingLegacyTransfers;
