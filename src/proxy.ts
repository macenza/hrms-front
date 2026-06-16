import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. RBAC Blacklist for HRMS Employees
const RESTRICTED_ROUTES: Record<string, string[]> = {
    employee: ['/employees', '/payroll', '/assets/categories', '/assets/statuses', '/assets/import', '/admin', '/hr'],
    manager: ['/payroll', '/assets/categories', '/assets/statuses', '/assets/import', '/admin', '/hr'],
    hr: ['/admin'],
    admin: [], // Unrestricted
};

const HRMS_PROTECTED_PREFIXES = [
    '/dashboard', '/employees', '/leave', '/loan', '/assets',
    '/notice', '/payroll', '/projects', '/settings', '/profile', '/attendance', '/admin', '/hr', '/subscription'
];

const CUSTOMER_PROTECTED_PREFIXES = [
    '/billing', '/subscriptions'
];

export function proxy(request: NextRequest) {
    const hrmsToken = request.cookies.get('hrms_token')?.value;
    const customerToken = request.cookies.get('customer_token')?.value;
    const rawRole = request.cookies.get('role')?.value || request.cookies.get('hrms_role')?.value;
    
    // Strict type normalization and fail-safe fallback
    const role = rawRole ? rawRole.toLowerCase() : 'unauthenticated';
    
    const { pathname } = request.nextUrl;
    
    // Redirect customer-dashboard to /subscription
    if (pathname.startsWith('/customer-dashboard')) {
        return NextResponse.redirect(new URL('/subscription', request.url));
    }
    
    const isAuthRoute = pathname.startsWith('/login');
    const isSignupRoute = pathname.startsWith('/signup');
    const isHrmsProtectedRoute = HRMS_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isCustomerProtectedRoute = CUSTOMER_PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

    // Rule 3: Auto-redirects
    const hasAuthError = request.nextUrl.searchParams.has('error') || request.nextUrl.searchParams.has('registered');

    if (isAuthRoute) {
        if (hrmsToken && !hasAuthError) {
            const redirectTo = request.nextUrl.searchParams.get('redirect_to') || '/dashboard';
            return NextResponse.redirect(new URL(redirectTo, request.url));
        }
        if (customerToken && !hasAuthError) {
            return NextResponse.redirect(new URL('/subscription', request.url));
        }
        return NextResponse.next();
    }

    if (isSignupRoute) {
        return NextResponse.next();
    }

    // Rule 1: HRMS Protected Routes (Requires hrms_token)
    if (isHrmsProtectedRoute && !hrmsToken) {
        if (pathname.startsWith('/subscription') && customerToken) {
            return NextResponse.next();
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect_to', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 2: Customer Protected Routes (Requires customer_token, ignores hrms_token)
    if (isCustomerProtectedRoute && !customerToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect_to', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // RBAC check for logged-in employees
    if (isHrmsProtectedRoute && hrmsToken) {
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