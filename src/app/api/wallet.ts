'use server'

import { apiGet, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getPendingWithdrawals = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPendingWithdrawalsResponse>(
        `wallet/pending-withdrawals?page=${page}&limit=${limit}`,
        token
    );
};

export const approveWithdrawal = async (transactionId: string) => {
    const token = await getToken()
    return await apiPost(`wallet/approve-withdrawal/${transactionId}`, {}, token)
}

export const declineWithdrawal = async (transactionId: string) => {
    const token = await getToken()
    return await apiPost(`wallet/decline-withdrawal/${transactionId}`, {}, token)
}
