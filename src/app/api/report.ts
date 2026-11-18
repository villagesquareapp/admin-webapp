'use server'

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/lib/api';
import { baseApiCall } from '@/lib/api/base';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

// Generic report resolution — works for every report service type.
// `reason` is staff's own note (never sent to anyone); `duration_days` is
// for a suspension or restriction.
export const resolveReport = async (
    id: string,
    reason: string,
    resolution_methods: string[],
    duration_days?: number
) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut<IReportResolveResult>(
        `reports/${id}/resolve`,
        { reason: reason || undefined, resolution_methods, duration_days },
        token
    );
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

// handled_by: 'me' for the reports you're reviewing or closed.
export const getAllReports = async (
    page: number = 1,
    limit: number = 20,
    service?: string,
    status?: string,
    filters: { reason_id?: string; handled_by?: string } = {}
) => {
    const token = await getToken();

    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
    });

    if (service) {
        params.append('service', service);
    }

    if (status) {
        params.append('status', status);
    }
    if (filters.reason_id) params.append('reason_id', filters.reason_id);
    if (filters.handled_by) params.append('handled_by', filters.handled_by);

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

// Taking a report for review, handing it back, and reopening a dismissed one.
const reportStep = async (id: string, step: 'review' | 'release' | 'reopen', body: object = {}) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut<{ status: string; handled_by: string | null }>(
        `reports/${encodeURIComponent(id)}/${step}`,
        body,
        token
    );
    if (r.status) await revalidateCurrentPath();
    return r;
};
export const startReportReview = async (id: string) => reportStep(id, 'review');
export const releaseReportReview = async (id: string) => reportStep(id, 'release');
export const reopenReport = async (id: string, reason?: string) =>
    reportStep(id, 'reopen', { reason: reason || undefined });

// The reasons the app's report sheet offers.
export const getReportReasons = async () => {
    const token = await getToken();
    return apiGet<IReportReason[]>('reports/reasons', token);
};

export type ReportReasonInput = {
    title?: string;
    description?: string;
    service_type?: string | null;
    is_active?: boolean;
};

export const createReportReason = async (input: ReportReasonInput) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPost<IReportReason>('reports/reasons', input, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const updateReportReason = async (id: string, input: ReportReasonInput) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPatch<IReportReason>(`reports/reasons/${encodeURIComponent(id)}`, input, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

// Every reason of one list, in the new order.
export const reorderReportReasons = async (ids: string[]) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut<IReportReason[]>('reports/reasons/order', { ids }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const deleteReportReason = async (id: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiDelete(`reports/reasons/${encodeURIComponent(id)}`, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};
