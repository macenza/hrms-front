import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. RBAC Blacklist for HRMS Employees
const RESTRICTED_ROUTES: Record<string, string[]> = {
    employee: ['/employees', '/payroll', '/assets', '/admin', '/hr'],
    manager: ['/payroll', '/admin', '/hr'],
    hr: ['/admin'],
    admin: [], // Unrestricted
};

const PROTECTED_EMPLOYEE_PREFIXES = [
    '/dashboard', '/employees', '/leave', '/loan', '/assets',
    '/notice', '/payroll', '/projects', '/settings', '/profile', '/attendance', '/admin', '/hr'
];

const PROTECTED_CUSTOMER_PREFIXES = [
    '/customer-dashboard'
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Extract scoped tokens and roles strictly from browser request context
    const hrmsToken = request.cookies.get('hrms_token')?.value;
    const customerToken = request.cookies.get('customer_token')?.value;
    const rawRole = request.cookies.get('hrms_role')?.value;
    
    const role = rawRole ? rawRole.toLowerCase() : 'unauthenticated';

    const isEmployeeAuthRoute = pathname === '/hrms-login';
    const isCustomerAuthRoute = pathname === '/login' || pathname === '/signup';
    
    const isProtectedEmployeeRoute = PROTECTED_EMPLOYEE_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isProtectedCustomerRoute = PROTECTED_CUSTOMER_PREFIXES.some(prefix => pathname.startsWith(prefix));

    // 1. Employee Auth Route Redirects (hrms-login)
    // Rule 1: Redirect to dashboard if logged in as employee. If hrms_token is missing, let them view the page.
    if (isEmployeeAuthRoute) {
        if (hrmsToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // 2. Customer Auth Route Redirects (login, signup)
    // Rule 2: Redirect to B2B dashboard if logged in as customer. 
    // CRITICAL FIX: If hrms_token exists but NO customer_token, do NOT redirect. Let them see the Customer Login form.
    if (isCustomerAuthRoute) {
        if (customerToken) {
            return NextResponse.redirect(new URL('/customer-dashboard', request.url));
        }
        return NextResponse.next();
    }

    // 3. Protected Employee Routes Shield
    // Rule 3: Require hrms_token. Ignore customer_token completely.
    if (isProtectedEmployeeRoute) {
        if (!hrmsToken) {
            const loginUrl = new URL('/hrms-login', request.url);
            loginUrl.searchParams.set('redirect_to', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // RBAC logic for employees
        const restrictedForUser = RESTRICTED_ROUTES[role] || RESTRICTED_ROUTES['employee'];
        const isTryingToAccessRestricted = restrictedForUser.some(route => pathname.startsWith(route));

        if (isTryingToAccessRestricted) {
            const dashboardUrl = new URL('/dashboard', request.url);
            dashboardUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // 4. Protected Customer Routes Shield
    // Rule 4: Require customer_token. Ignore hrms_token completely.
    if (isProtectedCustomerRoute) {
        if (!customerToken) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect_to', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};