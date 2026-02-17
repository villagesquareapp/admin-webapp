'use server'

import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';


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
    return await apiGet<IATCData>(
        `africa-talent-challenge/suggestions`,
        token
    );
};

export const approveATCSuggestion = async (uuid: string) => {
    const token = await getToken();
    return await apiPatch<any>(
        `africa-talent-challenge/suggestions/${uuid}/approve`,
        {},
        token
    );
};

export const getATCChallengeInfo = async () => {
    const token = await getToken();
    return await apiGet<IATCChallengeInfo>(
        `africa-talent-challenge/challenge-info`,
        token
    );
};