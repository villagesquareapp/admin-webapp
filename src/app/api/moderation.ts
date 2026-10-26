"use server";

import { apiGet, apiPost } from "@/lib/api";
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

/** Enforcement (audit) log — every executed moderation action. */
export const getEnforcementLog = async (
  page: number = 1,
  limit: number = 20,
  filters: { service_type?: string; target_id?: string; target_user_id?: string; action?: string } = {},
) => {
  const token = await getToken();
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.service_type) q.append("service_type", filters.service_type);
  if (filters.target_id) q.append("target_id", filters.target_id);
  if (filters.target_user_id) q.append("target_user_id", filters.target_user_id);
  if (filters.action) q.append("action", filters.action);
  return await apiGet<IEnforcementResponse>(`moderation/actions?${q}`, token);
};
