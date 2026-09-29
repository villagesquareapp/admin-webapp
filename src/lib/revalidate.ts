'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Revalidation must never break or spam a mutation — log at most once.
let warnedOnce = false
function warnOnce(context: string, error: unknown) {
    if (warnedOnce) return
    warnedOnce = true
    console.warn(`[revalidate] ${context} failed (further warnings suppressed):`, error)
}

/** Revalidate the page the current server action was invoked from (via middleware's x-pathname). */
export async function revalidateCurrentPath() {
    try {
        const pathname = headers().get('x-pathname') || '/'
        revalidatePath(pathname)
        // Keep the dashboard/withdrawals summaries in sync after any mutation.
        revalidatePath('/dashboards')
        if (pathname !== '/') {
            revalidatePath('/')
        }
    } catch (error) {
        warnOnce('revalidateCurrentPath', error)
    }
}

/**
 * Back-compat wrapper used by apiPost/apiPatch/apiDelete. The argument is an API
 * route (not a page path), so it is ignored: we revalidate the current page in
 * server context. Never fetches a relative URL (which throws `Invalid URL` in Node).
 */
export async function revalidatePathClient(_route?: string) {
    await revalidateCurrentPath()
}

/** Revalidate an explicit page path (plus the root). */
export async function revalidatePathServer(path: string) {
    try {
        revalidatePath(path)
        if (path !== '/') {
            revalidatePath('/')
        }
    } catch (error) {
        warnOnce('revalidatePathServer', error)
    }
}
