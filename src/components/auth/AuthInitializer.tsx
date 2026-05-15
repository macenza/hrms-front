'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, logOut } from '@/store/authSlice';
import { fetchCurrentUser } from '@/services/authService';
import { Loader2 } from 'lucide-react';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const hydrateAuth = async () => {
            const cachedUserStr = localStorage.getItem('user');
            if (cachedUserStr) {
                try {
                    const user = JSON.parse(cachedUserStr);
                    dispatch(setCredentials({ user }));
                } catch (e) {
                    // Ignore parse errors, fallback to backend
                }
            }

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
                
                // CRITICAL: Prevent zombie state if we are on a protected route
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login?error=session_expired';
                }
            } finally {
                setIsHydrated(true);
            }
        };

        hydrateAuth();
    }, [dispatch]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return <>{children}</>;
}