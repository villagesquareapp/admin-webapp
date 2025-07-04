// lib/clientApi.ts or app/api/gift/client.ts
import axios from "axios";
import { getToken } from "@/lib/getToken";

export const addGiftClient = async (
  name: string,
  value: string,
  icon: File
) => {
  const token = await getToken(); // Optional – you may need to pass this in if it's a browser-only helper

  const formData = new FormData();
  formData.append("name", name);
  formData.append("value", value);
  formData.append("icon", icon);

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/gifting/add-gift`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
