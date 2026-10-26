"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const query = (params: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString();
};

const mutated = async <T extends { status: boolean } | null>(response: T) => {
  if (response?.status) await revalidateCurrentPath();
  return response;
};

export const getMeetingsOverview = async () => {
  const token = await getToken();
  return apiGet<IMeetingsOverview>("meetings/overview", token);
};

export const getMeetings = async (
  page = 1,
  limit = 20,
  filters: { status?: string; search?: string; host_id?: string } = {}
) => {
  const token = await getToken();
  return apiGet<IPaginatedResponse<IMeetingListItem>>(`meetings?${query({ page, limit, ...filters })}`, token);
};

export const getMeeting = async (uuid: string) => {
  const token = await getToken();
  return apiGet<IMeetingDetail>(`meetings/${encodeURIComponent(uuid)}`, token);
};

export const endMeeting = async (uuid: string) => {
  const token = await getToken();
  return mutated(await apiPost<{ uuid: string; status: string }>(`meetings/${encodeURIComponent(uuid)}/end`, {}, token));
};

export const getMeetingHosts = async () => {
  const token = await getToken();
  return apiGet<IMeetingHost[]>("meetings/hosts", token);
};

export const grantMeetingHosting = async (userId: string) => {
  const token = await getToken();
  return mutated(await apiPost<IMeetingHost>("meetings/hosts", { user_id: userId }, token));
};

export const revokeMeetingHosting = async (userId: string) => {
  const token = await getToken();
  if (!token) return null;
  return mutated(await apiDelete(`meetings/hosts/${encodeURIComponent(userId)}`, token));
};

export const getMeetingAssistant = async () => {
  const token = await getToken();
  return apiGet<IMeetingAssistantSettings>("meetings/assistant", token);
};

export const updateMeetingAssistant = async (body: Partial<IMeetingAssistantSettings>) => {
  const token = await getToken();
  return mutated(await apiPatch<IMeetingAssistantSettings>("meetings/assistant", body, token));
};

export const getMeetingAssistantUsage = async (days = 30) => {
  const token = await getToken();
  return apiGet<IMeetingAssistantUsage>(`meetings/assistant/usage?days=${days}`, token);
};
