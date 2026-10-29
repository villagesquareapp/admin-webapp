"use server";

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getSentNotifications = async (filters: { user: string; page?: number; limit?: number; type?: string; read?: string }) => {
  const token = await getToken();
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
  return await apiGet<ISentNotificationsPage>(`in-app-notifications?${q.toString()}`, token);
};

export const removeSentNotification = async (id: string, reason: string) => {
  const token = await getToken();
  const r = await apiPost(`in-app-notifications/${id}/remove`, { reason }, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};
