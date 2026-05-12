// src/app/(main)/dashboard/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { CalendarDays, Upload, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import StatCard from "@/components/dashboard/StatCard";
import EmployeeSummary from "@/components/dashboard/EmployeeSummary";
import AttendanceList from "@/components/dashboard/AttendanceList";
import { STAT_CARDS } from "@/lib/data";
import { useAppSelector } from "@/store/hooks";
import { useDashboardStats, useDashboardAttendance } from "@/hooks/api/useDashboard";

// Dynamic imports with Premium Skeleton Loaders
const AttendanceChart = dynamic(
    () => import('@/components/dashboard/AttendanceChart'),
    {
        ssr: false,
        loading: () => <div className="h-[320px] w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse rounded-xl" />
    }
);

const WorkingFormat = dynamic(
    () => import('@/components/dashboard/WorkingFormat'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse rounded-xl" />
    }
);

export default function DashboardPage() {
    // 1. Auth & RBAC State (From Redux)
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';
    const isEmployee = role === 'employee';

    // 2. Local UI State
    const [attendanceTimeframe, setAttendanceTimeframe] = useState<'week' | 'month'>('month');
    const activeTimeframe = isEmployee ? 'month' : attendanceTimeframe;

    // 3. React Query Data Fetching
    const { 
        data: statsData, 
        isLoading: isStatsLoading 
    } = useDashboardStats(isAuthenticated && isAdminOrHR); // RBAC Gate

    const { 
        data: attendanceData, 
        isLoading: isAttendanceLoading 
    } = useDashboardAttendance(activeTimeframe);

    const isLoading = isStatsLoading || isAttendanceLoading;
    const stats = statsData?.stats;

    // 4. Export Logic
    const csvContent = useMemo(() => {
        if (!stats) return null;
        return [
            ["Metric", "Count"],
            ["Total Employees", stats.totalUsers],
            ["Active Employees", stats.activeUsers],
            ["Inactive Employees", stats.inactiveUsers],
            ...Object.entries(stats.usersByTeam || {}).map(([team, count]) => [`Team: ${team}`, count])
        ].map(e => e.join(",")).join("\n");
    }, [stats]);

    const handleExport = () => {
        if (!csvContent) return;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HRMS_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3 transition-colors">
                        {isEmployee ? "My Dashboard" : "Dashboard Overview"}
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                    </h1>
                    
                    <div className="flex items-center gap-3">
                        {/* Timeframe Toggle (Disabled for basic employees) */}
                        <button
                            onClick={() => !isEmployee && setAttendanceTimeframe(prev => prev === 'month' ? 'week' : 'month')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all border
                                ${isEmployee ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'}
                                bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none
                            `}
                        >
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            This {activeTimeframe}
                        </button>

                        {/* Admin Export Button */}
                        {isAdminOrHR && (
                            <button
                                onClick={handleExport}
                                disabled={!stats || isLoading}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI Cards (Admin/HR Only) */}
                {isAdminOrHR && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {STAT_CARDS.map((card) => (
                            // Note: Removed the `isDark` prop. The component itself must use `dark:` Tailwind classes now.
                            <StatCard 
                            key={card.id} 
                            card={card} 
                            statsData={stats} 
                            attendanceData={{ todayPresent: stats?.activeUsers }} // Or specific data if available
                            isLoading={isLoading} 
                        />
                        ))}
                    </div>
                )}

                {/* Charts & Summary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                        <AttendanceChart 
                            timeframe={activeTimeframe} 
                            isEmployee={isEmployee}
                            chartData={attendanceData} 
                        />
                    </div>
                    {isAdminOrHR && (
                        <div className="lg:col-span-2">
                            <EmployeeSummary employees={stats?.recentEmployees} />
                        </div>
                    )}
                </div>

                {/* Lists & Formats Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                        <AttendanceList isEmployee={isEmployee} listData={attendanceData?.logs} />
                    </div>
                    {isAdminOrHR && (
                        <div className="lg:col-span-2">
                            <WorkingFormat formatData={stats?.workFormats} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}