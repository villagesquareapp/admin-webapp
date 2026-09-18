'use server'

import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getEchoStats = async () => {
    const token = await getToken();
    return await apiGet<IEchoStats>(`echo/stats`, token);
};

export const getEchoOverview = async () => {
    const token = await getToken();
    return await apiGet<IEchoOverview>(`echo/overview`, token);
};

export const getEchoes = async (
    page: number = 1,
    limit: number = 20,
    filters: { status?: string; search?: string; category?: string } = {}
) => {
    const token = await getToken();
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.status) q.append('status', filters.status);
    if (filters.search) q.append('search', filters.search);
    if (filters.category) q.append('category', filters.category);
    return await apiGet<IEchosResponse>(`echo?${q}`, token);
};

export const getEchoDetail = async (echoId: string) => {
    const token = await getToken();
    return await apiGet<IEchoDetail>(`echo/${echoId}`, token);
};

export const getEchoStatusList = async () => {
    const token = await getToken();
    return await apiGet<IEchoStatusList[]>(`echo/echo-status-list`, token);
};

export const forceEndEcho = async (echoId: string) => {
    const token = await getToken();
    const r = await apiPost(`echo/${echoId}/force-end`, {}, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const getEchoCategories = async () => {
    const token = await getToken();
    return await apiGet<IEchoCategory[]>(`echo/categories`, token);
};

export const addEchoCategory = async (payload: { name: string; icon?: string }) => {
    const token = await getToken();
    const r = await apiPost(`echo/categories/add`, payload, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const deleteEchoCategory = async (categoryId: number) => {
    const token = await getToken();
    if (!token) return null;
    const r = await apiDelete(`echo/categories/${categoryId}`, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};
