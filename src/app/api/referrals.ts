"use server";

import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const getReferralStats = async () => {
  const token = await getToken();
  return await apiGet<IReferralStats>(`referrals/stats`, token);
};

export const getReferrals = async (filters: { page?: number; limit?: number; search?: string; stage?: string }) => {
  const token = await getToken();
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
  return await apiGet<IPaginatedResponse<IReferral>>(`referrals?${q.toString()}`, token);
};
