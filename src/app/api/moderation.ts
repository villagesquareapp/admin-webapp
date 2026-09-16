"use server";

import { apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export interface ModerationActionItem {
  action: string;
  params?: Record<string, any>;
}

export interface ExecuteModerationPayload {
  service_type: string;
  target_id: string;
  target_user_id?: string;
  actions: ModerationActionItem[];
  reason?: string;
  report_id?: string;
}

/** Generic enforcement — execute moderation actions on any content or user. */
export const executeModeration = async (payload: ExecuteModerationPayload) => {
  const token = await getToken();
  const r = await apiPost(`moderation/execute`, payload, token);
  if (r.status) await revalidateCurrentPath();
  return r;
};
