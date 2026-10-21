import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { messageHandler } from '@/lib/messageHandler';
import { endApiSession, renewAccessToken, tokenIsFresh } from '@/lib/staffSession';

// Staff sign-ins last at most 12 hours (the Admin API ends its session then).
const SESSION_SECONDS = 12 * 60 * 60;

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            // The last sign-in step: the challenge from the earlier steps and,
            // unless a second step was just set up, a code or a passkey answer
            // (WebAuthn JSON, as a string).
            credentials: {
                challenge: { label: 'Challenge', type: 'text' },
                code: { label: 'Code', type: 'text' },
                passkey: { label: 'Passkey', type: 'text' },
            },
            async authorize(credentials) {
                let passkey: unknown;
                try {
                    passkey = credentials?.passkey ? JSON.parse(credentials.passkey) : undefined;
                } catch {
                    throw new Error("That passkey didn't work");
                }
                const response = await fetch(`${process.env.API_URL}/auth/token`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', "Accept": "application/json" },
                    body: JSON.stringify({
                        challenge: credentials?.challenge,
                        ...(credentials?.code ? { code: credentials.code } : {}),
                        ...(passkey ? { passkey } : {}),
                    }),
                }).catch(() => null);
                const data = await response?.json().catch(() => null);
                // Never log the body: it carries the tokens.
                if (!response?.ok || !data?.data?.access_token) {
                    throw new Error(messageHandler(data?.message) || "Sign-in failed");
                }
                const d = data.data;
                return {
                    id: d.user.id,
                    email: d.user.email,
                    name: d.user.name,
                    role: d.user.role,
                    permissions: d.user.permissions,
                    accessToken: d.access_token,
                    refreshToken: d.refresh_token,
                    accessTokenExpires: Date.now() + d.expires_in * 1000,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as User;
                return {
                    ...token,
                    accessToken: u.accessToken,
                    refreshToken: u.refreshToken,
                    accessTokenExpires: u.accessTokenExpires,
                    user: { id: u.id, email: u.email ?? '', name: u.name ?? undefined, role: u.role, permissions: u.permissions },
                };
            }
            if (token.error || tokenIsFresh(token)) return token;
            return renewAccessToken(token);
        },
        // What the browser gets: who is signed in, never the API token.
        async session({ session, token }) {
            session.user = token.user;
            session.error = token.error;
            return session;
        },
    },
    events: {
        async signOut({ token }) {
            await endApiSession(token);
        },
    },
    pages: {
        signIn: '/auth/auth2/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: SESSION_SECONDS,
    },
}
