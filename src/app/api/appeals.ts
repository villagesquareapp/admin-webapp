'use server'

import { apiGet, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export type AppealFilter = 'pending' | 'decided' | 'all';

export const getAppeals = async (status: AppealFilter = 'pending', page = 1, limit = 20) => {
    const token = await getToken();
    if (!token) return null;
    return await apiGet<IAppealsPage>(`appeals?status=${status}&page=${page}&limit=${limit}`, token);
};

// Uphold keeps the suspension; overturn reinstates the account. The person is
// emailed either way. `note` is staff's own, for the audit trail.
export const decideAppeal = async (id: string, decision: 'uphold' | 'overturn', note?: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPost<IAppeal>(`appeals/${id}/decide`, { decision, note: note?.trim() || undefined }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

// The guidelines a suspension or ban can name (the person sees it in the app).
export const getGuidelineReasons = async () => {
    const token = await getToken();
    if (!token) return null;
    return await apiGet<IGuidelineReason[]>(`appeals/guideline-reasons`, token);
};
