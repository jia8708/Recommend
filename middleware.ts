import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // const user = request.cookies.get('user');
    // const { pathname } = request.nextUrl;
    //
    // // 需要登录的路径
    // const protectedPaths = ['/user', '/leader','/recommend'];
    //
    // // 检查当前路径是否需要登录
    // const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    //
    // // 如果路径需要登录且用户未登录，重定向到登录页
    // if (isProtectedPath && !user) {
    //     return NextResponse.redirect(new URL('/login', request.url));
    // }
    //
    // // 如果用户已登录且访问登录/注册页，重定向到用户信息页
    // if (user && (pathname === '/login' || pathname === '/register')) {
    //     return NextResponse.redirect(new URL('/user/info', request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ['/user/:path*', '/leader/:path*', '/login', '/register']
}; 