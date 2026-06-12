'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, Building2 } from 'lucide-react';
import UnifiedLoginForm from './UnifiedLoginForm';
import CustomerLoginForm from './CustomerLoginForm';
import { cn } from '@/utils/cn';

export default function LoginTabs() {
    const [activeTab, setActiveTab] = useState<'member' | 'customer'>('member');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type');
            if (type === 'customer') {
                setActiveTab('customer');
            }
        }
    }, []);

    return (
        <div className="flex flex-col items-center w-full gap-6">
            {/* Custom Tab Switcher */}
            <div className="w-full max-w-[440px] bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700/50 shadow-inner">
                <button
                    onClick={() => setActiveTab('member')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300",
                        activeTab === 'member'
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    )}
                >
                    <Users size={14} />
                    Workspace Member
                </button>
                <button
                    onClick={() => setActiveTab('customer')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300",
                        activeTab === 'customer'
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    )}
                >
                    <Building2 size={14} />
                    SaaS Customer
                </button>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-[440px]">
                {activeTab === 'member' ? (
                    <UnifiedLoginForm />
                ) : (
                    <CustomerLoginForm />
                )}
            </div>

            {/* Back to Home Action */}
            <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all px-5 py-2.5 shadow-md hover:shadow-lg text-white bg-[#6D5DFD] hover:bg-[#5b4eed] hover:scale-105 active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5DFD]/50 focus-visible:ring-offset-2 z-20"
            >
                <Home size={16} />
                Back to Home
            </Link>
        </div>
    );
}
