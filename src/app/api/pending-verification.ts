'use server'

import { apiGet, apiPatch } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getPendingVerification = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPendingVerificationResponse>(
        `verification/requests`,
        token
    );
};

export const getVerificationRequested = async (id: string) => {
    const token = await getToken()
    return await apiGet<IVerificationRequestedResponse>(
        `verification/requests/${id}`,
        token
    );
};

export const approvePendingVerification = async (id: string) => {
    const token = await getToken()
    return await apiPatch<ApiResponse>(
        `verification/requests/${id}/approve`,
        {},
        token
    );
};

export const declinePendingVerification = async (id: string, data: { adminComments: string }) => {
    const token = await getToken()
    return await apiPatch<ApiResponse>(
        `verification/requests/${id}/reject`,
        data,
        token
    );
};

