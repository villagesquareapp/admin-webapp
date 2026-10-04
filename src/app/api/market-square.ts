'use server'

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';

export const getMarketSquareStats = async () => {
    const token = await getToken()
    return await apiGet<IMarketSquareStats>(`marketsquare/stats`, token);
};

export const getMarketSquareOverview = async () => {
    const token = await getToken()
    return await apiGet<IMarketOverview>(`marketsquare/overview`, token);
};

// type: "general", a Trybe type uuid, or omitted for every category.
export const getMarketSquareCategories = async (type?: string) => {
    const token = await getToken()
    const q = type ? `?${new URLSearchParams({ type })}` : '';
    return await apiGet<IMarketCategory[]>(`marketsquare/categories${q}`, token);
};

// icon is an Iconify id (stored by the API as a URL); no trybe_type_id creates a General category.
export const addMarketSquareCategory = async (payload: {
    name: string;
    description?: string;
    icon?: string;
    color: string;
    trybe_type_id?: string;
}) => {
    const token = await getToken()
    const r = await apiPost(`marketsquare/categories/add`, payload, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const updateMarketSquareCategory = async (
    categoryId: number,
    data: { name?: string; description?: string; icon?: string; color?: string },
) => {
    const token = await getToken()
    if (!token) throw new Error("No token found");

    const body: { name?: string; description?: string; icon?: string; color?: string } = {};
    if (data.name) body.name = data.name;
    // An empty string clears the description.
    if (data.description !== undefined) body.description = data.description;
    if (data.icon) body.icon = data.icon;
    if (data.color) body.color = data.color;

    const r = await apiPut(`marketsquare/categories/${categoryId}`, body, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const deleteMarketSquareCategory = async (categoryId: number) => {
    const token = await getToken()
    if (!token) throw new Error("No token found");
    const r = await apiDelete(`marketsquare/categories/${categoryId}`, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};

export const getMarketSquareProducts = async (
    page: number = 1,
    limit: number = 20,
    filters: { search?: string; category_id?: string; shop_id?: string; status?: string } = {},
) => {
    const token = await getToken()
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) q.append('search', filters.search);
    if (filters.category_id) q.append('category_id', filters.category_id);
    if (filters.shop_id) q.append('shop_id', filters.shop_id);
    if (filters.status) q.append('status', filters.status);
    return await apiGet<IMarketProductsResponse>(`marketsquare/products?${q.toString()}`, token);
};

export const getMarketSquareProductDetails = async (productId: string) => {
    const token = await getToken()
    return await apiGet<{ product_details: IMarketProductDetail }>(
        `marketsquare/products/${productId}`,
        token,
    );
};

export const getMarketSquareShops = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IMarketSquareShopsResponse>(
        `marketsquare/shops?page=${page}&limit=${limit}`,
        token,
    );
};

export const getMarketSquareShopDetails = async (shopId: string) => {
    const token = await getToken()
    return await apiGet<{ shop_details: IMarketShopDetail }>(`marketsquare/shop/${shopId}`, token);
};

export const updateShopStatus = async (shopId: string, status: ShopStatus) => {
    const token = await getToken()
    const r = await apiPost(`marketsquare/shop/${shopId}/status`, { status }, token);
    if (r.status) await revalidateCurrentPath();
    return r;
};
