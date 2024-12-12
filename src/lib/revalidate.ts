import { revalidatePath } from 'next/cache'

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

