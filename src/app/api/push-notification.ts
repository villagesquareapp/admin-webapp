"use server";

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const sendPushNotification = async (payload: IPushSendPayload) => {
  const token = await getToken();
  const response = await apiPost<IPushNotifications>(
    `fcm-notifications/send`,
    payload,
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};

export const getPushNotifications = async (
  page: number,
  limit: number,
  filters: { search?: string; status?: string; audience?: string } = {}
) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([k, v]) => v && q.set(k, v));
  return await apiGet<IPushNotificationResponse>(
    `fcm-notifications?${q.toString()}`,
    token
  );
};

export const getPushStats = async () => {
  const token = await getToken();
  return await apiGet<IPushStats>(`fcm-notifications/stats`, token);
};

export const getPushNotification = async (notification_id: string) => {
  const token = await getToken();
  return await apiGet<IPushDetail>(`fcm-notifications/${notification_id}`, token);
};

export const resendPushNotification = async (notification_id: string) => {
  const token = await getToken();
  const response = await apiPost(
    `fcm-notifications/${notification_id}/resend`,
    {},
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};

export const cancelPushNotification = async (notification_id: string) => {
  const token = await getToken();
  const response = await apiPost(
    `fcm-notifications/${notification_id}/cancel`,
    {},
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};

export const deletePushNotification = async (notification_id: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await apiDelete(`fcm-notifications/${notification_id}/delete`, token);
  if (response?.status) await revalidateCurrentPath();
  return response;
};
