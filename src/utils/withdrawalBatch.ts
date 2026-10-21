// Approve and decline answer per withdrawal: the request succeeds even when
// some (or all) of the withdrawals in it were refused.
export type WithdrawalBatchResult = {
    successful?: unknown[];
    failed?: { id: string; error: string }[];
};

export const batchFailures = (response?: ApiResponse<any>) =>
    ((response?.data as WithdrawalBatchResult | undefined)?.failed ?? []);

export const batchFailureMessage = (
    failures: { error: string }[],
    total: number,
) =>
    total > 1
        ? `${failures.length} of ${total} not processed: ${failures[0].error}`
        : failures[0].error;
