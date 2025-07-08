"use server";

import { apiDelete, apiGet, apiPatch, apiPost, apiUploadFile } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getGifts = async () => {
  const token = await getToken();
  return await apiGet<IGiftingResponse>(`gifting/all-gifts`, token);
};

export const addGifts = async (
  name: string,
  value: string | number,
  icon: File
): Promise<ApiResponse<IGifting>> => {
  const token = await getToken();
  if (!token) throw new Error("Token not found");

  const response = await apiUploadFile<IGifting>("gifting/add", icon, token, {
    name,
    value,
  });

  return response;
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
