import { baseApiCall, ApiResponse } from "./base";

export async function apiUploadFile<T>(
  route: string,
  file: File,
  token: string,
  additionalData?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append("icon", file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  // return baseApiCall<T>('POST', route, {
  //     headers: {
  //         'Authorization': `Bearer ${token}`,
  //     },
  //     body: formData,
  // })
  return baseApiCall<T>(
    "POST",
    route,
    {
      body: formData,
      isFormData: true, 
    },
    token
  );
}
