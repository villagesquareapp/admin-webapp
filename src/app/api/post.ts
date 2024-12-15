'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getPostStats = async () => {
    const token = await getToken()
    return await apiGet<IPostStats>(
        `posts/stats`,
        token
    );
};

export const getPosts = async () => {
    const token = await getToken()
    return await apiGet<IPostResponse>(
        `posts`,
        token
    );
};
