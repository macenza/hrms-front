"use client";

import React, { useEffect, useMemo } from "react";
import { CalendarDays, Upload, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

// Components
import StatCard from "@/components/dashboard/StatCard";
import EmployeeSummary from "@/components/dashboard/EmployeeSummary";
import AttendanceList from "@/components/dashboard/AttendanceList";
import { STAT_CARDS } from "@/lib/data";

// Redux
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats, fetchDashboardAttendance } from "@/store/dashboardSlice";

// Skip SSR for Recharts components - significantly improves initial load time
const AttendanceChart = dynamic(
    () => import('@/components/dashboard/AttendanceChart'),
    {
        ssr: false,
        loading: () => <div className="h-[320px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
    }
);

const WorkingFormat = dynamic(
    () => import('@/components/dashboard/WorkingFormat'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
    }
);

export default function DashboardPage() {
    const isDark = false; // Hook this up to ThemeProvider later
    const dispatch = useAppDispatch();
    
    // Pull global state
    const { stats, attendanceTimeframe, isLoading } = useAppSelector((state) => state.dashboard);
    
    // Architect Note: Assuming auth state exists. Adjust the path if your slice is named differently.
    const { user } = useAppSelector((state) => state.auth);

    // RBAC Flags
    const role = user?.role?.toLowerCase() || 'employee'; // Fallback to lowest privilege
    const isAdminOrHR = role === 'admin' || role === 'hr';
    const isEmployee = role === 'employee';

    // Override timeframe for employees (Change 3)
    const activeTimeframe = isEmployee ? 'month' : attendanceTimeframe;

    useEffect(() => {
        // Only fetch global stats if the user has permission
        if (isAdminOrHR) {
            dispatch(fetchDashboardStats());
        }
        
        // Fetch attendance. The backend should automatically scope this to "self" if role is Employee
        dispatch(fetchDashboardAttendance(activeTimeframe));
    }, [dispatch, activeTimeframe, isAdminOrHR]);

    // Performance Optimization: Memoize CSV generation so it doesn't recalculate on every re-render
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
        <div className="flex flex-col gap-6">
            {/* ── Page Heading ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-800"}`}>
                    {isEmployee ? "My Dashboard" : "Dashboard Overview"}
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                </h1>

                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <button
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium capitalize
                            transition-colors duration-200 cursor-default
                            ${isDark ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-600 border-gray-200"} border
                        `}
                    >
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        This {activeTimeframe}
                    </button>

                    {/* Export Button - Only Admin/HR usually need this, but leaving it if Employees export their own attendance */}
                    {isAdminOrHR && (
                        <button
                            onClick={handleExport}
                            disabled={!stats}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                                transition-colors duration-200
                                ${isDark ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"} border
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <Upload className="w-4 h-4 text-gray-400" />
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* ── Stat Cards Row (Admin/HR Only) ── */}
            {isAdminOrHR && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {STAT_CARDS.map((card) => (
                        <StatCard key={card.id} card={card} isDark={isDark} disableAnimations={true} />
                    ))}
                </div>
            )}
            
            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Attendance Chart – Spans full width if Employee */}
                <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                    <AttendanceChart 
                        isDark={isDark} 
                        timeframe={activeTimeframe} 
                        isEmployee={isEmployee} 
                        disableAnimations={true} 
                    />
                </div>

                {/* Employee Summary – Admin/HR Only */}
                {isAdminOrHR && (
                    <div className="lg:col-span-2">
                        <EmployeeSummary isDark={isDark} disableAnimations={true} />
                    </div>
                )}
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Attendance List – Spans full width if Employee */}
                <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                    <AttendanceList isDark={isDark} isEmployee={isEmployee} />
                </div>

                {/* Working Format Donut – Admin/HR Only */}
                {isAdminOrHR && (
                    <div className="lg:col-span-2">
                        <WorkingFormat isDark={isDark} disableAnimations={true} />
                    </div>
                )}
            </div>
        </div>
    );
}