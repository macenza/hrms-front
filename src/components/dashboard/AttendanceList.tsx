// src/components/dashboard/AttendanceList.tsx
"use client";

import React, { useMemo } from 'react';
import { BarChart2, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

// Aligning interface with Mongoose Backend Output
export interface AttendanceLog {
    _id: string;
    user: { 
        _id: string; 
        name: string; 
        profile?: { avatar?: string } 
    };
    checkInTime: string;
    checkOutTime?: string | null;
}

interface AttendanceListProps {
    isEmployee?: boolean;
    listData?: AttendanceLog[];
    isLoading?: boolean;
}

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
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

    const formatTime = (dateString?: string | null) => {
        if (!dateString) return "--:--";
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

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
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
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
                    {isEmployee ? "My Recent Check-ins" : "Recent Check-ins"}
                </h3>
                <button 
                    onClick={() => router.push(isEmployee ? '/profile/attendance' : '/attendance')} 
                    className="group flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md"
                >
                    See All
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 text-[11px] font-bold uppercase tracking-wider pb-2 border-b text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800 transition-colors">
                <span className="col-span-1">{isEmployee ? "Date" : "Employee"}</span>
                <span className='text-center'>Clock IN</span>
                <span className='text-center'>Clock OUT</span>
                <span className='text-center'>Report</span>
            </div>

            {/* List Body */}
            <div className='flex flex-col gap-1'>
                {displayList.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl mt-2 transition-colors">
                        No check-ins found.
                    </div>
                ) : (
                    displayList.map((row) => {
                        const userName = row.user?.name || 'Unknown';
                        const initial = getInitials(userName);
                        
                        return (
                            <div
                                key={row._id}
                                className="grid grid-cols-4 items-center py-2.5 rounded-xl px-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    {!isEmployee && (
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                            getAvatarColor(userName)
                                        )}>
                                            {row.user?.profile?.avatar ? (
                                                <img src={row.user.profile.avatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                initial
                                            )}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium truncate max-w-[80px] sm:max-w-[120px] text-gray-700 dark:text-gray-200 transition-colors">
                                        {isEmployee 
                                            ? new Date(row.checkInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                            : userName}
                                    </span>
                                </div>

                                <span className="text-sm text-center font-medium text-gray-600 dark:text-gray-300 transition-colors">
                                    {formatTime(row.checkInTime)}
                                </span>
                                
                                <span className="text-sm text-center font-medium text-gray-500 dark:text-gray-400 transition-colors">
                                    {formatTime(row.checkOutTime)}
                                </span>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            if (isEmployee) {
                                                router.push('/profile/attendance');
                                            } else {
                                                router.push(`/employees/${row.user._id}`);
                                            }
                                        }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-blue-50 dark:bg-gray-800 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-300"
                                        aria-label={isEmployee ? "View my details" : `View report for ${userName}`}
                                    >
                                        <BarChart2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}