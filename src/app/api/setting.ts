'use server'

import { apiGet, apiPost } from '@/lib/api';
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
