"use client";

import React, { useEffect } from "react";
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

// Skip SSR for Recharts components
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
    const isDark = false; // You can hook this up to your ThemeProvider later
    const dispatch = useAppDispatch();
    
    // Pull global state
    const { stats, attendanceTimeframe, isLoading } = useAppSelector((state) => state.dashboard);

    // Trigger initial data fetch when the dashboard mounts
    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchDashboardAttendance(attendanceTimeframe));
    }, [dispatch, attendanceTimeframe]);

    // Handle Client-Side CSV Export
    const handleExport = () => {
        if (!stats) return;

        // Create CSV content from the Redux stats
        const csvContent = [
            ["Metric", "Count"],
            ["Total Employees", stats.totalUsers],
            ["Active Employees", stats.activeUsers],
            ["Inactive Employees", stats.inactiveUsers],
            ...Object.entries(stats.usersByTeam).map(([team, count]) => [`Team: ${team}`, count])
        ].map(e => e.join(",")).join("\n");

        // Trigger browser download
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
                    Dashboard Overview
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                </h1>

                <div className="flex items-center gap-3">
                    {/* Period selector (Reflects Redux State) */}
                    <button
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium capitalize
                            transition-colors duration-200 cursor-default
                            ${isDark
                                ? "bg-gray-800 text-gray-300 border border-gray-700"
                                : "bg-white text-gray-600 border border-gray-200"
                            }
                        `}
                    >
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        This {attendanceTimeframe}
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={!stats}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                            transition-colors duration-200
                            ${isDark
                                ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <Upload className="w-4 h-4 text-gray-400" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── Stat Cards Row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map((card) => (
                    <StatCard key={card.id} card={card} isDark={isDark} />
                ))}
            </div>
            
            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Attendance Chart – wider */}
                <div className="lg:col-span-3">
                    <AttendanceChart isDark={isDark} />
                </div>

                {/* Employee Summary – narrower */}
                <div className="lg:col-span-2">
                    <EmployeeSummary isDark={isDark} />
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Attendance List – wider */}
                <div className="lg:col-span-3">
                    <AttendanceList isDark={isDark} />
                </div>

                {/* Working Format Donut – narrower */}
                <div className="lg:col-span-2">
                    <WorkingFormat isDark={isDark} />
                </div>
            </div>
        </div>
    );
}