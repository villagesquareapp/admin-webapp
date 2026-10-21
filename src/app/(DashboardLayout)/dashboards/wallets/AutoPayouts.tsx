"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Select } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/app/components/shared/Button";
import { formatDate } from "@/utils/dateUtils";
import { formatNumber } from "@/utils/formatNumber";
import {
  approvePayouts,
  declinePayouts,
  getPayoutCycles,
  getPayouts,
} from "@/app/api/wallet";
import { batchFailureMessage, batchFailures } from "@/utils/payoutBatch";

const LEVELS: Record<PayoutVerificationLevel, string> = {
  none: "Not verified",
  checkmark: "Checkmark",
  premium: "Premium",
};
const STATUS_TONE: Record<PayoutStatus, string> = {
  pending: "bg-lightinfo text-info",
  review: "bg-lightwarning text-warning",
  processing: "bg-lightinfo text-info",
  paid: "bg-lightsuccess text-success",
  failed: "bg-lighterror text-error",
  cancelled: "bg-lightgray text-darklink",
};
const FILTERS: { value: PayoutStatus | ""; label: string }[] = [
  { value: "review", label: "Waiting for review" },
  { value: "processing", label: "Being sent" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed (money returned)" },
  { value: "cancelled", label: "Declined or cancelled" },
  { value: "", label: "All" },
];

const accountOf = (p: IPayout) =>
  p.method?.account_number
    ? `${p.method.bank_name ?? "Bank"} ••${p.method.account_number.slice(-4)}`
    : "Bank account";

// Automatic payouts: each level's recent cycles, and the payouts in them.
// Ones waiting for review are approved (sent) or declined (money back) here.
const AutoPayouts = ({
  cycles: initialCycles,
  payouts: initialPayouts,
}: {
  cycles: IPayoutCycle[];
  payouts: IPayoutsResponse | null;
}) => {
  const [cycles, setCycles] = useState(initialCycles);
  const [filter, setFilter] = useState<PayoutStatus | "">("review");
  const [payouts, setPayouts] = useState<IPayout[]>(initialPayouts?.data ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const reload = async (status = filter) => {
    const [list, recent] = await Promise.all([getPayouts(status), getPayoutCycles()]);
    setPayouts(list?.data?.data ?? []);
    if (Array.isArray(recent?.data)) setCycles(recent.data);
  };

  const act = async (p: IPayout, action: "approve" | "decline") => {
    if (!p.ledger_transaction_id) return;
    setBusy(p.uuid);
    try {
      const res =
        action === "approve"
          ? await approvePayouts([p.ledger_transaction_id])
          : await declinePayouts([p.ledger_transaction_id], reason.trim());
      const failures = batchFailures(res);
      if (!res?.status) toast.error(res?.message || "Couldn't update the payout");
      else if (failures.length) toast.error(batchFailureMessage(failures, 1));
      else toast.success(action === "approve" ? "Payout sent" : "Payout declined; the money is back in their earnings");
      setDeclining(null);
      setReason("");
      await reload();
    } catch {
      toast.error("Couldn't update the payout");
    } finally {
      setBusy(null);
    }
  };

  return (
    <CardBox>
      <h5 className="text-sm font-semibold text-dark dark:text-white">Automatic payouts</h5>

      {cycles.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-darklink">
                <th className="py-2 pr-4 font-medium">Cycle</th>
                <th className="py-2 pr-4 font-medium">Ended</th>
                <th className="py-2 pr-4 font-medium">Paid</th>
                <th className="py-2 pr-4 font-medium">Review</th>
                <th className="py-2 pr-4 font-medium">Sending</th>
                <th className="py-2 font-medium">Not paid</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr key={c.uuid} className="border-t border-ld">
                  <td className="py-2 pr-4 font-medium">
                    {LEVELS[c.level]} #{c.number}
                    {c.status !== "completed" && (
                      <span className="ml-2 text-xs text-darklink">({c.status})</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-darklink">{formatDate(c.ends_at)}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    {c.paid} · ${formatNumber(c.paid_usd)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{c.review}</td>
                  <td className="py-2 pr-4 tabular-nums">{c.in_progress}</td>
                  <td className="py-2 tabular-nums">{c.not_paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-2 text-xs text-darklink">No cycle has run yet.</p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">Payouts</p>
        <Select
          sizing="sm"
          value={filter}
          onChange={async (e) => {
            const value = e.target.value as PayoutStatus | "";
            setFilter(value);
            await reload(value);
          }}
          aria-label="Show payouts"
        >
          {FILTERS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-2 flex flex-col">
        {!payouts.length && <p className="py-6 text-center text-sm text-darklink">Nothing here.</p>}
        {payouts.map((p) => (
          <div key={p.uuid} className="flex flex-wrap gap-x-4 gap-y-2 items-center border-b border-ld py-2.5">
            <div className="flex flex-col min-w-0 shrink">
              <h5 className="text-sm font-medium truncate">{p.user?.name || "Unknown"}</h5>
              <p className="text-xs text-darklink truncate">
                @{p.user?.username} · {LEVELS[p.verification_level]} #{p.cycle.number} · ID {p.number}
              </p>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tabular-nums">
                ${formatNumber(p.amount_usd)}
                {p.payout_ngn != null && (
                  <span className="ml-1 text-xs font-normal text-darklink">₦{formatNumber(p.payout_ngn)}</span>
                )}
              </span>
              <span className="text-xs text-darklink truncate">{accountOf(p)}</span>
            </div>
            <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_TONE[p.status]}`}>
              {p.status}
            </span>
            {p.status === "review" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="light"
                  className="h-8"
                  disabled={busy === p.uuid}
                  onClick={() => setDeclining(declining === p.uuid ? null : p.uuid)}
                >
                  Decline
                </Button>
                <Button size="sm" color="success" className="h-8" disabled={busy === p.uuid} onClick={() => act(p, "approve")}>
                  {busy === p.uuid ? "Working…" : "Approve and send"}
                </Button>
              </div>
            )}
            {(p.review_reason || p.failure_reason) && (
              <p className="basis-full text-xs text-darklink">
                {p.status === "review" ? `Why: ${p.review_reason}` : p.failure_reason}
              </p>
            )}
            {declining === p.uuid && (
              <div className="basis-full flex flex-wrap gap-2 items-center">
                <input
                  className="flex-1 min-w-[200px] rounded-md border border-ld bg-transparent px-2 py-1 text-sm"
                  placeholder="Reason (shown in the audit log)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <Button
                  size="sm"
                  color="failure"
                  className="h-8"
                  disabled={!reason.trim() || busy === p.uuid}
                  onClick={() => act(p, "decline")}
                >
                  Decline and return the money
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </CardBox>
  );
};

export default AutoPayouts;
