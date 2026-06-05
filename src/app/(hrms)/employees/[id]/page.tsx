'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmployeeDetails } from '@/hooks/api/useEmployeeDetails';
import EmployeeProfileClient from '@/components/profile/EmployeeProfileClient';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EmployeeProfilePage() {
    // 1. Grab the ID from the Next.js URL parameters
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id as string;

    // 2. Fetch the data using our new hook
    const { data: employee, isLoading, isError } = useEmployeeDetails(employeeId);

    // 3. Handle the loading state gracefully (No blank screens!)
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    // 4. Handle invalid IDs or network errors
    if (isError || !employee) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
                <div className="inline-block p-4 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    Failed to load employee profile. They may have been deleted, or the ID is invalid.
                </div>
            </div>
        );
    }

    // 5. Pass the cleanly fetched data to your client component tabs
    return (
        <div className="w-full bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>
                <EmployeeProfileClient id={employeeId} />
            </div>
        </div>
    );
}