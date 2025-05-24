'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';

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

