'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import PoliciesSettings from '@/components/settings/PoliciesSettings';

export default function PoliciesPage() {
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                        Policies & Compliance
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        Review, download, or manage company regulations and compliance guidelines.
                    </p>
                </header>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
                    <PoliciesSettings />
                </div>
            </div>
        </div>
    );
}
