"use server";

import { apiDelete, apiGet, apiPatch, apiPost, apiUploadFile } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getGifts = async () => {
  const token = await getToken();
  return await apiGet<IGiftingResponse>(`gifting/all-gifts`, token);
};

export const getGiftingOverview = async () => {
  const token = await getToken();
  return await apiGet<IGiftOverview>(`gifting/overview`, token);
};

// The icon goes from the browser to this server action and on to the Admin
// API, which checks its type and size; the browser never holds the API token
// (VS-ADM-009).
export const addGift = async (form: FormData): Promise<ApiResponse<IGifting>> => {
  const token = await getToken();
  if (!token) return { status: false, message: "Your session has ended. Sign in again." };

  const icon = form.get("icon");
  if (!(icon instanceof File) || !icon.size) {
    return { status: false, message: "Please select an icon image" };
  }
  return await apiUploadFile<IGifting>("gifting/add", icon, token, {
    name: String(form.get("name") ?? ""),
    value: String(form.get("value") ?? ""),
  });
};

export const editGift = async (
  giftId: string,
  data: { name: string; value: number }
) => {
  const token = await getToken();
  return await apiPatch<ApiResponse>(`gifting/${giftId}/update`, data, token);
};

export const disableGift = async (giftId: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  return await apiDelete(`gifting/${giftId}/disable`, token);
};

export const enableGift = async (giftId: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  return await apiDelete(`gifting/${giftId}/enable`, token);
};
