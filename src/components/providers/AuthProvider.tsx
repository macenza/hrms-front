// src/components/providers/AuthProvider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, logOut } from '@/store/authSlice';
import { fetchCurrentUser } from '@/services/authService'; // Use the service, not the raw client!

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    
    // We add an initialization state to prevent the UI from flashing 
    // the "User" default state before the backend responds.
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // 1. Ask the backend: "Is my HttpOnly cookie valid? Who am I?"
                // The interceptor we built will automatically handle refreshing the token 
                // if the 15-minute access token is dead but the 7-day refresh token is valid!
                const user = await fetchCurrentUser(); 
                
                // 2. If successful, dispatch the user to Redux. 
                dispatch(setCredentials({ user }));
                
            } catch (error) {
                // 3. If it fails, the cookie is entirely missing or both tokens expired.
                console.warn('No valid session found. User must log in.');
                
                // CRITICAL: Explicitly clear Redux to prevent rehydrating ghost states
                dispatch(logOut()); 
            } finally {
                // 4. Unblock the UI rendering
                setIsInitializing(false);
            }
        };

        initializeSession();
    }, [dispatch]);

    // Show a polished loading screen while checking the secure cookie
    if (isInitializing) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    {/* Modern Spinner */}
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="animate-pulse text-gray-500 font-medium">Verifying secure session...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}