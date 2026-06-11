// src/components/dashboard/AttendanceList.tsx
"use client";

import React, { useMemo } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { PendingLeaveRequest } from '@/store/dashboardSlice';

interface AttendanceListProps {
    isEmployee?: boolean;
    listData?: PendingLeaveRequest[];
    isLoading?: boolean;
}

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-50/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export default function AttendanceList({ 
    isEmployee = false, 
    listData = [], 
    isLoading = false 
}: AttendanceListProps) {
    const router = useRouter();

    const displayList = useMemo(() => {
        if (!listData) return [];
        return listData.slice(0, 5); 
    }, [listData]);

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

    const formatLeaveType = (type: string) => {
        if (!type) return 'Leave';
        if (type.toLowerCase().endsWith('leave')) {
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Leave`;
    };

    const formatAppliedDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Premium Skeleton Loader
    if (isLoading && (!listData || listData.length === 0)) {
        return (
            <div className="rounded-xl p-5 flex flex-col gap-4 h-[340px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="flex justify-between mb-2">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 flex flex-col gap-4 transition-colors duration-300 relative border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none min-h-[340px]">    
            
            {/* Background Fetching Overlay */}
            {isLoading && displayList.length > 0 && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl transition-opacity">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Pending Leave Requests
                </h3>
                <Link 
                    href="/leave" 
                    className="group flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md"
                >
                    View All
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider pb-2 border-b text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800 transition-colors px-2">
                <span className="col-span-5 text-left">Employee</span>
                <span className="col-span-3 text-left">Leave Type</span>
                <span className="col-span-2 text-center">Duration</span>
                <span className="col-span-2 text-center">Applied On</span>
            </div>

            {/* List Body */}
            <div className='flex flex-col gap-1'>
                {displayList.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl mt-2 transition-colors">
                        No pending leave requests.
                    </div>
                ) : (
                    displayList.map((row) => {
                        const userName = row.employeeName;
                        const initial = getInitials(userName);
                        
                        return (
                            <div
                                key={row._id}
                                className="grid grid-cols-12 items-center py-2.5 rounded-xl px-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer"
                                onClick={() => router.push('/leave')}
                            >
                                <div className="col-span-5 flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                        getAvatarColor(userName)
                                    )}>
                                        {row.avatar ? (
                                            <img 
                                                src={row.avatar.startsWith('http') 
                                                    ? row.avatar 
                                                    : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:4000'}${row.avatar}`} 
                                                alt={userName} 
                                                className="w-full h-full rounded-full object-cover" 
                                            />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                    <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-200 transition-colors">
                                        {userName}
                                    </span>
                                </div>

                                <span className="col-span-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                                    {formatLeaveType(row.leaveType)}
                                </span>
                                
                                <span className="col-span-2 text-sm text-center font-medium text-gray-500 dark:text-gray-400 transition-colors">
                                    {row.numberOfDays} {row.numberOfDays === 1 ? 'Day' : 'Days'}
                                </span>

                                <span className="col-span-2 text-sm text-center font-medium text-gray-500 dark:text-gray-400 transition-colors">
                                    {formatAppliedDate(row.createdAt)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}