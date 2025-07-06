// lib/clientApi.ts or app/api/gift/client.ts

import axios from "axios";
import { getToken } from "@/lib/getToken";

export const addGiftClient = async (
  name: string,
  value: string,
  icon: File,
  token: string
) => {

  // const token = getToken();
  const formData = new FormData();
  formData.append("name", name);
  formData.append("value", value);
  formData.append("icon", icon);

  // const response = await axios.post(
  //   `${process.env.NEXT_PUBLIC_API_URL}/gifting/add-gift`,
  //   formData,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   }
  // );

  const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/gifting/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();

  
};

console.log("Requesting:", `${process.env.NEXT_PUBLIC_CLIENT_API_URL}/gifting/add`);
