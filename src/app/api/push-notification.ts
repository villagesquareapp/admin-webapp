"use server";

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const sendBroadcastPushNotification = async (
  title: string,
  body: string,
  category: string,
  user_ids?: string[]
) => {
  const token = await getToken();
  const response = await apiPost(
    `fcm-notifications/send`,
    { title, body, category, user_ids },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};

export const getPushNotifications = async (page: number, limit: number) => {
  const token = await getToken();
  const response = await apiGet<IPushNotificationResponse>(
    `fcm-notifications?page=${page}&limit=${limit}`,
    token
  );
  return response;
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

export const deletePushNotification = async (notification_id: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  return await apiDelete(`fcm-notifications/${notification_id}/delete`, token);
};
