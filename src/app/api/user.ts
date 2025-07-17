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

export const getUsers = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IUsersResponse>(
        `users?page=${page}&limit=${limit}`,
        token
    );
};


export const getUserDetails = async (id: string) => {
    const token = await getToken();
    return await apiGet<IUsersResponse>(
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