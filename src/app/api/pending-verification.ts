'use server'

import { apiGet, apiPatch } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getPendingVerification = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPendingVerificationResponse>(
        `verification/pending-users?page=${page}&limit=${limit}`,
        token
    );
};

export const approvePendingVerification = async (id: string) => {
    const token = await getToken()
    return await apiPatch<ApiResponse>(
        `verification/approve-user/${id}`,
        {},
        token
    );
};

export const declinePendingVerification = async (id: string, data: { adminComments: string }) => {
    const token = await getToken()
    return await apiPatch<ApiResponse>(
        `verification/reject-user/${id}`,
        data,
        token
    );
};

