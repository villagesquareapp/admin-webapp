import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { messageHandler } from '@/lib/messageHandler';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, _req) {
                try {
                    const response = await fetch(`${process.env.API_URL}/auth/login`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });
                    const data = await response.json();

                    console.log("API STATUS:", response.status);
                    console.log("API RESPONSE:", data);

                    if (!response.ok) {
                        throw new Error(messageHandler(data.message) || "Authentication failed");
                    }
                    
                    return {
                        id: data?.data?.user?.id,
                        email: data?.data?.user?.email,
                        token: data?.data?.access_token,
                    };
                    
                } catch (error: any) {
                    throw new Error(messageHandler(error.message) || "Authentication failed");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.token = user.token;
                token.user = { id: user.id, email: user.email };
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user;
            session.token = token.token;
            return session;
        },
    },
    pages: {
        signIn: '/auth/auth2/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60,
    },
}

