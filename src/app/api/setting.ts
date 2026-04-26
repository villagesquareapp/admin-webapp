'use server'

import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api';
import { getToken } from '@/lib/getToken';
import { revalidateCurrentPath } from '@/lib/revalidate';


export const getSettings = async () => {
    const token = await getToken()
    return await apiGet<ISettings>(
        `app-settings`,
        token
    );
};

export const addNewSettings = async (newSetting: Omit<ISettings, "uuid" | "created_at" | "updated_at" | "deleted_at">) => {
    const token = await getToken();
    const response = await apiPost(`app-settings/add`, newSetting, token)

    if (response.status) {
        await revalidateCurrentPath()
    }
    return response
};

export const updateSettings = async (settingId: string, body: { name?: string; value?: any }) => {
    const token = await getToken();
    const response = await apiPatch(`app-settings/${settingId}/update`, body, token);

    if (response?.status) {
        await revalidateCurrentPath();
    }
    return response;
};

export const updatePassword = async (old_password: string, new_password: string) => {
    const token = await getToken();
    if(!token) return null
    const response = await apiPut(`admin-users/settings/change-password`, {old_password, new_password}, token)

    if(response.status) {
        await revalidateCurrentPath();
    }

    return response;
}