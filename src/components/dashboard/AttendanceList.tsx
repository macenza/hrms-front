"use client";

import React from 'react';
import { BarChart2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AVATAR_COLORS } from '@/lib/data';

interface AttendanceListProps {
    isDark?: boolean;
}

const AttendanceList = ({ isDark = false }: AttendanceListProps) => {
    const router = useRouter();
    
    // Pull the live data from our Redux store
    const { attendance, isLoading } = useAppSelector((state) => state.dashboard);

    // Format the date strings coming from MongoDB into readable times (e.g., "09:00 AM")
    const formatTime = (dateString?: string | null) => {
        if (!dateString) return "--:--";
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Extract the first letter of the name for the avatar fallback
    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

    if (isLoading && !attendance) {
        return (
            <div className={`rounded-2xl p-5 flex items-center justify-center h-[300px] ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className={`rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {/* Dynamically show the total count */}
                    {attendance?.todayPresent || 0} Attendance Today
                </h3>
                
                {/* Make the See All button work */}
                <button 
                    onClick={() => router.push('/attendance')} 
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                    See All
                </button>
            </div>

            {/* Column Headers */}
            <div className={`grid grid-cols-4 text-xs font-medium pb-1 border-b
                ${isDark ? "text-gray-400 border-gray-700" : "text-gray-400 border-gray-100"}
            `}>
                <span>Employee Shift</span>
                <span className='text-center'>Clock IN</span>
                <span className='text-center'>Clock OUT</span>
                <span className='text-center'>Report</span>
            </div>

            {/* Rows */}
            <div className='flex flex-col gap-2'>
                {!attendance?.recentList || attendance.recentList.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-4">
                        No check-ins yet today.
                    </div>
                ) : (
                    attendance.recentList.map((row) => {
                        const initial = getInitials(row.user.name);
                        // Pick a consistent color based on the initial so it doesn't change on re-render
                        const colorClass = AVATAR_COLORS[initial as keyof typeof AVATAR_COLORS] ?? "bg-gray-200 text-gray-600";

                        return (
                            <div
                                key={row._id}
                                className={`grid grid-cols-4 items-center py-2 rounded-xl px-1 transition-colors duration-150 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                            >
                                {/* Employee */}
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colorClass}`}
                                    >
                                        {row.user.profile?.avatar ? (
                                            <img src={row.user.profile.avatar} alt={row.user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium truncate max-w-[80px] sm:max-w-[120px] ${isDark ? "text-gray-100" : "text-gray-700"}`}>
                                        {row.user.name}
                                    </span>
                                </div>

                                {/* Clock In */}
                                <span className={`text-sm text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {formatTime(row.checkInTime)}
                                </span>

                                {/* Clock Out */}
                                <span className={`text-sm text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {formatTime(row.checkOutTime)}
                                </span>

                                {/* Report Icon */}
                                <div className="flex justify-center">
                                    <button
                                        // You can route this to an individual employee report later
                                        onClick={() => router.push(`/employees/${row.user._id}`)}
                                        className={`
                                            w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                                            ${isDark ? "bg-gray-700 text-green-400 hover:bg-gray-600" : "bg-green-50 text-green-500 hover:bg-green-100"}
                                        `}
                                        aria-label={`View report for ${row.user.name}`}
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
};

export default AttendanceList;