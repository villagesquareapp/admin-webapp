import { revalidatePathClient } from '../revalidate';
import { baseApiCall, ApiResponse } from './base'

export async function apiPatch<T>(route: string, body: any, token?: string, options?: RequestInit): Promise<ApiResponse<T>> {
    let headers: HeadersInit = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    if (options) {
        headers = { ...headers, ...options.headers }
    }

    headers = { ...headers, 'Content-Type': 'application/json' };
    const response = await baseApiCall<T>('PATCH', route, {
        headers,
        body: JSON.stringify(body),
        cache: 'no-store'
    })

    // Revalidate the path after successful mutation
    if (response.status) {
        await revalidatePathClient(route)
    }

    return response
}

export default apiPatch