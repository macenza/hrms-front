"use client";

import React, { useMemo } from 'react';
import { BarChart2, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AVATAR_COLORS } from '@/lib/data';

interface AttendanceListProps {
    isDark?: boolean;
    isEmployee?: boolean;
}

export default function AttendanceList({ isDark = false, isEmployee = false }: AttendanceListProps) {
    const router = useRouter();
    const { attendance, isLoading } = useAppSelector((state) => state.dashboard);

    // Performance: Memoize the top 5 recent check-ins so we don't recalculate on every layout render
    const displayList = useMemo(() => {
        if (!attendance?.recentList) return [];
        // Architect Note: Limit to 5 for the dashboard widget to prevent UI stretching
        return attendance.recentList.slice(0, 5); 
    }, [attendance?.recentList]);

    // Helpers
    const formatTime = (dateString?: string | null) => {
        if (!dateString) return "--:--";
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

    // UX: Skeleton Loader to prevent layout thrashing
    if (isLoading && !attendance) {
        return (
            <div className={`rounded-2xl p-5 flex flex-col gap-4 h-[340px] ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border`}>
                <div className="flex justify-between mb-2">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300 relative border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>    
            
            {/* Soft background loader when refreshing existing data */}
            {isLoading && attendance && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {isEmployee
                        ? "My Recent Check-ins" // Adjusted phrasing to make sense for a list
                        : `${attendance?.todayPresent || 0} Employees Present Today`}
                </h3>
                
                <button 
                    onClick={() => router.push(isEmployee ? '/profile/attendance' : '/attendance')} 
                    className="group flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                >
                    See All
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Column Headers */}
            <div className={`grid grid-cols-4 text-[11px] font-bold uppercase tracking-wider pb-2 border-b
                ${isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"}
            `}>
                <span className="col-span-1">{isEmployee ? "Date" : "Employee"}</span>
                <span className='text-center'>Clock IN</span>
                <span className='text-center'>Clock OUT</span>
                <span className='text-center'>Report</span>
            </div>

            {/* Rows */}
            <div className='flex flex-col gap-1'>
                {displayList.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl mt-2">
                        No check-ins found.
                    </div>
                ) : (
                    displayList.map((row) => {
                        const initial = getInitials(row.user.name);
                        const colorClass = AVATAR_COLORS[initial as keyof typeof AVATAR_COLORS] ?? "bg-gray-200 text-gray-600";
                        
                        return (
                            <div
                                key={row._id}
                                className={`grid grid-cols-4 items-center py-2.5 rounded-xl px-2 transition-colors duration-150 ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}
                            >
                                {/* Column 1: Employee OR Date (if employee view) */}
                                <div className="flex items-center gap-2.5">
                                    {!isEmployee && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                            {row.user.profile?.avatar ? (
                                                <img src={row.user.profile.avatar} alt={row.user.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                initial
                                            )}
                                        </div>
                                    )}
                                    <span className={`text-sm font-medium truncate max-w-[80px] sm:max-w-[120px] ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                        {isEmployee 
                                            ? new Date(row.checkInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                            : row.user.name}
                                    </span>
                                </div>

                                {/* Column 2: Clock In */}
                                <span className={`text-sm text-center font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {formatTime(row.checkInTime)}
                                </span>

                                {/* Column 3: Clock Out */}
                                <span className={`text-sm text-center font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {formatTime(row.checkOutTime)}
                                </span>

                                {/* Column 4: Report Action */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            // Architect Note: RBAC Routing protection
                                            if (isEmployee) {
                                                router.push('/profile/attendance');
                                            } else {
                                                router.push(`/employees/${row.user._id}`);
                                            }
                                        }}
                                        className={`
                                            w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                                            ${isDark ? "bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-blue-300" : "bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600"}
                                        `}
                                        aria-label={isEmployee ? "View my details" : `View report for ${row.user.name}`}
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