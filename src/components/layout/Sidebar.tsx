'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CalendarDays,
    Briefcase,
    DollarSign,
    CreditCard,
    Package,
    Bell,
    Settings,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import clsx from 'clsx';

// Added 'href' to map to our Next.js route groups
const menuItems = [
    { id: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Employees', href: '/employees', icon: Users, label: 'Employees' },
    { id: 'Attendance', href: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { id: 'Projects', href: '/projects', icon: Briefcase, label: 'Projects' },
    { id: 'Leave', href: '/leave', icon: CalendarDays, label: 'Leave' },
    { id: 'Payroll', href: '/payroll', icon: DollarSign, label: 'Payroll' },
    { id: 'Loan', href: '/loan', icon: CreditCard, label: 'Loan' },
    { id: 'Assets', href: '/assets', icon: Package, label: 'Assets' },
    { id: 'Notice', href: '/notice', icon: Bell, label: 'Notice' },
    { id: 'Settings', href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    // Automatically grab the current URL path
    const pathname = usePathname();
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className="fixed left-0 top-0 h-full w-[250px] bg-[#F8F9FB] border-r border-gray-200 flex flex-col transition-all duration-300 z-20 hidden md:flex">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-[#4F7CF3]">MACENZA</h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    
                    // Determine if this link is active
                    // We use exact match for dashboard, and startsWith for others so sub-pages (like /employees/profile) keep the parent tab highlighted
                    const isActive = 
                        item.href === '/dashboard' 
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={clsx(
                                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-[#4F7CF3] text-white shadow-lg shadow-blue-500/20"
                                    : "text-[#6B7280] hover:bg-white hover:text-[#1F2937] hover:shadow-sm"
                            )}
                        >
                            <Icon size={20} strokeWidth={2} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200">
                <div className="bg-white rounded-xl p-1 flex items-center justify-between mb-4 border border-gray-200">
                    <button
                        className={clsx(
                            "flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all",
                            !isDarkMode ? "bg-white shadow-sm text-gray-800" : "text-gray-400"
                        )}
                        onClick={() => setIsDarkMode(false)}
                    >
                        <Sun size={16} className="mr-2" /> Light
                    </button>
                    <button
                        className={clsx(
                            "flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all",
                            isDarkMode ? "bg-gray-800 text-white shadow-sm" : "text-gray-400"
                        )}
                        onClick={() => setIsDarkMode(true)}
                    >
                        <Moon size={16} className="mr-2" /> Dark
                    </button>
                </div>

                <button className="w-full flex items-center space-x-3 px-4 py-3 text-[#EB5757] hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}