'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getMarketSquareStats = async () => {
    const token = await getToken()
    return await apiGet<IMarketSquares>(
        `marketsquare/stats`,
        token
    );
};

