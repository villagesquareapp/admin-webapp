import { baseApiCall, ApiResponse } from './base'
import { revalidatePathClient } from '../revalidate'

export async function apiPost<T>(route: string, body: any, token?: string, options?: RequestInit): Promise<ApiResponse<T>> {
    let headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    if (options) {
        headers = { ...headers, ...options.headers }
    }

    headers = { ...headers, 'Content-Type': 'application/json' };
    const response = await baseApiCall<T>('POST', route, {
        headers,
        body: JSON.stringify(body),
    })

    // await revalidatePathClient(route)
    return response
}

