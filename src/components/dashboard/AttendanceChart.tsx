"use client";

import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { ATTENDANCE_DATA } from "@/lib/data";

const LEGEND = [
    { label: "On Time", color: "#60A5FA" }, // blue-400
    { label: "Late Arrival", color: "#A78BFA" }, // violet-400
    { label: "Absent", color: "#E2E8F0" }, // slate-200
];

interface AttendanceChartProps {
    isDark?: boolean;
}

const AttendanceChart = ({ isDark = false }: AttendanceChartProps) => {
    const [period, setPeriod] = useState<"Week" | "Month">("Week");
    return (
        <div
            className={`
        rounded-2xl p-5 flex flex-col gap-4
        transition-colors duration-300
        ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}
        `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Attendance Overview
                </h3>

                <div className="flex items-center gap-4">
                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-3">
                        {LEGEND.map((l) => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                                    {l.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Period selector */}
                    <button
                        className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-colors duration-200
                ${isDark
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }
            `}
                        onClick={() => setPeriod((p) => (p === "Week" ? "Month" : "Week"))}
                    >
                        {period}
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={ATTENDANCE_DATA}
                    barCategoryGap="30%"
                    barGap={3}
                    margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                >
                    <CartesianGrid
                        vertical={false}
                        stroke={isDark ? "#374151" : "#F1F5F9"}
                        strokeDasharray="0"
                    />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 11,
                            fill: isDark ? "#9CA3AF" : "#94A3B8",
                            fontFamily: "inherit",
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                        tick={{
                            fontSize: 11,
                            fill: isDark ? "#9CA3AF" : "#94A3B8",
                            fontFamily: "inherit",
                        }}
                    />
                    <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                            background: isDark ? "#1F2937" : "#fff",
                            border: isDark ? "1px solid #374151" : "1px solid #E2E8F0",
                            borderRadius: 10,
                            fontSize: 12,
                            color: isDark ? "#E5E7EB" : "#374151",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                    />
                    <Bar dataKey="onTime" name="On Time" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="lateArrival" name="Late Arrival" fill="#A78BFA" radius={[4, 4, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="absent" name="Absent" fill={isDark ? "#4B5563" : "#E2E8F0"} radius={[4, 4, 0, 0]} maxBarSize={12} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AttendanceChart