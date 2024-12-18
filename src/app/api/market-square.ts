'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getMarketSquareStats = async () => {
    const token = await getToken()
    return await apiGet<IMarketSquareStats>(
        `marketsquare/stats`,
        token
    );
};

export const getMarketSquareShops = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IMarketSquareShopsResponse>(
        `marketsquare/shops?page=${page}&limit=${limit}`,
        token
    );
};