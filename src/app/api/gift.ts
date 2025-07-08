"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
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
) => {
  const token = await getToken();

  const formData = new FormData();
  formData.append("name", name);
  formData.append("value", value.toString());
  formData.append("icon", icon);

  const response = await apiPost(`gifting/add-gift`, formData, token);

  if (response.status) {
    await revalidateCurrentPath();
  }

  return response;
};

export const editGift = async (
  giftId: string,
  data: { name: string, value: number }
) => {
  const token = await getToken();
  return await apiPatch<ApiResponse>(
    `gifting/${giftId}/update`,
    data,
    token
  );
};

export const disableGift = async (
  giftId: string
) => {
  const token = await getToken();
    if (!token) throw new Error("No token found");
  return await apiDelete(
    `gifting/${giftId}/disable`, token
  )
}

export const enableGift = async (
  giftId: string
) => {
  const token = await getToken();
    if (!token) throw new Error("No token found");
  return await apiDelete(
    `gifting/${giftId}/enable`, token
  )
}
