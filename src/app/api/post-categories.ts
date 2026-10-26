'use server'

import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

type PostCategoryChanges = Partial<Pick<IPostCategory, 'name' | 'description' | 'icon' | 'is_anonymous' | 'is_enabled'>>;

// type is "general" or a Trybe type uuid; nothing lists every category.
export const getPostCategories = async (type?: string) => {
    const token = await getToken();
    const q = type ? `?${new URLSearchParams({ type })}` : '';
    return await apiGet<IPostCategory[]>(`post-categories${q}`, token);
};

// No trybe_type_id creates a General category.
export const addPostCategory = async (
    payload: PostCategoryChanges & { name: string; slug?: string; trybe_type_id?: string }
) => {
    const token = await getToken();
    return await apiPost<IPostCategory>(`post-categories`, payload, token);
};

export const updatePostCategory = async (id: number, data: PostCategoryChanges) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");
    return await apiPatch<IPostCategory>(`post-categories/${id}`, data, token);
};

// ids is the whole list, first to last.
export const reorderPostCategories = async (type: string, ids: number[]) => {
    const token = await getToken();
    if (!token) throw new Error("No token found");
    const r = await apiPut<IPostCategory[]>(`post-categories/order`, { type, ids }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};
