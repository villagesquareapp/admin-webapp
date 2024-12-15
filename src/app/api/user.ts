'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getUserStats = async () => {
    const token = await getToken()
    return await apiGet<IUserstat>(
        `users/stats`,
        token
    );
};

export const getUsers = async (page: number = 1, limit: number = 10) => {
    const token = await getToken()
    return await apiGet<IUsersResponse>(
        `users?page=${page}&limit=${limit}`,
        token
    );
};

