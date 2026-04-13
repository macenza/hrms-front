'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Cookies from 'js-cookie';

import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice';
import { logoutUser } from '@/services/authService';

import {
    LayoutDashboard, Users, CalendarCheck, CalendarDays, Briefcase,
    DollarSign, CreditCard, Package, Bell, Settings, LogOut, Sun, Moon, X, User
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Pull current user to determine Role-Based Access
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && theme === 'dark';

    // Architect Note: Config-driven RBAC. Easily extendable if you add "Manager" or "Finance" roles later.
    const menuItems = useMemo(() => {
        const items = [
            { id: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
            
            // Administrative Links
            { id: 'Employees', href: '/employees', icon: Users, label: 'Employees', show: isAdminOrHR },
            { id: 'Payroll', href: '/payroll', icon: DollarSign, label: 'Payroll', show: isAdminOrHR },
            { id: 'Assets', href: '/assets', icon: Package, label: 'Assets', show: isAdminOrHR },
            
            // Employee-Specific Links
            { id: 'Profile', href: '/profile', icon: User, label: 'My Profile', show: !isAdminOrHR },
            
            // Shared Links
            { id: 'Attendance', href: '/attendance', icon: CalendarCheck, label: 'Attendance', show: true },
            { id: 'Projects', href: '/projects', icon: Briefcase, label: 'Projects', show: true },
            { id: 'Leave', href: '/leave', icon: CalendarDays, label: 'Leave', show: true },
            { id: 'Loan', href: '/loan', icon: CreditCard, label: 'Loan', show: true },
            { id: 'Notice', href: '/notice', icon: Bell, label: 'Notice', show: true },
            { id: 'Settings', href: '/settings', icon: Settings, label: 'Settings', show: true },
        ];

        return items.filter(item => item.show);
    }, [isAdminOrHR]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Backend logout failed:", error);
        } finally {
            Cookies.remove('token');
            Cookies.remove('role');
            localStorage.removeItem('user');
            dispatch(logOut());
            onClose();
            router.push('/login');
        }
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Panel */}
            <div className={cn(
                "fixed left-0 top-0 h-full w-[250px] bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 z-50 dark:bg-gray-900 dark:border-gray-800",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0"
            )}>

                {/* Logo & Close Button */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <h1 className="text-2xl font-bold text-blue-600 tracking-tight dark:text-blue-400">MACENZA</h1>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        aria-label="Close Sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => onClose()} // Auto-close sidebar on mobile
                                className={cn(
                                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                )}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform duration-200 shrink-0", !isActive && "group-hover:scale-110")} />
                                <span className="font-semibold text-sm truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 shrink-0">
                    
                    {/* Theme Toggle */}
                    <div className="bg-white rounded-xl p-1 flex items-center justify-between mb-4 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                                !isDarkMode && mounted ? "bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            )}
                            onClick={() => setTheme('light')}
                            disabled={!mounted}
                            aria-label="Enable Light Mode"
                            aria-pressed={!isDarkMode}
                        >
                            <Sun size={16} className="mr-2" strokeWidth={2.5} /> Light
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                                isDarkMode && mounted ? "bg-gray-800 text-white shadow-sm dark:bg-gray-700" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            )}
                            onClick={() => setTheme('dark')}
                            disabled={!mounted}
                            aria-label="Enable Dark Mode"
                            aria-pressed={isDarkMode}
                        >
                            <Moon size={16} className="mr-2" strokeWidth={2.5} /> Dark
                        </button>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 group dark:hover:bg-red-950/30"
                    >
                        <LogOut size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                        <span className="font-semibold text-sm truncate">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}