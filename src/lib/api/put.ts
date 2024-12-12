import { baseApiCall, ApiResponse } from './base'
import { revalidatePathClient } from '../revalidate'

export async function apiPut<T>(route: string, body: any, token: string): Promise<ApiResponse<T>> {
    const response = await baseApiCall<T>('PUT', route, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })

    // Revalidate the path on the client side
    // await revalidatePathClient(route)

    return response
}

