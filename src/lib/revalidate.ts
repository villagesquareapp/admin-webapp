'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function revalidatePathClient(path: string) {
    try {
        const response = await fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        })
        if (!response.ok) {
            throw new Error('Failed to revalidate')
        }
    } catch (error) {
        console.error('Revalidation error:', error)
    }
}

export async function revalidatePathServer(path: string) {
    try {
        revalidatePath(path)
        // Also revalidate the root path if we're not on it
        if (path !== '/') {
            revalidatePath('/')
        }
    } catch (error) {
        console.error('Server revalidation error:', error)
    }
}

export async function revalidateCurrentPath() {
    try {
        const headersList = headers()
        const pathname = headersList.get('x-pathname') || '/'

        // Revalidate the current path
        revalidatePath(pathname)

        // Also revalidate specific paths that need to stay in sync
        revalidatePath('/dashboards/withdrawals')
        revalidatePath('/dashboards')

        // Revalidate the root path if we're not on it
        if (pathname !== '/') {
            revalidatePath('/')
        }
    } catch (error) {
        console.error('Current path revalidation error:', error)
    }
}

