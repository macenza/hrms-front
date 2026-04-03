'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import Cookies from 'js-cookie';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = Cookies.get('token');
        const refreshToken = Cookies.get('refreshToken');
        const storedUser = localStorage.getItem('user');

        // Restore session only if everything exists
        if (token && refreshToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);

                dispatch(setCredentials({ user, token }));
            } catch (error) {
                console.error('Failed to restore user session:', error);

                // Cleanup corrupted data
                localStorage.removeItem('user');
                Cookies.remove('token');
                Cookies.remove('refreshToken');
            }
        }
    }, [dispatch]);

    return <>{children}</>;
}