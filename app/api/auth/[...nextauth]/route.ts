import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { baseUrl } from '@/utils/constance';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                userAccount: { label: "用户名", type: "text" },
                userPassword: { label: "密码", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await fetch(`${baseUrl}/user/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    });

                    const data = await response.json();

                    if (data.code === 0 && data.data) {
                        return {
                            id: data.data.id,
                            name: data.data.userName,
                            email: data.data.userAccount,
                            image: null,
                            token: data.data.token,
                            profile: data.data.userProfile,
                            role: data.data.userRole,
                            avatarKey: Date.now().toString()
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.token;
                token.profile = user.profile;
                token.avatarKey = user.avatarKey;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token) {
                session.accessToken = token.accessToken;
                session.user.profile = token.profile;
                session.user.avatarKey = token.avatarKey;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    }
});

export { handler as GET, handler as POST }; 