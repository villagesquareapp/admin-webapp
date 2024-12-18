'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getLivestreamStats = async () => {
    const token = await getToken()
    return await apiGet<ILivestreamStats>(
        `livestream/stats`,
        token
    );
};

export const getLivestreams = async (page: number = 1, limit: number = 10) => {
    const token = await getToken()
    return await apiGet<ILivestreamResponse>(
        `livestream?page=${page}&limit=${limit}`,
        token
    );
};



