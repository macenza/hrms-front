import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Extract the tokens from the cookies we set during login
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value;
    const { pathname } = request.nextUrl;

    // Define our route categories
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    
    // These are protected app routes
    const protectedPrefixes = [
        '/dashboard', '/employees', '/leave', '/loan',
        '/notice', '/payroll', '/projects', '/settings', '/profile'
    ];
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

    // --- SECURITY CHECKS ---

    // Check A: If they are logged in, DO NOT let them see the login/signup pages.
    // Send them straight to the dashboard.
    if (isAuthRoute) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // If no token, let them proceed to login/signup
        return NextResponse.next(); 
    }

    // Check B: If they are trying to access the app but ARE NOT logged in.
    // Kick them back to the login page.
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check C: Role-Based Access Control (RBAC)
    // Now that we know they are logged in, check if they have the right rank.
    
    // Example: Let's assume you have (or will have) an /admin route group
    if (pathname.startsWith('/admin')) {
        if (role !== 'Admin') {
            // If an Employee or HR tries to enter, send them back to the dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Example: Let's assume you have an /hr route group
    if (pathname.startsWith('/hr')) {
        // Both HR and Admin can usually access HR routes, but Employees cannot
        if (role !== 'HR' && role !== 'Admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // If they pass all checks, let them render the page!
    return NextResponse.next();
}

//  Configure the Matcher
// This tells Next.js which paths the middleware should run on.
// We exclude API routes, static files, and Next.js internal files to save performance.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};