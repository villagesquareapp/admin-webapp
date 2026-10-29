"use server";

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const query = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
  return q.toString();
};

const done = async <T extends { status: boolean }>(r: T) => {
  if (r?.status) await revalidateCurrentPath();
  return r;
};

// ---- Hashtags ----
export const getHashtagStats = async () => {
  const token = await getToken();
  return await apiGet<IHashtagStats>(`hashtags/stats`, token);
};

export const getHashtags = async (filters: { page?: number; limit?: number; search?: string; status?: string; sort?: string }) => {
  const token = await getToken();
  return await apiGet<IPaginatedResponse<IHashtag>>(`hashtags?${query(filters)}`, token);
};

export const getHashtag = async (id: string) => {
  const token = await getToken();
  return await apiGet<IHashtagDetail>(`hashtags/${id}`, token);
};

export const hideHashtag = async (id: string, reason: string) => {
  const token = await getToken();
  return done(await apiPost(`hashtags/${id}/hide`, { reason }, token));
};

export const restoreHashtag = async (id: string) => {
  const token = await getToken();
  return done(await apiPost(`hashtags/${id}/restore`, {}, token));
};

// ---- Mentions ----
export const getMentionStats = async () => {
  const token = await getToken();
  return await apiGet<IMentionStats>(`mentions/stats`, token);
};

export const getMentions = async (filters: { page?: number; limit?: number; user?: string; role?: string }) => {
  const token = await getToken();
  return await apiGet<IPaginatedResponse<IMention> & { user: IUserBrief | null }>(`mentions?${query(filters)}`, token);
};

export const removeMention = async (id: string, reason: string) => {
  const token = await getToken();
  return done(await apiPost(`mentions/${id}/remove`, { reason }, token));
};

// ---- Trending ----
export const getTrending = async (window: string) => {
  const token = await getToken();
  return await apiGet<ITrendingView>(`trending?${query({ window })}`, token);
};

export const hideFromTrending = async (payload: { kind: "topic" | "post"; item_key: string; label?: string; reason: string }) => {
  const token = await getToken();
  return done(await apiPost(`trending/hidden`, payload, token));
};

export const unhideFromTrending = async (kind: "topic" | "post", item_key: string) => {
  const token = await getToken();
  return done(await apiPost(`trending/hidden/remove`, { kind, item_key }, token));
};
