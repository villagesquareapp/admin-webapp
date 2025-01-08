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

export const getPosts = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPostResponse>(
        `posts?page=${page}&limit=${limit}`,
        token
    );
};

export const getSinglePost = async (uuid: string) => {
    const token = await getToken()
    return await apiGet<ISinglePost>(
        `posts/${uuid}`,
        token
    );
};
