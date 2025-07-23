import { ApiResponse, baseApiCall } from './base'

export async function apiGet<T>(route: string, token?: string): Promise<ApiResponse<T> | null> {
    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    const response = await baseApiCall<T>('GET', route, { headers }, token)
    if (response?.status) {
        return response
    }
    return null;
}

