'use client';

import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { useUpdateNotificationPreferences } from '@/hooks/api/useSettings';
import { useEffect, useState } from 'react';

export function useUserTheme() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Active theme resolves to: user's profile settings theme, falling back to next-themes theme
    const activeTheme = mounted ? (user?.profile?.settings?.theme || nextTheme || 'light') : 'light';

    const changeTheme = async (newTheme: 'light' | 'dark') => {
        if (!newTheme) return;

        // 1. Update next-themes immediately for instant UI feedback
        setNextTheme(newTheme);

        // 2. If authenticated, sync with the database and update Redux/local storage
        if (user) {
            const currentPrefs = user.profile?.settings || {};
            const updatedUser = {
                ...user,
                profile: {
                    ...user.profile,
                    settings: {
                        ...currentPrefs,
                        theme: newTheme
                    }
                }
            };

            // Dispatch to Redux
            dispatch(setCredentials({ user: updatedUser }));

            // Update sessionStorage
            localStorage.setItem('hrms_user', JSON.stringify(updatedUser));

            try {
                // Call PUT /settings/notifications to save theme settings to the backend
                await updateNotificationsMutation.mutateAsync({
                    ...currentPrefs,
                    theme: newTheme
                });
            } catch (error) {
                console.error('Failed to sync theme preference with backend:', error);
            }
        }
    };

    return {
        theme: activeTheme,
        setTheme: changeTheme,
        isDarkMode: activeTheme === 'dark',
        mounted
    };
}
