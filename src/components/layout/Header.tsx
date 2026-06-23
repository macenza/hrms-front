import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Menu, User as UserIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { User } from '@/store/authSlice';
import { getAvatarUrl } from '@/utils/avatarUtils';
import NotificationDropdown from './NotificationDropdown';

export interface UserProfile {
    name: string;
    role: string;
    avatarUrl?: string;
    unreadNotifications: number;
}

interface HeaderProps {
    onMenuClick: () => void;
}

function mapUserToProfile(authUser: User | null): UserProfile {
    if (!authUser) {
        return { name: 'User', role: '', unreadNotifications: 0 };
    }

    return {
        name: authUser.name || 'User',
        role: authUser.role || '',
        avatarUrl: getAvatarUrl(authUser.profile?.avatar) || undefined,
        unreadNotifications: 0,
    };
}

export default function Header({ onMenuClick }: HeaderProps) {
    const authUser = useAppSelector((state) => state.auth.user);
    const user = useMemo(() => mapUserToProfile(authUser), [authUser]);
    const profileHref = '/profile';
    
    const [greeting, setGreeting] = useState('Welcome');
    
    // --- HYDRATION FIX ADDED HERE ---
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // Signal that we are safely on the client
        
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Render a skeleton/fallback before mounting
    if (!mounted) {
        return <header className="h-20 bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30"></header>;
    }

    const firstName = (user.name || '').trim() ? (user.name || '').split(' ')[0] : 'there';
    const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800">

            {/* Left Section: Hamburger & Greeting */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="Open Sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        <span className="hidden xs:inline">{greeting}, </span>
                        {firstName} 👋
                    </h2>
                    <p className="hidden lg:block text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                        Here's what's happening today.
                    </p>
                </div>
            </div>

            {/* Right Section: Notifications, Profile */}
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">

                <NotificationDropdown />

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

                {/* Profile Link/Avatar */}
                {profileHref ? (
                    <Link
                        href={profileHref}
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group pl-1 sm:pl-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                        aria-label="View my profile"
                    >
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{user.name}</span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight mt-1">{user.role}</span>
                        </div>

                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-blue-900 transition-all" />
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:bg-blue-700 transition-colors">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 hidden xs:block" />
                    </Link>
                ) : (
                    <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-0">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{user.name}</span>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight mt-1">{user.role}</span>
                        </div>

                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <ChevronDown size={14} className="text-gray-400 dark:text-gray-500 hidden xs:block" />
                    </div>
                )}
            </div>
        </header>
    );
}