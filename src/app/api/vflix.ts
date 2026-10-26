"use server";

/**
 * VFlix video-moderation server actions.
 * Contract: vflix-admin-management-guide.md §4 (base path `/v2/vflix`).
 */

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

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
  const token = await getToken();
  return await apiGet<IVflixStats>(`vflix/stats`, token);
};

// Cross-segment summary for the VFlix landing dashboard (GET /vflix/overview).
export const getVflixOverview = async () => {
  const token = await getToken();
  return await apiGet<IVflixOverview>(`vflix/overview`, token);
};

// Creators list (ranked / at-risk).
export const getVflixCreators = async (
  page = 1,
  limit = 15,
  filters: { search?: string; at_risk?: boolean; sort?: string; status?: string } = {}
) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.search) q.append("search", filters.search);
  if (filters.at_risk) q.append("at_risk", "true");
  if (filters.sort) q.append("sort", filters.sort);
  if (filters.status) q.append("status", filters.status);
  return await apiGet<IVflixPaged<IVflixCreatorListItem>>(`vflix/creators?${q}`, token);
};

// VFlix report inbox (service_type = vflix).
export const getVflixReports = async (
  page = 1,
  limit = 15,
  filters: { status?: string; type?: string } = {}
) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.status) q.append("status", filters.status);
  if (filters.type) q.append("type", filters.type);
  return await apiGet<IVflixPaged<IVflixReportRow>>(`vflix/reports?${q}`, token);
};

// Resolve/dismiss are generic across report types — see @/app/api/report.ts.

// §4.3 — status list (dropdown source)
export const getVflixStatusList = async () => {
  const token = await getToken();
  return await apiGet<IVflixStatusOption[]>(`vflix/status-list`, token);
};

// §4.4 — moderation queue (reported/flagged or has open reports)
export const getVflixModerationQueue = async (
  page: number = 1,
  limit: number = 20
) => {
  const token = await getToken();
  return await apiGet<IVflixListResponse>(
    `vflix/moderation?page=${page}&limit=${limit}`,
    token
  );
};

// §4.5 — video detail
export const getVflixVideoDetail = async (id: string) => {
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
  const token = await getToken();
  const response = await apiPost(
    `vflix/${id}/update-status`,
    { status, reason },
    token
  );
  if (response.status) await revalidateCurrentPath();
  return response;
};

// §4.7 — feature / unfeature
export const featureVflixVideo = async (id: string) => {
  const token = await getToken();
  const response = await apiPost(`vflix/${id}/feature`, {}, token);
  if (response.status) await revalidateCurrentPath();
  return response;
};

export const unfeatureVflixVideo = async (id: string) => {
  const token = await getToken();
  const response = await apiPost(`vflix/${id}/unfeature`, {}, token);
  if (response.status) await revalidateCurrentPath();
  return response;
};

// §4.8 — creator view (a creator's videos + strike history)
export const getVflixByCreator = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const token = await getToken();
  return await apiGet<IVflixCreatorView>(
    `vflix/creator/${userId}?page=${page}&limit=${limit}`,
    token
  );
};
