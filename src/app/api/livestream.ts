'use server'

import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';


export const getLivestreamStats = async () => {
    const token = await getToken()
    return await apiGet<ILivestreamStats>(
        `livestream/stats`,
        token
    );
};


export const getLivestreams = async (page: number = 1, limit: number = 10) => {
    const token = await getToken()
    return await apiGet<ILivestreamResponse>(
        `livestream?page=${page}&limit=${limit}`,
        token
    );
};

// Category CRUD
export const getLivestreamCategories = async () => {
    const token = await getToken();
    return await apiGet<ILivestreamCategory[]>(
        `livestream/categories`,
        token
    );
};

export const getTopPerformanceCategories = async () => {
    const token = await getToken();
    return await apiGet<ITopPerformanceCategory[]>(
        `livestream/categories/top`,
        token
    );
};

export const addLivestreamCategory = async (name: string, description: string, icon: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");

    const response = await apiPost(
        `livestream/categories/add`,
        { name, description, icon },
        token
    );

    if (response.status) {
        await revalidateCurrentPath();
    }
    return response;
};

export const updateLivestreamCategory = async (categoryId: number, data: { name?: string; description?: string; icon?: string }) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");

    const body: { name?: string; description?: string; icon?: string } = {};
    if (data.name) body.name = data.name;
    if (data.icon) body.icon = data.icon;
    if (data.description) body.description = data.description;

    const response = await apiPut(
        `livestream/categories/${categoryId}`,
        body,
        token
    );
    if (response.status) {
        await revalidateCurrentPath();
    }
    return response;
};

export const deleteLivestreamCategory = async (categoryId: number) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");
    const response = await apiDelete(
        `livestream/categories/${categoryId}`,
        token
    );
    if (response.status) {
        await revalidateCurrentPath();
    }
    return response;
};



