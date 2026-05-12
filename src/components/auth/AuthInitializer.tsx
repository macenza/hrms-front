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
            // Check if we have a fast-cache user object to prevent UI flashes
            const cachedUserStr = localStorage.getItem('user');
            
            if (cachedUserStr) {
                try {
                    const user = JSON.parse(cachedUserStr);
                    // Fast-hydrate Redux immediately
                    dispatch(setCredentials({ user }));
                    
                    // Silently verify with the backend that the session cookie is still valid
                    const verifiedUser = await fetchCurrentUser();
                    
                    // Keep local storage in sync in case their role/profile changed
                    localStorage.setItem('user', JSON.stringify(verifiedUser)); 
                    dispatch(setCredentials({ user: verifiedUser }));

                } catch (error) {
                    // If the API throws a 401 (token expired/invalid), wipe the slate clean
                    console.error("Session verification failed. Logging out.");
                    dispatch(logOut());
                    localStorage.removeItem('user');
                }
            } else {
                dispatch(logOut());
            }
            
            setIsHydrated(true);
        };

        hydrateAuth();
    }, [dispatch]);

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return <>{children}</>;
}