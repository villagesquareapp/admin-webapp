'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getReportStats = async () => {
    const token = await getToken()
    return await apiGet<IReportStats>(
        `reports/stats`,
        token
    );
};

// export const getTickets = async (page: number = 1, limit: number = 20) => {
//     const token = await getToken()
//     // return await apiGet<ITicketsResponse>(
//     return await apiGet<any>(
//         `tickets?page=${page}&limit=${limit}`,
//         token
//     );
// };

