'use server'

import { apiGet, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getPendingWithdrawals = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPendingWithdrawalsResponse>(
        `wallet/pending-withdrawals?page=${page}&limit=${limit}`,
        token
    );
};

export const approveWithdrawal = async (transactionId: string) => {
    const token = await getToken()
    const response = await apiPost(`wallet/withdraw/approve/${transactionId}`, {}, token)
    if (response.status) {
        await revalidateCurrentPath()
    }
    return response
}

export const declineWithdrawal = async (transactionId: string) => {
    const token = await getToken()
    const response = await apiPost(`wallet/withdraw/reject/${transactionId}`, {}, token)
    if (response.status) {
        await revalidateCurrentPath()
    }
    return response
}
