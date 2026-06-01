'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import EmployeeProfileClient from '@/components/profile/EmployeeProfileClient';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyProfilePage() {
    // 1. Grab the current securely authenticated user from global Redux state
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    // 2. Strict Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    // Safety fallback with Premium Theme matching loader if Redux hasn't hydrated yet
    if (!isAuthenticated || !user) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    // Handle Mongoose _id vs id mapping securely
    const currentUserId = user.id || user._id;

    if (!currentUserId) {
        router.push('/dashboard');
        return null;
    }

    // 3. Render the dynamic client UI securely locked to this user's ID
    return (
        <div className="w-full bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EmployeeProfileClient id={currentUserId} />
            </div>
        </div>
    );
}