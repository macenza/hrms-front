'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logOut } from '@/store/authSlice';
import { setCompanySettings } from '@/store/settingsSlice';
import { fetchCurrentUser } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { Loader2 } from 'lucide-react';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const persistedUser = useAppSelector((state) => state.auth.user);
    const [isHydrated, setIsHydrated] = useState(false);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!isFirstRun.current) return;
        isFirstRun.current = false;

        const hydrateAuth = async () => {
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

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            let cachedUser = null;
            try {
                if (cachedUserStr) cachedUser = JSON.parse(cachedUserStr);
            } catch (e) {}

            if (persistedUser || token || cachedUser) {
                try {
                    // apiClient will automatically attempt a refresh if the access token is expired.
                    const verifiedUser = await fetchCurrentUser();
                    localStorage.setItem('user', JSON.stringify(verifiedUser)); 
                    dispatch(setCredentials({ user: verifiedUser }));
                } catch (error) {
                    // If we reach this catch block, the token is dead AND the refresh failed.
                    console.log("Session verification failed. Logging out.");
                    dispatch(logOut());
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    
                    const PUBLIC_ROUTES = ['/', '/login', '/signup'];
                    // CRITICAL: Prevent zombie state if we are on a protected route
                    if (typeof window !== 'undefined' && !PUBLIC_ROUTES.includes(window.location.pathname)) {
                        window.location.href = '/login?error=session_expired';
                    }
                } finally {
                    setIsHydrated(true);
                }
            } else {
                // If there's no user cached, they are a guest.
                dispatch(logOut());
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setIsHydrated(true);
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