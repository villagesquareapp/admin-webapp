'use server'

import { apiGet, apiPut } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

// Generic report resolution — works for every report service type.
export const resolveReport = async (
    id: string,
    reason: string,
    resolution_methods: string[]
) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut(`reports/${id}/resolve`, { reason, resolution_methods }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const dismissReport = async (id: string, reason: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut(`reports/${id}/dismiss`, { reason }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const getReportStats = async () => {
    const token = await getToken()
    return await apiGet<IReportStats>(
        `reports/stats`,
        token
    );
};

export const getAllReports = async (
    page: number = 1,
    limit: number = 20,
    service?: string,
    type?: string
) => {
    const token = await getToken();

    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
    });

    if (service) {
        params.append('service', service);
    }

    if (type) {
        params.append('type', type);
    }

    return await apiGet<IReportResponse>(
        `reports/service?${params.toString()}`,
        token
    );
};

