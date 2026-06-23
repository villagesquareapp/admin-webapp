'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
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

export const addLivestreamCategory = async (name: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");
    const response = await apiPost(
        `livestream/categories/add`,
        { name },
        token
    );
    if (response.status) {
        await revalidateCurrentPath();
    }
    return response;
};

export const updateLivestreamCategory = async (categoryId: number, name: string) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");
    const response = await apiPatch(
        `livestream/categories/${categoryId}/update`,
        { name },
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



