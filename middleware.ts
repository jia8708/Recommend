import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    // 需要登录的路径
    const protectedPaths = ['/user', '/leader', '/recommend', '/resume'];

    // 检查当前路径是否需要登录
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // 如果路径需要登录且用户未登录，重定向到登录页
    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 如果用户已登录且访问登录/注册页，重定向到用户信息页
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/user/info', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/user/:path*',
        '/leader/:path*',
        '/recommend/:path*',
        '/resume/:path*',
        '/login',
        '/register'
    ],
};