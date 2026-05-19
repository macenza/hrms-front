// src/components/dashboard/AttendanceChart.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";
import type { DailyAttendance, DashboardAttendance } from "@/store/dashboardSlice";

const LEGEND = [
    { label: "Present", color: "#60A5FA", key: "present" },
    { label: "Absent", color: "#94A3B8", key: "absent" },
];

interface AttendanceChartProps {
    timeframe?: 'week' | 'month';
    isEmployee?: boolean;
    disableAnimations?: boolean;
    isLoading?: boolean;
    chartData?: Pick<DashboardAttendance, 'overviewChart'> | null;
}

const AttendanceChart = ({ 
    timeframe = 'week', 
    isEmployee = false,
    disableAnimations = false,
    isLoading = false,
    chartData: dataFromApi,
}: AttendanceChartProps) => {
    
    // Required to prevent hydration mismatch with Recharts
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const chartData = useMemo(() => {
        if (!dataFromApi?.overviewChart) return [];
        
        return dataFromApi.overviewChart.map((item: DailyAttendance) => {
            const [yearStr, monthStr, dayStr] = item._id.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1; 
            const day = parseInt(dayStr, 10);
            
            let displayDay = "";
            if (timeframe === "week") {
                const utcDate = new Date(Date.UTC(year, month, day));
                displayDay = new Intl.DateTimeFormat('en-US', { 
                    weekday: 'short', 
                    timeZone: 'UTC' 
                }).format(utcDate);
            } else {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                displayDay = `${monthNames[month]} ${day}`;
            }
            return {
                ...item,
                day: displayDay
            };
        });
    }, [dataFromApi?.overviewChart, timeframe]);

    if (!mounted || (isLoading && !dataFromApi?.overviewChart?.length)) {
        return (
            <div className="rounded-xl p-5 min-w-0 h-[360px] md:h-[400px] flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 flex flex-col gap-5 min-w-0 transition-colors duration-300 relative border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-[1px]">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    {isEmployee ? "My Monthly Attendance" : "Attendance Overview"}
                </h3> 
                
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        {LEGEND.map((l) => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: l.color }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                                    {l.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-[260px] sm:h-[300px] md:h-[320px]">
                {chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 transition-colors">
                        No attendance data found for this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            barCategoryGap="25%"
                            barGap={4}
                            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                        >
                            {/* CartesianGrid stroke color cannot use pure Tailwind classes directly via Recharts API.
                                It requires explicit hex. In a real-world app, you'd use a useTheme hook, but for now, 
                                transparent grid lines or a very soft gray works globally. */}
                            <CartesianGrid
                                vertical={false}
                                stroke="#E2E8F0"
                                strokeOpacity={0.3} 
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#94A3B8" }} // Neutral Slate
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                tick={{ fontSize: 12, fill: "#94A3B8" }} // Neutral Slate
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                                contentStyle={{
                                    // Hardcoded fallback for tooltip as Recharts struggles with dark mode injection dynamically without context hooks
                                    background: "#1E293B", 
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                    fontSize: 12,
                                    color: "#F8FAFC",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                }}
                            />
                            {LEGEND.map((item) => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    fill={item.color}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={14}
                                    isAnimationActive={!disableAnimations}
                                    animationDuration={800}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default AttendanceChart;