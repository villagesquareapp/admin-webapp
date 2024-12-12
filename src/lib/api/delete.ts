import { baseApiCall, ApiResponse } from './base'
import { revalidatePathClient } from '../revalidate'

export async function apiDelete(route: string, token: string): Promise<ApiResponse> {
    const response = await baseApiCall('DELETE', route, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    // Revalidate the path on the client side
    // await revalidatePathClient(route)

    return response
}

