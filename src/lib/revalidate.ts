'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function revalidatePathClient(path: string) {
    try {
        const response = await fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
            method: 'POST',
        })
        if (!response.ok) {
            throw new Error('Failed to revalidate')
        }
    } catch (error) {
        console.error('Revalidation error:', error)
    }
}

export async function revalidatePathServer(path: string) {
    revalidatePath(path)
}

export async function revalidateCurrentPath() {
    const headersList = headers()
    const pathname = headersList.get('x-pathname') || '/'
    revalidatePath(pathname)
    // Also revalidate the root path if we're not on it
    if (pathname !== '/') {
        revalidatePath('/')
    }
}

