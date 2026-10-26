"use server";

import { apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getCowryBalance = async () => {
  const token = await getToken();
  return await apiGet<ICowryBalance>(`wallet/balance/villagesquare`, token);
};

export const getFlutterwaveBalance = async () => {
  const token = await getToken();
  return await apiGet<IFlutterwaveBalance>(`wallet/balance/flutterwave`, token);
};

export const getRecentTransfers = async (
  page: number = 1,
  limit: number = 10
) => {
  const token = await getToken();
  return await apiGet<IRecentTransferResponse>(
    `wallet/cowry/transfer/transactions?page=${page}&limit=${limit}`,
    token
  );
};

export const getPayoutQueue = async (
  page: number = 1,
  limit: number = 20
) => {
  const token = await getToken();
  return await apiGet<IPayoutQueueResponse>(
    `wallet/payouts/queue?page=${page}&limit=${limit}`,
    token
  );
};

export const approvePayouts = async (transactionIds: string[]) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/payouts/approve`,
    {
      transaction_ids: transactionIds,
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const declinePayouts = async (
  transactionIds: string[],
  reason: string
) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/payouts/decline`,
    {
      transaction_ids: transactionIds,
      reason,
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getExchangeRate = async (amount: number) => {
  const token = await getToken();
  return await apiGet<IGetExchangeRate>(
    `wallet/exchange-rate-equivalent?amount=${amount}`,
    token
  );
}

export const getCowryTopupMetadata = async () => {
  const token = await getToken();
  return await apiGet<IGetCowryTopupMetadata>(`wallet/cowry/topup/metadata`, token)
}

// A POST: it credits the treasury (VS-ADM-017).
export const verifyCowryTransaction = async (transactionId: string) => {
  const token = await getToken();
  return await apiPost<{ credited: boolean; amount: number }>(
    `wallet/cowry/topup/verify-transaction/${encodeURIComponent(transactionId)}`,
    {},
    token
  );
};

export const transferCowry = async (
  userIds: string[],
  amount: number = 20000,
  transferId?: string
) => {
  const token = await getToken();
  const response = await apiPost<ICowryTransferResult>(
    `wallet/cowry/transfer`,
    {
      user_ids: userIds,
      amount,
      transfer_id: transferId,
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getPayoutHolds = async (
  status: "active" | "released" | "all" = "active",
  page: number = 1,
  limit: number = 10
) => {
  const token = await getToken();
  return await apiGet<IPayoutHoldsResponse>(
    `wallet/payout-holds?status=${status}&page=${page}&limit=${limit}`,
    token
  );
};

export const releasePayoutHold = async (uuid: string) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/payout-holds/${encodeURIComponent(uuid)}/release`,
    {},
    token
  );
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getPayoutsNeedingAttention = async (
  page: number = 1,
  limit: number = 50
) => {
  const token = await getToken();
  return await apiGet<IPayoutAttentionResponse>(
    `wallet/payouts/attention?page=${page}&limit=${limit}`,
    token
  );
};

export const requeuePayouts = async (transactionIds: string[]) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/payouts/requeue`,
    { transaction_ids: transactionIds },
    token
  );
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getMissingLegacyTransfers = async () => {
  const token = await getToken();
  return await apiGet<ILegacyTransferReport>(
    `wallet/cowry/transfer/legacy-missing`,
    token
  );
};

export const applyMissingLegacyTransfers = async (legacyIds?: string[]) => {
  const token = await getToken();
  const response = await apiPost<{ credited: number; cowries: number }>(
    `wallet/cowry/transfer/legacy-missing/apply`,
    legacyIds ? { legacy_transaction_ids: legacyIds } : {},
    token
  );
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getPayoutSettings = async () => {
  const token = await getToken();
  return await apiGet<IPayoutSettings>(`wallet/payouts/settings`, token);
};

export const updatePayoutSettings = async (body: IPayoutSettingsUpdate) => {
  const token = await getToken();
  const response = await apiPut<IPayoutSettings>(
    `wallet/payouts/settings`,
    body,
    token as string
  );
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const getPayouts = async (
  status: PayoutStatus | "" = "",
  page: number = 1,
  limit: number = 20
) => {
  const token = await getToken();
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set("status", status);
  return await apiGet<IPayoutsResponse>(`wallet/payouts?${query}`, token);
};

export const getPayoutCycles = async (limit: number = 12) => {
  const token = await getToken();
  return await apiGet<IPayoutCycle[]>(`wallet/payouts/cycles?limit=${limit}`, token);
};
