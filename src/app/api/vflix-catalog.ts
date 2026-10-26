"use server";

/**
 * VFlix Catalog (Studio assets) server actions.
 * Endpoint bases per the guide §5.2 (the mixed bases are the backend reality).
 */

import { apiGet, apiPatch, apiPut } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getCatalogSummary = async () => {
  const token = await getToken();
  return await apiGet<IVflixCatalogSummary>(`vflix/catalog/summary`, token);
};

export const getSounds = async (
  page = 1,
  limit = 12,
  filters: { category?: string; search?: string } = {}
) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.category) q.append("category", filters.category);
  if (filters.search) q.append("search", filters.search);
  return await apiGet<IVflixPaged<IVflixSound>>(`vflix-studio/sounds?${q}`, token);
};

export const getFilters = async (page = 1, limit = 12) => {
  const token = await getToken();
  return await apiGet<IVflixPaged<IVflixFilter>>(`vflix/filters?page=${page}&limit=${limit}`, token);
};

export const getTemplates = async (page = 1, limit = 12, filters: { status?: string } = {}) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.status) q.append("status", filters.status);
  return await apiGet<IVflixPaged<IVflixTemplate>>(`templates?${q}`, token);
};

export const getStickers = async (page = 1, limit = 18) => {
  const token = await getToken();
  return await apiGet<IVflixPaged<IVflixSticker>>(`vflix/stickers?page=${page}&limit=${limit}`, token);
};

export const getFonts = async (page = 1, limit = 24) => {
  const token = await getToken();
  return await apiGet<IVflixPaged<IVflixFont>>(`vflix/fonts?page=${page}&limit=${limit}`, token);
};

export const getColours = async (page = 1, limit = 24) => {
  const token = await getToken();
  return await apiGet<IVflixPaged<IVflixColour>>(`vflix/colours?page=${page}&limit=${limit}`, token);
};

// ---- mutations ----
export const toggleSoundFeatured = async (id: string, featured: boolean) => {
  const token = await getToken();
  if (!token) return null;
  const r = await apiPut(`vflix-studio/sounds/${id}/featured`, { featured }, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const toggleAssetActive = async (
  kind: "filters" | "stickers" | "fonts" | "colours",
  id: string,
  active: boolean
) => {
  const token = await getToken();
  const r = await apiPatch(`vflix/${kind}/${id}/${active ? "activate" : "deactivate"}`, {}, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const moderateTemplate = async (id: string, action: "approve" | "reject" | "remove") => {
  const token = await getToken();
  const r = await apiPatch(`templates/${id}/${action}`, {}, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};
