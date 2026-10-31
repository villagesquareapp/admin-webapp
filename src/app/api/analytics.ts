"use server";

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

const query = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
  return q.toString();
};

export const getAnalyticsOverview = async (days: number) => {
  const token = await getToken();
  return await apiGet<IAnalyticsOverview>(`analytics/overview?${query({ days })}`, token);
};

export const getRetention = async (filters: {
  section: AnalyticsSection;
  cohort?: RetentionCohortKind;
  grain: RetentionGrain;
  periods?: number;
}) => {
  const token = await getToken();
  return await apiGet<IAnalyticsRetention>(`analytics/retention?${query(filters)}`, token);
};

export const getFunnel = async (days: number) => {
  const token = await getToken();
  return await apiGet<IAnalyticsFunnel>(`analytics/funnel?${query({ days })}`, token);
};

export const getAudience = async (refresh = false) => {
  const token = await getToken();
  return await apiGet<IAudienceBreakdown>(`analytics/audience${refresh ? "?refresh=1" : ""}`, token);
};

export const getSegments = async (refresh = false) => {
  const token = await getToken();
  return await apiGet<IAnalyticsSegment[]>(`analytics/segments${refresh ? "?refresh=1" : ""}`, token);
};

export const pushToSegment = async (key: string, payload: ISegmentPushPayload) => {
  const token = await getToken();
  const res = await apiPost<IPushNotifications>(`analytics/segments/${encodeURIComponent(key)}/push`, payload, token);
  if (res?.status) await revalidateCurrentPath();
  return res;
};
