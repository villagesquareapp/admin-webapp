"use server";

import { apiGet, apiPatch, apiPost, apiPut} from "@/lib/api";
import { getToken } from "@/lib/getToken";
import { revalidateCurrentPath } from "@/lib/revalidate";

export const getAdminUsers = async (page: number = 1, limit: number = 10) => {
    const token = await getToken();
    return await apiGet<IAdminUsers[]>(
        `admin-users?page=${page}&limit=${limit}`,
        token
    );
}

// The Admin API generates the first password and emails it.
export const createAdminUser = async (name: string, email: string, role: string) => {
    const token = await getToken();
    const response = await apiPost(
    `admin-users/create`,
    {
      email,
      name,
      role,
    },
    token
  );

  if (response.status) {
    await revalidateCurrentPath();
  }
  return response;
}

// Super admins only: change a staff member's role or turn their access off/on.
export const updateStaffMember = async (uuid: string, change: { role?: string; is_active?: boolean }) => {
    const token = await getToken();
    const response = await apiPatch(`admin-users/${uuid}`, change, token);
    if (response?.status) {
        await revalidateCurrentPath();
    }
    return response;
}

// Super admins: email a new temporary password (changed at their next sign-in).
export const resetStaffPassword = async (uuid: string) => {
    const token = await getToken();
    return await apiPost(`admin-users/${uuid}/reset-password`, {}, token);
}

// Super admins: they set up a new authenticator at their next sign-in.
export const resetStaffAuthenticator = async (uuid: string) => {
    const token = await getToken();
    const response = await apiPost(`admin-users/${uuid}/reset-authenticator`, {}, token);
    if (response?.status) {
        await revalidateCurrentPath();
    }
    return response;
}
