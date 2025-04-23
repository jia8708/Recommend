import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
                    const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    });

                    // 检查响应状态
                    if (!response.ok) {
                        console.error('Login API error:', response.status, response.statusText);
                        return null;
                    }

                    // 检查响应内容类型
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.error('Invalid content type:', contentType);
                        return null;
                    }

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
        async session({ session, token }) {
            if (token) {
                session.accessToken  = token.accessToken as string | undefined;
                session.user.profile = token.profile as string | undefined;
                session.user.avatarKey = token.avatarKey as string | undefined;
                session.user.role = token.role as string | undefined;
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
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 