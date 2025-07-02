'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getEchoStats = async () => {
    const token = await getToken()
    return await apiGet<IEchoStats>(
        `echos/stats`, 
        token
    );
};

export const getEchoes = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IEchosResponse>(
        `echos?page=${page}&limit=${limit}`,
        token
    );
};
