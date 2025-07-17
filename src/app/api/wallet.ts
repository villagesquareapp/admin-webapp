"use server";

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getPaystackBalance = async () => {
  const token = await getToken();
  return await apiGet<IPaystackBalance>(`wallet/balance/paystack`, token);
};

export const getCowryBalance = async () => {
  const token = await getToken();
  return await apiGet<ICowryBalance>(`wallet/balance/villagesquare`, token);
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

export const getPendingWithdrawals = async (
  page: number = 1,
  limit: number = 20
) => {
  const token = await getToken();
  return await apiGet<IPendingWithdrawalsResponse>(
    `wallet/pending-withdrawals?page=${page}&limit=${limit}`,
    token
  );
};

export const approveWithdrawal = async (transactionIds: string[]) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/withdraw/approve`,
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

export const declineWithdrawal = async (
  transactionIds: string[],
  reason: string
) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/withdraw/reject`,
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

export const transferCowry = async (userIds: string[], amount: number = 5000) => {
  const token = await getToken();
  const response = await apiPost(
    `wallet/cowry/transfer`,
    {
      user_ids: userIds,
      amount
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};