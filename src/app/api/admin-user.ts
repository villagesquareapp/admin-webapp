"use server";

import { apiGet, apiPost, apiPut} from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getAdminUsers = async (page: number = 1, limit: number = 10) => {
    const token = await getToken();
    return await apiGet<IAdminUsers[]>(
        `admin-users?page=${page}&limit=${limit}`,
        token
    );
}

export const createAdminUser = async (name: string, email: string, role: string, password: string = '12345678') => {
    const token = await getToken();
    const response = await apiPost(
    `admin-users/create`,
    {
      email,
      name,
      role,
      password,
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
}