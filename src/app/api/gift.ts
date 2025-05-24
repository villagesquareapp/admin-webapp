'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';


export const getGifts = async () => {
    const token = await getToken()
    return await apiGet<any>(
        `gifting`,
        token
    );
};





