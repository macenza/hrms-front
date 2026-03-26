'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface UserProfile {
    name: string;
    role: string;
    avatarUrl?: string;
    unreadNotifications: number;
}

interface HeaderProps {
    user?: UserProfile;
    onGlobalSearch?: (query: string) => void;
    onMenuClick: () => void;
}

const mockUser: UserProfile = {
    name: 'Thomas Anree',
    role: 'HR Manager',
    unreadNotifications: 3,
};

export default function Header({ user = mockUser, onGlobalSearch, onMenuClick }: HeaderProps) {
    const [greeting, setGreeting] = useState('Welcome');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const firstName = user.name.split(' ')[0];
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (onGlobalSearch) onGlobalSearch(val);
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 border-b border-gray-200">

            {/* 1. Left Section: Hamburger & Greeting */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    aria-label="Open Sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                        <span className="hidden xs:inline">{greeting}, </span>
                        {firstName} 👋
                    </h2>
                    <p className="hidden lg:block text-xs text-gray-500 mt-0.5 font-medium">
                        Here's what's happening today.
                    </p>
                </div>
            </div>

            {/* 2. Center Section: Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search anything..."
                        className="w-full h-10 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* 3. Right Section: Mobile Search Toggle, Notifications, Profile */}
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">

                {/* Mobile Search Toggle */}
                <button
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Search size={20} />
                </button>

                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} />
                    {user.unreadNotifications > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>

                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group pl-1 sm:pl-0">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900 leading-none">{user.name}</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-1">{user.role}</span>
                    </div>

                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all" />
                    ) : (
                        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {getInitials(user.name)}
                        </div>
                    )}
                    <ChevronDown size={14} className="text-gray-400 hidden xs:block" />
                </div>
            </div>

            {/* 4. Mobile Search Overlay (Controlled by the toggle) */}
            {isMobileSearchOpen && (
                <div className="absolute inset-0 bg-white z-50 flex items-center px-4 animate-in slide-in-from-top duration-200">
                    <Search className="text-gray-400 mr-3" size={20} />
                    <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search organizational data..."
                        className="flex-1 h-full outline-none text-sm font-medium text-gray-900"
                    />
                    <button
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </header>
    );
}