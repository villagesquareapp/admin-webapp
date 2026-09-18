'use server'

import { apiGet, apiPost } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getUserStats = async (month?: string) => {
    const token = await getToken()
    return await apiGet<IUserstat>(
        `users/stats`,
        token
    );
};

export const getVerifiedUserStats = async () => {
    const token = await getToken()
    return await apiGet<IVerifiedUserstat>(
        `users/verified/stats`,
        token
    );
};

export const getUserOverview = async () => {
    const token = await getToken();
    return await apiGet<IUserOverview>(`users/overview`, token);
};

export const getUsers = async (
    page: number = 1,
    limit: number = 20,
    filters: { search?: string; status?: string; account_type?: string } = {}
) => {
    const token = await getToken();
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.account_type) queryParams.append("account_type", filters.account_type);

    return await apiGet<IUsersResponse>(
        `users?${queryParams.toString()}`,
        token
    );
};


export const getUserDetails = async (id: string) => {
    const token = await getToken();
    return await apiGet<IUserDetail>(
        `users/${id}`,
        token
    );
};

export const getRandomUsers = async (page: number = 1, limit: number = 10) => {
    const token = await getToken();
    return await apiGet<IRandomUsers[]>(
        `users/random?page=${page}&limit=${limit}`,
        token
    );
}

export const getSearchUser = async (search: string) => {
    const token = await getToken();
    return await apiGet<IRandomUsers[]>(`users/search?q=${search}`, token)
}

export const getUserStatus = async () => {
    const token = await getToken();
    return await apiGet<IUserStatusList[]>(`users/user-status-list`, token);
}

export const updateUserStatus = async (userId: string, status: string) => {
    const token = await getToken();
    const response = await apiPost(
        `users/${userId}/update-status`,
        { status },
        token
    );

    if (response.status) {
        await revalidateCurrentPath();
    }

    return response;
};

export const getVerifiedUsers = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IVerifiedUsersResponse>(
        `users/verified?page=${page}&limit=${limit}`,
        token
    );
};

