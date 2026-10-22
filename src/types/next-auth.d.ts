import NextAuth from 'next-auth'

type StaffUser = {
    id: string
    email: string
    name?: string
    role?: string
    permissions?: string[]
}

declare module 'next-auth' {
    // Sent to the browser: no API token.
    interface Session {
        user: StaffUser
        error?: string
    }

    interface User extends StaffUser {
        accessToken: string
        refreshToken: string
        accessTokenExpires: number
    }
}

declare module 'next-auth/jwt' {
    // Lives only in the encrypted session cookie, read on the server.
    interface JWT {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        user: StaffUser
        error?: string
    }
}
