"use server";

import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getBillingPlans = async () => {
    const token = await getToken();
    return await apiGet<IBillingPlan[]>(
        `billing/plans`,
        token
    );
}

export const createSubscription = async (plan_id: string, user_id: string, validity_period: string) => {
  const token = await getToken();
  const response = await apiPost(
    `billing/subscriptions/create`,
    { plan_id, user_id, validity_period },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};