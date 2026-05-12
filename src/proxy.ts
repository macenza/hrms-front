import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Expanded RBAC Blacklist aligning frontend with backend roles
const RESTRICTED_ROUTES: Record<string, string[]> = {
    employee: ['/employees', '/payroll', '/assets', '/admin', '/hr'],
    manager: ['/payroll', '/admin', '/hr'],
    hr: ['/admin'],
    admin: [], // Unrestricted
};

const PROTECTED_PREFIXES = [
    '/dashboard', '/employees', '/leave', '/loan', '/assets',
    '/notice', '/payroll', '/projects', '/settings', '/profile', '/attendance', '/admin', '/hr'
];

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const rawRole = request.cookies.get('role')?.value;
    
    // 2. Strict type normalization and fail-safe fallback
    const role = rawRole ? rawRole.toLowerCase() : 'unauthenticated';
    
    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (isAuthRoute) {
        if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
        return NextResponse.next();
    }

    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect_to', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isProtectedRoute && token) {
        // 3. Fallback to most restrictive role ('employee') if role string is manipulated or missing
        const restrictedForUser = RESTRICTED_ROUTES[role] || RESTRICTED_ROUTES['employee'];
        const isTryingToAccessRestricted = restrictedForUser.some(route => pathname.startsWith(route));

        if (isTryingToAccessRestricted) {
            const dashboardUrl = new URL('/dashboard', request.url);
            dashboardUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(dashboardUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};