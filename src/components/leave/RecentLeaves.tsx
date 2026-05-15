// src/components/leave/RecentLeaves.tsx
'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useLeaveRequests } from '@/hooks/api/useLeave';
import { Leave } from '@/types';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

// Premium Skeleton Loader
const RecentLeaveSkeleton = () => (
    <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 animate-pulse bg-white dark:bg-gray-900 transition-colors">
        <div className="flex items-start gap-3 w-2/3">
            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-2/3" />
            </div>
        </div>
        <div className="space-y-2 flex flex-col items-end shrink-0">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-20" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12" />
        </div>
    </div>
);

export default function RecentLeaves() {
    const { user } = useAppSelector((state) => state.auth);
    const isHrOrAdmin = user?.role === 'HR' || user?.role === 'Admin';

    // Leverage React Query to pull the globally cached data
    const { 
        data: rawData, 
        isLoading, 
        isError 
    } = useLeaveRequests(isHrOrAdmin ? undefined : user?.id);

    // Safely extract the array regardless of backend payload structure
    const leaves: Leave[] = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.leaves || rawData?.results || []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="flex w-fit items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 transition-colors"><CheckCircle2 size={12}/> Approved</span>;
            case 'Rejected': return <span className="flex w-fit items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded border border-red-200 dark:border-red-900/50 transition-colors"><XCircle size={12}/> Rejected</span>;
            case 'Pending': return <span className="flex w-fit items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-900/50 transition-colors"><Clock size={12}/> Pending</span>;
            default: return <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded transition-colors">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {Array.from({ length: 4 }).map((_, idx) => <RecentLeaveSkeleton key={idx} />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 transition-colors">
                <AlertCircle size={18} /> Failed to load recent leaves.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 transition-colors">
                    {isHrOrAdmin ? 'Organization Leave Requests' : 'My Recent Leaves'}
                </h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50 transition-colors">
                {leaves.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <Calendar size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No leave requests.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Recent time-off requests will appear here.</p>
                    </div>
                ) : (
                    leaves.slice(0, 5).map((leave) => (
                        <div key={leave._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group cursor-pointer">
                            <div className="flex items-start gap-3 min-w-0 pr-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5 transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {leave.leaveType} Leave
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors truncate">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate transition-colors">
                                        "{leave.reason}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {getStatusBadge(leave.status)}
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded transition-colors">
                                    {leave.numberOfDays} Day(s)
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}