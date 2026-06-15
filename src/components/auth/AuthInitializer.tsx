'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logOut } from '@/store/authSlice';
import { setCompanySettings } from '@/store/settingsSlice';
import { fetchCurrentUser } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';

const isPublicRoute = (pathname: string): boolean => {
    const PUBLIC_ROUTES = [
        '/',
        '/login',
        '/signup',
        '/hrms-login',
        '/kiosk',
        '/privacy-policy',
        '/terms-and-conditions',
        '/checkout-privacy',
        '/checkout-terms',
        '/register-company',
        '/payment-success'
    ];
    return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/careers');
};

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const persistedUser = useAppSelector((state) => state.auth.user);
    const [isHydrated, setIsHydrated] = useState(false);
    const isFirstRun = useRef(true);
    const { setTheme } = useTheme();

    useEffect(() => {
        if (persistedUser?.profile?.settings?.theme) {
            setTheme(persistedUser.profile.settings.theme);
        }
    }, [persistedUser, setTheme]);

    useEffect(() => {
        if (!isFirstRun.current) return;
        isFirstRun.current = false;

        const hydrateAuth = async () => {
            const isCustomerRoute = typeof window !== 'undefined' && (
                window.location.pathname.startsWith('/billing') || 
                window.location.pathname.startsWith('/subscriptions')
            );
            
            if (isCustomerRoute) {
                setIsHydrated(true);
                return;
            }

            // Hydrate global company settings
            try {
                const settingsRes = await apiClient.get('/settings/company');
                const settings = settingsRes.data?.data;
                if (settings) {
                    dispatch(setCompanySettings(settings));
                    if (settings.brandColor) {
                        document.documentElement.style.setProperty('--primary-color', settings.brandColor);
                    }
                }
            } catch (e) {
                console.error("Failed to load company settings on boot:", e);
            }

            const token = typeof window !== 'undefined' ? localStorage.getItem('hrms_token') : null;
            const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('hrms_user') : null;
            let cachedUser = null;
            try {
                if (cachedUserStr) cachedUser = JSON.parse(cachedUserStr);
            } catch (e) {}

            if (token && (persistedUser || cachedUser)) {
                try {
                    // apiClient will automatically attempt a refresh if the access token is expired.
                    const verifiedUser = await fetchCurrentUser();
                    localStorage.setItem('hrms_user', JSON.stringify(verifiedUser)); 
                    dispatch(setCredentials({ user: verifiedUser }));

                    // Keep cookies in sync for edge middleware
                    const currentToken = localStorage.getItem('hrms_token');
                    if (currentToken) {
                        Cookies.set('hrms_token', currentToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
                    }
                    if (verifiedUser?.role) {
                        Cookies.set('hrms_role', verifiedUser.role.toLowerCase(), { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
                    }

                    // Client-side automatic redirect if user is on /login with valid session
                    const isAuthRoute = window.location.pathname.startsWith('/login');
                    if (isAuthRoute) {
                        const searchParams = new URLSearchParams(window.location.search);
                        const redirectTo = searchParams.get('redirect_to') || '/dashboard';
                        window.location.href = redirectTo;
                    }
                } catch (error) {
                    // If we reach this catch block, the token is dead AND the refresh failed.
                    console.log("Session verification failed. Logging out.");
                    dispatch(logOut());
                    localStorage.removeItem('hrms_user');
                    localStorage.removeItem('hrms_token');
                    localStorage.removeItem('hrms_refreshToken');
                    localStorage.removeItem('persist:employeeAuth');
                    Cookies.remove('hrms_token', { path: '/' });
                    Cookies.remove('hrms_role', { path: '/' });
                    
                    // CRITICAL: Prevent zombie state if we are on a protected route
                    if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
                        window.location.href = '/login?error=session_expired';
                    }
                } finally {
                    setIsHydrated(true);
                }
            } else {
                // If there's no user cached, they are a guest.
                dispatch(logOut());
                localStorage.removeItem('hrms_user');
                localStorage.removeItem('hrms_token');
                localStorage.removeItem('hrms_refreshToken');
                localStorage.removeItem('persist:employeeAuth');
                Cookies.remove('hrms_token', { path: '/' });
                Cookies.remove('hrms_role', { path: '/' });

                if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
                    window.location.href = '/login?error=session_expired';
                } else {
                    setIsHydrated(true);
                }
            }
        };

        hydrateAuth();
    }, [dispatch, persistedUser]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return <>{children}</>;
}