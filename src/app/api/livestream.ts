'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getLiveStreamStats = async () => {
    const token = await getToken()
    return await apiGet<ILivestreams>(
        `livestream/stats`,
        token
    );
};

