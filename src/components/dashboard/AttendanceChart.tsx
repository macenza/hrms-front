"use client";

import React, { useState, useEffect } from "react";
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
    { label: "On Time", color: "#60A5FA", key: "onTime" },
    { label: "Late Arrival", color: "#A78BFA", key: "lateArrival" },
    { label: "Absent", color: "#94A3B8", key: "absent" },
];

interface AttendanceChartProps {
    isDark?: boolean;
}

const AttendanceChart = ({ isDark = false }: AttendanceChartProps) => {
    const [period, setPeriod] = useState<"Week" | "Month">("Week");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Render a placeholder skeleton of the exact same size while server-side rendering
    if (!mounted) {
        return (
            <div className={`rounded-2xl p-5 min-w-0 h-[360px] md:h-[400px] ${isDark ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                <div className="animate-pulse h-full w-full bg-gray-200/50 rounded-xl" />
            </div>
        );
    }

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-5 min-w-0
                transition-all duration-300
                ${isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white shadow-sm"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Attendance Overview
                </h3>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        {LEGEND.map((l) => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: l.color }}
                                />
                                <span className="text-xs text-gray-400">
                                    {l.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all duration-200
                            ${isDark
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                        `}
                        onClick={() =>
                            setPeriod((p) => (p === "Week" ? "Month" : "Week"))
                        }
                    >
                        {period}
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full h-[260px] sm:h-[300px] md:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        width={500}
                        height={300}
                        data={ATTENDANCE_DATA}
                        barCategoryGap="25%"
                        barGap={4}
                        margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke={isDark ? "#374151" : "#F1F5F9"}
                        />

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: isDark ? "#9CA3AF" : "#94A3B8",
                            }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `${v}%`}
                            tick={{
                                fontSize: 12,
                                fill: isDark ? "#9CA3AF" : "#94A3B8",
                            }}
                        />

                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                background: isDark ? "#1F2937" : "#fff",
                                border: isDark
                                    ? "1px solid #374151"
                                    : "1px solid #E2E8F0",
                                borderRadius: 12,
                                fontSize: 12,
                                color: isDark ? "#E5E7EB" : "#374151",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                            }}
                        />

                        {LEGEND.map((item) => (
                            <Bar
                                key={item.key}
                                dataKey={item.key}
                                fill={item.color}
                                radius={[6, 6, 0, 0]}
                                maxBarSize={14}
                                animationDuration={800}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AttendanceChart;