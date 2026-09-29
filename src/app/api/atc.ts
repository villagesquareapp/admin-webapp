'use server'

import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

// ---- Episodes ----
export const getATCEpisodes = async (page: number = 1, limit: number = 20) => {
    const token = await getToken();
    return await apiGet<IATCEpisodesResponse>(
        `africa-talent-challenge/episodes?page=${page}&limit=${limit}`,
        token,
    );
};

export const getATCEpisode = async (uuid: string) => {
    const token = await getToken();
    return await apiGet<IATCEpisode>(`africa-talent-challenge/episodes/${uuid}`, token);
};

export const createATCEpisode = async (payload: IATCEpisodePayload) => {
    const token = await getToken();
    const r = await apiPost(`africa-talent-challenge/episodes`, payload, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const updateATCEpisode = async (uuid: string, payload: Partial<IATCEpisodePayload> & { winner_id?: string }) => {
    const token = await getToken();
    const r = await apiPatch(`africa-talent-challenge/episodes/${uuid}`, payload, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const deleteATCEpisode = async (uuid: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiDelete(`africa-talent-challenge/episodes/${uuid}`, token);
    if (r?.status) await revalidateCurrentPath();
    return r;
};

// ---- Applications / contestants ----
export const getATCApplication = async (uuid: string) => {
    const token = await getToken();
    return await apiGet<IATCApplication>(`africa-talent-challenge/applications/${uuid}`, token);
};

export const updateATCApplicationStatus = async (uuid: string, status: string, reason?: string) => {
    const token = await getToken();
    const r = await apiPatch(`africa-talent-challenge/applications/${uuid}/status`, { status, reason }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const getATCContestants = async (episodeId?: string, page: number = 1, limit: number = 20) => {
    const token = await getToken();
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (episodeId) q.append('episode_id', episodeId);
    return await apiGet<IATCApplicationsResponse>(`africa-talent-challenge/contestants?${q.toString()}`, token);
};

// ---- Suggestions ----
export const generateATCSuggestions = async (month?: string) => {
    const token = await getToken();
    const r = await apiPost(`africa-talent-challenge/suggestions/generate${month ? `?month=${month}` : ''}`, {}, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const rejectATCSuggestion = async (uuid: string) => {
    const token = await getToken();
    const r = await apiPatch(`africa-talent-challenge/suggestions/${uuid}/reject`, {}, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const deleteATCSuggestions = async (month: string) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiDelete(`africa-talent-challenge/suggestions?month=${encodeURIComponent(month)}`, token);
    if (r?.status) await revalidateCurrentPath();
    return r;
};


export const getATCStats = async (period?: string) => {
    const token = await getToken();
    const queryParams = new URLSearchParams();
    if (period) {
        queryParams.append('period', period);
    }

    return await apiGet<IAtcStats>(
        `africa-talent-challenge/statistics${period ? `?${queryParams.toString()}` : ''}`,
        token
    );
};

export const getATCPeriods = async () => {
    const token = await getToken();
    return await apiGet<IATCPeriodsResponse>(
        `africa-talent-challenge/periods`,
        token
    );
};

export const getATCApplications = async (
    period: string = "",
    status: string = "",
    search: string = "",
    page: number = 1,
    limit: number = 20
) => {
    const token = await getToken();
    const queryParams = new URLSearchParams({
        period,
        status,
        search,
        page: page.toString(),
        limit: limit.toString(),
    });

    return await apiGet<IATCApplicationsResponse>(
        `africa-talent-challenge/applications?${queryParams.toString()}`,
        token
    );
};

export const getLeaderboard = async (period?: string) => {
    const token = await getToken();
    const queryParams = new URLSearchParams();
    if (period) {
        queryParams.append('period', period);
    }
    return await apiGet<ILeaderboardResponse>(
        `africa-talent-challenge/leaderboard${period ? `?${queryParams.toString()}` : ''}`,
        token
    );
};

export const reviewATCApplication = async (uuid: string) => {
    const token = await getToken();
    return await apiPatch<any>(
        `africa-talent-challenge/applications/${uuid}/review`,
        {},
        token
    );
};

export const approveATCApplication = async (uuid: string) => {
    const token = await getToken();
    return await apiPatch<any>(
        `africa-talent-challenge/applications/${uuid}/approve`,
        {},
        token
    );
};

export const declineATCApplication = async (uuid: string) => {
    const token = await getToken();
    return await apiPatch<any>(
        `africa-talent-challenge/applications/${uuid}/decline`,
        {},
        token
    );
};

export const getATCSuggestions = async () => {
    const token = await getToken();
    const res = await apiGet<any>(`africa-talent-challenge/suggestions`, token);
    // Normalise the backend's inconsistent shape: older responses return a single
    // `suggestion` (the approved one) instead of a `suggestions` array.
    if (res?.data && !Array.isArray(res.data.suggestions)) {
        res.data.suggestions = res.data.suggestion ? [res.data.suggestion] : [];
    }
    return res as { status: boolean; message: string; data: IATCData } | null;
};

export const approveATCSuggestion = async (uuid: string) => {
    const token = await getToken();
    return await apiPatch<any>(
        `africa-talent-challenge/suggestions/${uuid}/approve`,
        {},
        token
    );
};

export const getATCSettings = async () => {
    const token = await getToken();
    return await apiGet<IATCSettings>(`africa-talent-challenge/settings`, token);
};

export const updateATCSettings = async (payload: Partial<IATCSettings>) => {
    const token = await getToken();
    const r = await apiPatch(`africa-talent-challenge/settings`, payload, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const getATCChallengeInfo = async (period?: string) => {
    const token = await getToken();
    const queryParams = new URLSearchParams();
    if (period) {
        queryParams.append('period', period);
    }
    return await apiGet<IATCChallengeInfo>(
        `africa-talent-challenge/challenge-info${period ? `?${queryParams.toString()}` : ''}`,
        token
    );
};