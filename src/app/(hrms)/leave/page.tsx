// src/app/(main)/leave/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import LeaveTable from '@/components/leave/LeaveTable';
import ApplyLeaveModal from '@/components/leave/ApplyLeaveModal';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';

export default function LeavePage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 1. Route Protection
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Leave Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Track, manage, and request time off.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold w-full sm:w-auto"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Apply Leave
                    </Button>
                </div>
                
                <LeaveTable />
                
                {/* Action Modals */}
                <ApplyLeaveModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </div>
        </div>
    );
}