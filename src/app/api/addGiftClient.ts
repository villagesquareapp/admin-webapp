// /lib/api/giftClient.ts
// import { apiUploadFile } from "@/app/api/base";

import { apiUploadFile } from "@/lib/api";

export const addGifts = async (
  name: string,
  value: string | number,
  icon: File,
  token: string
): Promise<ApiResponse<IGifting>> => {
  return await apiUploadFile<IGifting>(
    "gifting/add",
    icon,
    token,
    { name, value }
  );
};
