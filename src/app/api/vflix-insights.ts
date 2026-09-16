"use server";

/**
 * VFlix Insights / Ops / Settings server actions.
 */

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getVflixAnalytics = async () => {
  const token = await getToken();
  return await apiGet<IVflixAnalytics>(`vflix/analytics`, token);
};

export const getVflixTrending = async () => {
  const token = await getToken();
  return await apiGet<IVflixTrending>(`vflix/trending`, token);
};

export const getVflixSeries = async (page = 1, limit = 12, filters: { status?: string; search?: string } = {}) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.status) q.append("status", filters.status);
  if (filters.search) q.append("search", filters.search);
  return await apiGet<IVflixPaged<IVflixSeries>>(`vflix/series?${q}`, token);
};

export const getVflixPipeline = async () => {
  const token = await getToken();
  return await apiGet<IVflixPipeline>(`vflix/pipeline`, token);
};

export const getVflixMonetization = async () => {
  const token = await getToken();
  return await apiGet<IVflixMonetization>(`vflix/monetization`, token);
};

export const getVflixSettings = async () => {
  const token = await getToken();
  return await apiGet<IVflixSettings>(`vflix/settings`, token);
};

// ---- mutations ----
export const setTrendOverride = async (
  id: string,
  action: "boost" | "suppress" | "clear"
) => {
  const token = await getToken();
  const r = await apiPost(`vflix/${id}/trend-override`, { action }, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const retryTranscode = async (jobId: string) => {
  const token = await getToken();
  const r = await apiPost(`vflix/pipeline/${jobId}/retry`, {}, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};

export const saveVflixSettings = async (settings: IVflixSettings) => {
  const token = await getToken();
  return await apiPost(`vflix/settings`, settings, token);
};
