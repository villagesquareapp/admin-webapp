'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getTicketStats = async () => {
    const token = await getToken()
    return await apiGet<ITicketstat>(
        `tickets/stats`,
        token
    );
};

export const getTickets = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<ITicketResponse>(
        `tickets?page=${page}&limit=${limit}`,
        token
    );
};

