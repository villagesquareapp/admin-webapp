"use server";

import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const sendBroadcastPushNotification = async (title: string, body: string, category: string) => {
  const token = await getToken();
  const response = await apiPost(
    `fcm-notification/broadcast/send`,
    { title, body, category },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};