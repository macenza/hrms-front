'use client';

import React from 'react';
import { Calendar, Thermometer, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { useLeaveStats } from '@/hooks/api/useLeave';
import { cn } from '@/utils/cn';

export interface LeaveBalance {
    used: number;
    total: number;
}

export interface LeaveStatsData {
    annual: LeaveBalance;
    sick: LeaveBalance;
    pendingRequests: number;
    approvedYTD: number;
}

// Skeleton Loader for Stats
const StatSkeleton = () => (
    <Card className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors">
        <CardContent className="p-5 flex items-start justify-between">
            <div className="space-y-3 w-2/3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </CardContent>
    </Card>
);

export default function LeaveStats() {
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase();
    const isAdminOrHR = role === 'admin' || role === 'hr';

    // Fetch data using React Query
    // Pass undefined for Admin/HR to fetch all stats, or the user's ID for personal stats
    const { data: rawData, isLoading, isError } = useLeaveStats(isAdminOrHR ? undefined : user?.id);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
            </div>
        );
    }

    if (isError || !rawData) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 flex items-center gap-2 transition-colors">
                <AlertCircle size={18} />
                Failed to load statistics. Please try refreshing the page.
            </div>
        );
    }

    // Map the raw data to our structured interface
    const dataObj = rawData?.data || rawData || {};
    const stats: LeaveStatsData = {
        annual: {
            used: dataObj.annual?.used || 0,
            total: dataObj.annual?.total || 20, 
        },
        sick: {
            used: dataObj.sick?.used || 0,
            total: dataObj.sick?.total || 10,
        },
        pendingRequests: dataObj.pendingRequests || 0,
        approvedYTD: dataObj.approvedYTD || 0,
    };

    const statCards = [
        {
            title: isAdminOrHR ? "Org Annual Leaves Used" : "My Annual Leave",
            value: stats.annual.used,
            suffix: `/ ${stats.annual.total} days`,
            icon: <Calendar size={22} />,
            colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
        },
        {
            title: isAdminOrHR ? "Org Sick Leaves Used" : "My Sick Leave",
            value: stats.sick.used,
            suffix: `/ ${stats.sick.total} days`,
            icon: <Thermometer size={22} />,
            colorClass: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
        },
        {
            title: isAdminOrHR ? "Org Pending Requests" : "My Pending Requests",
            value: stats.pendingRequests,
            suffix: null,
            icon: <Clock size={22} />,
            colorClass: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
        },
        {
            title: isAdminOrHR ? "Org Approved (YTD)" : "My Approved (YTD)",
            value: stats.approvedYTD,
            suffix: null,
            icon: <CheckCircle2 size={22} />,
            colorClass: "text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {statCards.map((stat, index) => (
                <Card 
                    key={index} 
                    className="border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 bg-white dark:bg-gray-900 transition-all duration-300 group"
                >
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                {stat.value}
                                {stat.suffix && (
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-normal ml-1 transition-colors">
                                        {stat.suffix}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className={cn("p-3 rounded-xl transition-colors", stat.colorClass)}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}