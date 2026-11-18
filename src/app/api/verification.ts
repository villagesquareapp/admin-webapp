'use server'

import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getVerificationStats = async () => {
    const token = await getToken();
    return apiGet<IVerificationStats>('verification/stats', token);
};

// status: pending (oldest first), approved or rejected.
export const getVerificationRequests = async (
    filters: { status?: string; search?: string; page?: number; limit?: number } = {}
) => {
    const token = await getToken();
    const params = new URLSearchParams({
        page: String(filters.page || 1),
        limit: String(filters.limit || 20),
    });
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    return apiGet<IPendingVerificationResponse>(`verification/requests?${params}`, token);
};

// state: active, expiring (within 7 days), ended or revoked;
// source: paid or granted; badge: greencheck or premium.
export const getVerifiedAccounts = async (
    filters: { state?: string; source?: string; badge?: string; search?: string; page?: number; limit?: number } = {}
) => {
    const token = await getToken();
    const params = new URLSearchParams({
        page: String(filters.page || 1),
        limit: String(filters.limit || 20),
    });
    for (const key of ['state', 'source', 'badge', 'search'] as const) {
        if (filters[key]) params.set(key, filters[key]!);
    }
    return apiGet<IVerifiedAccountsResponse>(`verification/subscribers?${params}`, token);
};

// Either `days` from now or an exact `ends_at`.
export const grantVerification = async (input: {
    user_ids: string[];
    badge: 'greencheck' | 'premium';
    days?: number;
    ends_at?: string;
    note?: string;
}) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPost<IGrantVerificationResult>('verification/grants', input, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const changeGrantEnd = async (id: string, ends_at: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPatch<{ subscription_id: string; ends_at: string }>(
        `verification/grants/${encodeURIComponent(id)}`,
        { ends_at },
        token
    );
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const revokeGrant = async (id: string, reason?: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiPost<{ subscription_id: string; verification_badge: string }>(
        `verification/grants/${encodeURIComponent(id)}/revoke`,
        { reason: reason || undefined },
        token
    );
    if (r.status) await revalidateCurrentPath();
    return r;
};
