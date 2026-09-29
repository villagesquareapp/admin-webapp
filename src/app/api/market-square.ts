'use server'

import { apiGet, apiPost } from '@/lib/api';
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

export const getMarketSquareCategories = async () => {
    const token = await getToken()
    return await apiGet<IMarketCategory[]>(`marketsquare/categories`, token);
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
