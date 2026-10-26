import { cookies, headers } from "next/headers"
import { getToken as readSessionCookie } from "next-auth/jwt"
import { renewAccessToken, tokenIsFresh } from "@/lib/staffSession"

// The Admin API token for server components and server actions, read from
// next-auth's encrypted cookie. A stale one is renewed for this request; the
// session refetch in Providers keeps the cookie itself fresh.
export const getToken = async (): Promise<string | undefined> => {
    const [headerList, cookieStore] = await Promise.all([headers(), cookies()])
    const req = {
        headers: Object.fromEntries(headerList.entries()),
        cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])),
    } as any
    const token = await readSessionCookie({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.error) return undefined
    if (tokenIsFresh(token)) return token.accessToken
    const renewed = await renewAccessToken(token)
    return renewed.error ? undefined : renewed.accessToken
}
