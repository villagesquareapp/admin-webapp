"use server";

import { apiGet, apiPost } from "@/lib/api";
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
