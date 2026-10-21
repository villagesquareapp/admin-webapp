"use client";

import { useState } from "react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import { formatNumber } from "@/utils/formatNumber";
import { requeueWithdrawals } from "@/app/api/wallet";
import { batchFailureMessage, batchFailures } from "@/utils/withdrawalBatch";

const stateOf = (w: IWithdrawalAttention) =>
  w.review
    ? {
        label: "Needs review",
        tone: "bg-lighterror text-error",
        detail: w.review.reason,
      }
    : w.unconfirmed
      ? {
          label: "Not confirmed",
          tone: "bg-lightwarning text-warning",
          detail:
            "Flutterwave didn't confirm this transfer. Look it up on the Flutterwave dashboard by its reference before doing anything else.",
        }
      : {
          label: "Paying out",
          tone: "bg-lightinfo text-info",
          detail: "Sent to Flutterwave. It settles on its own when the transfer finishes.",
        };

const destinationOf = (w: IWithdrawalAttention) => {
  const d = w.payout_destination;
  if (!d?.account_number) return "Bank account on file";
  return `${d.bank_name ?? "Bank"} ••${d.account_number.slice(-4)}`;
};

// Payouts that are in flight, never confirmed by Flutterwave, or flagged by
// the payout check. Nothing here can be approved or declined again.
const PayoutsNeedingAttention = ({ items }: { items: IWithdrawalAttention[] }) => {
  const [busy, setBusy] = useState<string | null>(null);
  if (!items.length) return null;

  const requeue = async (uuid: string) => {
    setBusy(uuid);
    try {
      const res = await requeueWithdrawals([uuid]);
      const failures = batchFailures(res);
      if (!res?.status) toast.error(res?.message || "Couldn't move it back to the queue");
      else if (failures.length) toast.error(batchFailureMessage(failures, 1));
      else toast.success("Back in the approval queue");
    } catch {
      toast.error("Couldn't move it back to the queue");
    } finally {
      setBusy(null);
    }
  };

  return (
    <CardBox>
      <h5 className="text-sm font-semibold text-dark dark:text-white">
        Payouts needing attention ({items.length})
      </h5>
      <p className="text-xs text-darklink mt-1">
        Payouts still with Flutterwave, or flagged for a person to check. A
        failed payout gives the money back to the user on its own.
      </p>
      <div className="mt-3 flex flex-col">
        {items.map((w) => {
          const state = stateOf(w);
          return (
            <div
              key={w.uuid}
              className="flex flex-wrap gap-x-4 gap-y-2 items-center border-b border-ld py-2.5"
            >
              <div className="flex flex-col min-w-0 shrink">
                <h5 className="text-sm font-medium truncate">{w.user?.name || "Unknown"}</h5>
                <p className="text-xs text-darklink truncate">
                  @{w.user?.username} · {formatDate(w.created_at)}
                </p>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tabular-nums">
                  ₦{formatNumber(w.payout_naira)}
                </span>
                <span className="text-xs text-darklink truncate">{destinationOf(w)}</span>
              </div>
              <div className="flex flex-col min-w-0 ml-auto items-end gap-1">
                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 ${state.tone}`}
                  title={state.detail}
                >
                  {state.label}
                </span>
                <span className="text-[11px] text-darklink">Ref {w.reference_id}</span>
              </div>
              {w.can_requeue && (
                <Button
                  size="sm"
                  color="light"
                  className="h-8"
                  disabled={busy === w.uuid}
                  onClick={() => requeue(w.uuid)}
                  title="Only if the Flutterwave dashboard shows no transfer with this reference"
                >
                  {busy === w.uuid ? "Moving…" : "Back to queue"}
                </Button>
              )}
              <p className="basis-full text-xs text-darklink">{state.detail}</p>
            </div>
          );
        })}
      </div>
    </CardBox>
  );
};

export default PayoutsNeedingAttention;
