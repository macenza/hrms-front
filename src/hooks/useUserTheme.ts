'use client';

import { useTheme } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { useUpdateNotificationPreferences } from '@/hooks/api/useSettings';
import { useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '@/services/apiClient';

// ── BroadcastChannel for instant same-browser cross-tab sync ──
let themeChannel: BroadcastChannel | null = null;
try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        themeChannel = new BroadcastChannel('hrms-theme-sync');
    }
} catch {
    // Not supported — falls back to storage + visibility
}

/** Apply theme to the DOM instantly without waiting for React */
function applyThemeToDOM(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    html.style.colorScheme = theme;
}

/** Read the current theme from localStorage (fast, sync) */
function getStoredTheme(): 'light' | 'dark' | null {
    if (typeof window === 'undefined') return null;
    // Check next-themes key first
    const ntTheme = localStorage.getItem('theme');
    if (ntTheme === 'light' || ntTheme === 'dark') return ntTheme;
    // Check user profile
    try {
        const raw = localStorage.getItem('hrms_user');
        if (raw) {
            const u = JSON.parse(raw);
            const t = u?.profile?.settings?.theme;
            if (t === 'light' || t === 'dark') return t;
        }
    } catch { /* ignore */ }
    return null;
}

export function useUserTheme() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
    const updateNotificationsMutation = useUpdateNotificationPreferences();
    const [mounted, setMounted] = useState(false);
    const isSyncingRef = useRef(false);
    // Track last known theme to avoid redundant API calls
    const lastSyncedThemeRef = useRef<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ── 1. BroadcastChannel: instant same-browser cross-tab sync (~1ms) ──
    useEffect(() => {
        if (!mounted) return;

        const handleBroadcast = (e: MessageEvent) => {
            const newTheme = e.data?.theme as 'light' | 'dark';
            if (!newTheme || (newTheme !== 'light' && newTheme !== 'dark')) return;

            isSyncingRef.current = true;
            applyThemeToDOM(newTheme);
            setNextTheme(newTheme);
            lastSyncedThemeRef.current = newTheme;

            if (user) {
                const updatedUser = {
                    ...user,
                    profile: {
                        ...user.profile,
                        settings: { ...user.profile?.settings, theme: newTheme }
                    }
                };
                dispatch(setCredentials({ user: updatedUser }));
            }
            isSyncingRef.current = false;
        };

        themeChannel?.addEventListener('message', handleBroadcast);
        return () => { themeChannel?.removeEventListener('message', handleBroadcast); };
    }, [mounted, user, dispatch, setNextTheme]);

    // ── 2. Visibility change: sync theme when tab becomes visible ──
    //    Handles both same-browser (localStorage) and cross-browser (backend fetch)
    useEffect(() => {
        if (!mounted) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;

            // ── Same-browser: read localStorage instantly ──
            const storedTheme = getStoredTheme();
            const currentTheme = user?.profile?.settings?.theme || nextTheme || 'light';

            if (storedTheme && storedTheme !== currentTheme) {
                isSyncingRef.current = true;
                applyThemeToDOM(storedTheme);
                setNextTheme(storedTheme);
                if (user) {
                    const updatedUser = {
                        ...user,
                        profile: {
                            ...user.profile,
                            settings: { ...user.profile?.settings, theme: storedTheme }
                        }
                    };
                    dispatch(setCredentials({ user: updatedUser }));
                }
                lastSyncedThemeRef.current = storedTheme;
                isSyncingRef.current = false;
            }

            // ── Cross-browser/device: fetch from backend ──
            // Only if the user is authenticated (has a token)
            if (!user) return;
            const token = localStorage.getItem('hrms_token');
            if (!token) return;

            try {
                const res = await apiClient.get('/settings/notifications');
                const backendTheme = res.data?.data?.theme as string;
                if (
                    backendTheme &&
                    (backendTheme === 'light' || backendTheme === 'dark') &&
                    backendTheme !== lastSyncedThemeRef.current
                ) {
                    isSyncingRef.current = true;
                    applyThemeToDOM(backendTheme);
                    setNextTheme(backendTheme);
                    localStorage.setItem('theme', backendTheme);

                    const updatedUser = {
                        ...user,
                        profile: {
                            ...user.profile,
                            settings: { ...user.profile?.settings, theme: backendTheme }
                        }
                    };
                    dispatch(setCredentials({ user: updatedUser }));
                    localStorage.setItem('hrms_user', JSON.stringify(updatedUser));
                    lastSyncedThemeRef.current = backendTheme;
                    isSyncingRef.current = false;
                }
            } catch {
                // Network error or 401 — silently ignore, don't break UX
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also sync on window focus (catches alt-tab, taskbar clicks)
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [mounted, user, nextTheme, dispatch, setNextTheme]);

    // ── 3. Storage event fallback (for browsers without BroadcastChannel) ──
    useEffect(() => {
        if (!mounted || themeChannel) return; // Skip if BroadcastChannel is active

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'theme' && e.newValue) {
                const newTheme = e.newValue as 'light' | 'dark';
                if (newTheme !== 'light' && newTheme !== 'dark') return;
                isSyncingRef.current = true;
                applyThemeToDOM(newTheme);
                setNextTheme(newTheme);
                if (user && user.profile?.settings?.theme !== newTheme) {
                    const updatedUser = {
                        ...user,
                        profile: {
                            ...user.profile,
                            settings: { ...user.profile?.settings, theme: newTheme }
                        }
                    };
                    dispatch(setCredentials({ user: updatedUser }));
                }
                isSyncingRef.current = false;
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [mounted, user, dispatch, setNextTheme]);

    // Active theme
    const activeTheme = mounted ? (user?.profile?.settings?.theme || nextTheme || 'light') : 'light';

    const changeTheme = useCallback(async (newTheme: 'light' | 'dark') => {
        if (!newTheme || isSyncingRef.current) return;

        // 1. Apply to DOM instantly
        applyThemeToDOM(newTheme);

        // 2. Update next-themes
        setNextTheme(newTheme);

        // 3. Track
        lastSyncedThemeRef.current = newTheme;

        // 4. Broadcast to same-browser tabs
        try { themeChannel?.postMessage({ theme: newTheme }); } catch { /* closed */ }

        // 5. Sync Redux + localStorage + backend
        if (user) {
            const currentPrefs = user.profile?.settings || {};
            const updatedUser = {
                ...user,
                profile: {
                    ...user.profile,
                    settings: { ...currentPrefs, theme: newTheme }
                }
            };

            dispatch(setCredentials({ user: updatedUser }));
            // Update localStorage
            localStorage.setItem('hrms_user', JSON.stringify(updatedUser));

            try {
                await updateNotificationsMutation.mutateAsync({
                    ...currentPrefs,
                    theme: newTheme
                });
            } catch (error) {
                console.error('Failed to sync theme preference with backend:', error);
            }
        }
    }, [user, dispatch, setNextTheme, updateNotificationsMutation]);

    return {
        theme: activeTheme,
        setTheme: changeTheme,
        isDarkMode: activeTheme === 'dark',
        mounted
    };
}
