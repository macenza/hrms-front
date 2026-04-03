"use client";

import React from "react";
import { CalendarDays, Upload } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
// import AttendanceChart from "@/components/dashboard/AttendanceChart";
import EmployeeSummary from "@/components/dashboard/EmployeeSummary";
import AttendanceList from "@/components/dashboard/AttendanceList";
// import WorkingFormat from "@/components/dashboard/WorkingFormat";
import { STAT_CARDS } from "@/lib/data";
import dynamic from 'next/dynamic';


// This forces Next.js to skip Turbopack SSR for these specific components.
const AttendanceChart = dynamic(
    () => import('@/components/dashboard/AttendanceChart'),
    {
        ssr: false,
        // Show a loading skeleton while the client fetches the chart
        loading: () => <div className="h-[320px] w-full bg-gray-100 animate-pulse rounded-2xl" />
    }
);

const WorkingFormat = dynamic(
    () => import('@/components/dashboard/WorkingFormat'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
    }
);


export default function DashboardPage() {
    const isDark = false;
    return (
        <div className="flex flex-col gap-6">
            {/* ── Page Heading ── */}
            <div className="flex items-center justify-between">
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>
                    Dashboard Overview
                </h1>

                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <button
                        className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-colors duration-200
                ${isDark
                                ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }
            `}
                    >
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        This Month
                    </button>

                    {/* Export */}
                    <button
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
              transition-colors duration-200
              ${isDark
                                ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }
            `}
                    >
                        <Upload className="w-4 h-4 text-gray-400" />
                        Export
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
