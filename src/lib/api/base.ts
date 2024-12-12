const API_URL = process.env.API_URL || 'https://staging-api.villagesquare.io/v2'

export interface ApiResponse<T = any> {
    status: boolean
    message: string
    data?: T
}

async function baseApiCall<T>(
    method: string,
    route: string,
    options: RequestInit & { isFormData?: boolean } = {},
    token?: string
): Promise<ApiResponse<T>> {

    const cleanRoute = route.startsWith('/') ? route : `/${route}`
    const url = `${API_URL?.replace(/\/+$/, '')}${cleanRoute}`

    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type') && !options.isFormData) {
        headers.set('Content-Type', 'application/json')
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    try {
        const response = await fetch(url, {
            ...options,
            method,
            headers,
        })

        const data: ApiResponse<T> = await response.json()

        if (response.ok) {
            return data
        } else {
            return data
        }
    } catch (error: any) {
        const errorMessage = error.message || `An unexpected error occurred during the ${method} request.`
        return {
            status: false,
            message: errorMessage,
        }
    }
}

export { baseApiCall }

