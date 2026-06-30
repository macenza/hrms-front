'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserTheme } from '@/hooks/useUserTheme';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice';
import { logoutUser } from '@/services/authService';
import Cookies from 'js-cookie';

import {
    LayoutDashboard, Users, CalendarCheck, CalendarDays, Briefcase,
    DollarSign, CreditCard, Package, Bell, Settings, LogOut, Sun, Moon, User,
    AlertTriangle, CalendarHeart, FileText, UserPlus, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

function getCompanyLogoUrl(url?: string) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/_next') || url.startsWith('data:')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseHost = apiUrl.replace(/\/api\/?$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseHost}${cleanUrl}`;
}

const getCompanyInitials = (name?: string) => {
    if (!name) return 'M';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase();
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { theme, setTheme } = useUserTheme();
    const [mounted, setMounted] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Pull current user to determine Role-Based Access
    const { user } = useAppSelector((state) => state.auth);
    const { company } = useAppSelector((state) => state.settings);
    
    // Safety check: only evaluate role-based credentials after client-side hydration
    const role = mounted ? (user?.role?.toLowerCase() || 'employee') : 'employee';
    const isAdminOrHR = mounted && (role === 'admin' || role === 'hr');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLogoutModalOpen) {
                setIsLogoutModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLogoutModalOpen]);

    const isDarkMode = mounted && theme === 'dark';

    // Architect Note: Config-driven RBAC. Easily extendable if you add "Manager" or "Finance" roles later.
    const menuItems = useMemo(() => {
        const items = [
            { id: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
            { id: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, label: 'AI Assistant', show: true },
            // Administrative Links
            { id: 'Employees', href: '/employees', icon: Users, label: 'Employees', show: isAdminOrHR },
            { id: 'Recruitment', href: '/recruitment', icon: UserPlus, label: 'Recruitment', show: isAdminOrHR },
            { id: 'Payroll', href: '/payroll', icon: DollarSign, label: 'Payroll', show: role === 'hr' },
            { id: 'Assets', href: '/assets', icon: Package, label: 'Assets', show: isAdminOrHR },

            // --- ARCHITECTURE UPGRADE: Dynamic Profile Routing ---
            // Instead of a dead '/profile' link, we route them to the dynamic employee view.
            {
                id: 'Profile',
                href: '/profile',
                icon: User,
                label: 'My Profile',
                show: !isAdminOrHR
            },

            // Shared Links
            { id: 'Attendance', href: '/attendance', icon: CalendarCheck, label: 'Attendance', show: isAdminOrHR },
            { id: 'Projects', href: '/projects', icon: Briefcase, label: 'Projects', show: true },
            { id: 'Leave', href: '/leave', icon: CalendarDays, label: 'Leave', show: true },
            { id: 'Holidays', href: '/holidays', icon: CalendarHeart, label: 'Holidays', show: true },
            { id: 'Policies', href: '/policies', icon: FileText, label: 'Policies', show: true },
            // { id: 'Loan', href: '/loan', icon: CreditCard, label: 'Loan', show: true },
            { id: 'Notice', href: '/notice', icon: Bell, label: 'Notice', show: true },
            { id: 'Settings', href: '/settings', icon: Settings, label: 'Settings', show: true },
            { id: 'Subscription', href: '/subscription', icon: CreditCard, label: 'Subscription Management', show: role === 'admin' },
        ];
        return items.filter(item => item.show);
    }, [isAdminOrHR, user, role]);

    const executeLogout = async () => {
        try {
            // Ask the backend to destroy the HttpOnly cookies
            await logoutUser(); 
        } catch (error) {
            console.error("Backend logout failed:", error);
        } finally {
            // Explicitly wipe the Redux state
            dispatch(logOut());
            
            // Clear storage and cookies to prevent ghost sessions
            sessionStorage.removeItem('hrms_user');
            sessionStorage.removeItem('hrms_token');
            sessionStorage.removeItem('hrms_refreshToken');
            sessionStorage.removeItem('persist:employeeAuth');
            sessionStorage.removeItem('persist:customerAuth');

            localStorage.removeItem('hrms_user');
            localStorage.removeItem('hrms_token');
            localStorage.removeItem('hrms_refreshToken');
            localStorage.removeItem('persist:employeeAuth');
            localStorage.removeItem('persist:customerAuth');

            Cookies.remove('hrms_token', { path: '/' });
            Cookies.remove('hrms_role', { path: '/' });
            Cookies.remove('role', { path: '/' });
            Cookies.remove('customer_token', { path: '/' });
            Cookies.remove('customer_refreshToken', { path: '/' });
            
            // Show premium success toast
            toast.success("You have been logged out successfully.");

            // Close the logout modal
            setIsLogoutModalOpen(false);
            
            // Close the sidebar
            if (typeof onClose === 'function') onClose();
            
            // Force browser to navigate to the login page directly with a hard reload
            window.location.href = '/login';
        }
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
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
            <div className="fixed left-0 top-0 h-full w-[250px] bg-gray-50 border-r border-gray-200 flex flex-col z-50 dark:bg-gray-900 dark:border-gray-800"
            style={{
                transition: isOpen 
                    ? 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1), opacity 280ms cubic-bezier(0.25, 1, 0.5, 1)' 
                    : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1), opacity 750ms cubic-bezier(0.25, 1, 0.5, 1)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-250px, 0, 0)',
                opacity: isOpen ? 1 : 0
            }}>

                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 shrink-0 gap-2 overflow-hidden">
                    <div className="flex items-center space-x-3">
                        {company?.companyLogoUrl ? (
                            <img 
                                src={getCompanyLogoUrl(company.companyLogoUrl)} 
                                alt="Branding" 
                                className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-800 shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary shrink-0">
                                {getCompanyInitials(company?.companyName)}
                            </div>
                        )}
                        <span className="text-lg font-bold tracking-tight text-primary truncate max-w-[140px]">
                            {company?.companyName || 'MACENZA'}
                        </span>
                    </div>
                </div>

                {/* Menu */}
                <nav className={cn(
                    "flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar",
                    isOpen ? "sidebar-menu-open" : "sidebar-menu-closed"
                )}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-primary sidebar-menu-item",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                )}
                                style={{
                                    '--item-index': index
                                } as React.CSSProperties}
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

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
                    onClick={() => setIsLogoutModalOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Warning Icon */}
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-955/40 text-amber-500 dark:text-amber-400 mb-4">
                            <AlertTriangle size={24} className="animate-pulse" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black text-center text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                            Confirm Logout
                        </h3>

                        {/* Message */}
                        <p className="text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to log out?
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition duration-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeLogout}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition duration-200 text-sm shadow-md shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}