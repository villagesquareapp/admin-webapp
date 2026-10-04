'use server'

import { apiGet, apiPut } from '@/lib/api';
import { baseApiCall } from '@/lib/api/base';
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

// A report with what it is about (an anonymous post's real author included)
// and its Trybe.
export const getReport = async (id: string) => {
    const token = await getToken();
    return apiGet<IReportDetail>(`reports/${encodeURIComponent(id)}`, token);
};

// Fetched only when staff open them: 5-minute links, each opening logged.
export const getReportScreenshots = async (id: string) => {
    const token = await getToken();
    return baseApiCall<{ links: (string | null)[]; expires_in: number }>(
        'GET',
        `reports/${encodeURIComponent(id)}/attachments`,
        { cache: 'no-store' },
        token
    );
};

// An anonymous post's original uploads (before location and device details
// were removed): 5-minute links, each opening logged.
export const getPostOriginals = async (postId: string) => {
    const token = await getToken();
    return baseApiCall<{
        originals: { media_id: string; media_type: string; url: string | null }[];
        expires_in: number;
    }>('GET', `posts/${encodeURIComponent(postId)}/private-originals`, { cache: 'no-store' }, token);
};
