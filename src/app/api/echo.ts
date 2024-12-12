'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getEchoStats = async () => {
    const token = await getToken()
    return await apiGet<IEchos>(
        `echos/stats`,
        token
    );
};

