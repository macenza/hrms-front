import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Architect Note: Centralized configuration for route access
// Maps roles to an array of route prefixes they are NOT allowed to access
const RESTRICTED_ROUTES: Record<string, string[]> = {
    employee: ['/employees', '/payroll', '/assets'],
    // HR and Admin have no restricted frontend routes in this array, but you could add them here if needed
};

export function middleware(request: NextRequest) {
    // Extract tokens
    const token = request.cookies.get('token')?.value;
    const rawRole = request.cookies.get('role')?.value;
    const { pathname } = request.nextUrl;

    // Normalize the role to prevent case-sensitivity bugs (e.g., 'Admin' vs 'admin')
    const role = rawRole ? rawRole.toLowerCase() : 'unauthenticated';

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    
    // Protect all main app routes
    const protectedPrefixes = [
        '/dashboard', '/employees', '/leave', '/loan', '/assets',
        '/notice', '/payroll', '/projects', '/settings', '/profile', '/attendance'
    ];
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    // --- SECURITY CHECKS ---

    // Check A: Prevent logged-in users from seeing Auth pages
    if (isAuthRoute) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next(); 
    }

    // Check B: Prevent unauthenticated users from seeing Protected pages
    if (isProtectedRoute && !token) {
        // Optional UX Enhancement: Pass a 'next' parameter so they can return to their intended page after logging in
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect_to', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check C: Strict Role-Based Access Control (RBAC)
    if (isProtectedRoute && token) {
        // Look up the restricted routes for this specific user's role
        const restrictedForUser = RESTRICTED_ROUTES[role] || [];

        // Check if the current pathname starts with any of the restricted routes
        const isTryingToAccessRestricted = restrictedForUser.some(route => pathname.startsWith(route));

        if (isTryingToAccessRestricted) {
            // UX Enhancement: Redirect with an error flag so the Dashboard can show a Toast notification
            const dashboardUrl = new URL('/dashboard', request.url);
            dashboardUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // If they pass all checks, let the request proceed to the page
    return NextResponse.next();
}

// Configure the Matcher
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (Next.js API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};