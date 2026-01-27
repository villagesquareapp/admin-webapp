'use server'

import { apiGet, apiPost } from '@/lib/api';
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

export const getLeaderboard = async () => {
    const token = await getToken();
    return await apiGet<ILeaderboardResponse>(
        `africa-talent-challenge/leaderboard`,
        token
    );
};