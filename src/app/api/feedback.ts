'use server'

import { apiGet, apiPut, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getFeedbackStats = async () => {
    const token = await getToken();
    return await apiGet<IFeedbackStats>(`feedback/stats`, token);
};

export const getFeedbackSessions = async (
    page: number = 1,
    limit: number = 20,
    filters: { type?: string; status?: string; reviewed?: string; converted?: string; search?: string } = {},
) => {
    const token = await getToken();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.reviewed) params.append('reviewed', filters.reviewed);
    if (filters.converted) params.append('converted', filters.converted);
    if (filters.search) params.append('search', filters.search);
    return await apiGet<IFeedbackResponse>(`feedback?${params.toString()}`, token);
};

// A session with its full transcript.
export const getFeedbackSession = async (id: string) => {
    const token = await getToken();
    return await apiGet<IFeedbackSessionDetail>(`feedback/${encodeURIComponent(id)}`, token);
};

export const setFeedbackReviewed = async (id: string, reviewed: boolean) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPut(`feedback/${encodeURIComponent(id)}/review`, { reviewed }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

// Open a ticket from the session; returns { ticket_id }.
export const convertFeedbackToTicket = async (id: string, category_id?: number) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPost<{ ticket_id: string }>(
        `feedback/${encodeURIComponent(id)}/convert`,
        category_id ? { category_id } : {},
        token,
    );
    if (r.status) await revalidateCurrentPath();
    return r;
};
