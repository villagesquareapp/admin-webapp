// Approve and decline answer per payout: the request succeeds even when
// some (or all) of the payouts in it were refused.
export type PayoutBatchResult = {
    successful?: unknown[];
    failed?: { id: string; error: string }[];
};

export const batchFailures = (response?: ApiResponse<any>) =>
    ((response?.data as PayoutBatchResult | undefined)?.failed ?? []);

export const batchFailureMessage = (
    failures: { error: string }[],
    total: number,
) =>
    total > 1
        ? `${failures.length} of ${total} not processed: ${failures[0].error}`
        : failures[0].error;

// Why a queued payout can't be sent right now; the Admin API refuses it too
// (VS-ADM-015).
export const payoutBlock = (
    payout: Pick<IQueuedPayout, "account_frozen" | "payout_hold">,
): string | null =>
    payout.account_frozen
        ? "Account frozen"
        : payout.payout_hold
          ? `Payouts on hold: ${payout.payout_hold.reason}`
          : null;
