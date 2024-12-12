'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getPostStats = async () => {
    const token = await getToken()
    return await apiGet<IPosts>(
        `posts/stats`,
        token
    );
};

