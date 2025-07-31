"use server";

import { apiDelete, apiGet, apiPut, apiPost, apiUploadFile } from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getCoins = async () => {
  const token = await getToken();
  return await apiGet<ICoinsResponse>(`coin/recharge-options`, token);
};

export const addCoin = async (amount: number, price: number) => {
  const token = await getToken();
  if (!token) throw new Error("Token not found");

  const response = await apiPost(
    `coin/recharge-options/add`,
    { amount, price },
    token
  );

  return response;
};

export const editCoin = async (
  coinId: string,
  data: { amount: number; price: number }
) => {
  const token = await getToken();
  if (!token) throw new Error("Authorization token is missing.");
  return await apiPut<ApiResponse>(
    `coin/recharge-options/${coinId}/update`,
    data,
    token
  );
};

export const disableCoin = async (rechargeOptionID: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  return await apiPost(`coin/recharge-options/${rechargeOptionID}/disable`, null, token);
};

export const enableCoin = async (rechargeOptionID: string) => {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  return await apiPost(`coin/recharge-options/${rechargeOptionID}/enable`, null, token);
};
