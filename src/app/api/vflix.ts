"use server";

/**
 * VFlix video-moderation server actions.
 * Contract: vflix-admin-management-guide.md §4 (base path `/v2/vflix`).
 *
 * NOTE: the backend endpoints are not live yet, so every action currently
 * returns mock data (see vflix.mock.ts). The real `apiGet`/`apiPost` calls are
 * written out below exactly as they'll run — when the endpoints ship, set
 * VFLIX_USE_MOCK=false (or remove the flag) and delete vflix.mock.ts. No call
 * site or component needs to change.
 */

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";
import {
  mockCreatorView,
  mockListVideos,
  mockModerationQueue,
  mockSetFeatured,
  mockStats,
  mockStatusList,
  mockUpdateStatus,
  mockVideoDetail,
} from "./vflix.mock";

// Default to mock until the endpoints are ready.
const USE_MOCK = process.env.VFLIX_USE_MOCK !== "false";

export interface VflixVideoFilters {
  status?: string;
  user_id?: string;
  search?: string;
  content_type?: string;
  is_featured?: string;
}

// §4.1 — list videos (includes taken-down videos)
export const getVflixVideos = async (
  page: number = 1,
  limit: number = 20,
  filters: VflixVideoFilters = {}
) => {
  if (USE_MOCK) return mockListVideos(page, limit, filters);

  const token = await getToken();
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.user_id) queryParams.append("user_id", filters.user_id);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.content_type) queryParams.append("content_type", filters.content_type);
  if (filters.is_featured) queryParams.append("is_featured", filters.is_featured);

  return await apiGet<IVflixListResponse>(`vflix?${queryParams.toString()}`, token);
};

// §4.2 — stats for the dashboard header
export const getVflixStats = async () => {
  if (USE_MOCK) return mockStats();
  const token = await getToken();
  return await apiGet<IVflixStats>(`vflix/stats`, token);
};

// §4.3 — status list (dropdown source)
export const getVflixStatusList = async () => {
  if (USE_MOCK) return mockStatusList();
  const token = await getToken();
  return await apiGet<VflixStatus[]>(`vflix/status-list`, token);
};

// §4.4 — moderation queue (reported/flagged or has open reports)
export const getVflixModerationQueue = async (
  page: number = 1,
  limit: number = 20
) => {
  if (USE_MOCK) return mockModerationQueue(page, limit);
  const token = await getToken();
  return await apiGet<IVflixListResponse>(
    `vflix/moderation?page=${page}&limit=${limit}`,
    token
  );
};

// §4.5 — video detail
export const getVflixVideoDetail = async (id: string) => {
  if (USE_MOCK) return mockVideoDetail(id);
  const token = await getToken();
  return await apiGet<IVflixVideoDetail>(`vflix/${id}`, token);
};

// §4.6 — moderate (take down / restore / shadow-hide / flag). This is the
// takedown mechanism; there is no separate delete endpoint.
export const updateVflixStatus = async (
  id: string,
  status: string,
  reason?: string
) => {
  if (USE_MOCK) {
    const res = mockUpdateStatus(id, status, reason);
    await revalidateCurrentPath();
    return res;
  }
  const token = await getToken();
  const response = await apiPost(
    `vflix/${id}/update-status`,
    { status, reason },
    token
  );
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

// §4.7 — feature / unfeature
export const featureVflixVideo = async (id: string) => {
  if (USE_MOCK) {
    const res = mockSetFeatured(id, true);
    await revalidateCurrentPath();
    return res;
  }
  const token = await getToken();
  const response = await apiPost(`vflix/${id}/feature`, {}, token);
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

export const unfeatureVflixVideo = async (id: string) => {
  if (USE_MOCK) {
    const res = mockSetFeatured(id, false);
    await revalidateCurrentPath();
    return res;
  }
  const token = await getToken();
  const response = await apiPost(`vflix/${id}/unfeature`, {}, token);
  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
};

// §4.8 — creator view (a creator's videos + strike history)
export const getVflixByCreator = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  if (USE_MOCK) return mockCreatorView(userId, page, limit);
  const token = await getToken();
  return await apiGet<IVflixCreatorView>(
    `vflix/creator/${userId}?page=${page}&limit=${limit}`,
    token
  );
};
