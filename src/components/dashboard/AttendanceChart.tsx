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
import { ChevronDown, Loader2 } from "lucide-react";
// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "@/store/hooks"; 
import { fetchDashboardAttendance, setAttendanceTimeframe } from "@/store/dashboardSlice";

const LEGEND = [
    { label: "Present", color: "#60A5FA", key: "present" },
    { label: "Absent", color: "#94A3B8", key: "absent" },
];

interface AttendanceChartProps {
    isDark?: boolean;
}

const AttendanceChart = ({ isDark = false }: AttendanceChartProps) => {
    const dispatch = useAppDispatch();
    const [mounted, setMounted] = useState(false);
    
    // Pull the live data and loading states from Redux
    const { attendance, isLoading, attendanceTimeframe } = useAppSelector((state) => state.dashboard);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch data whenever the timeframe (week/month) changes
    useEffect(() => {
        dispatch(fetchDashboardAttendance(attendanceTimeframe));
    }, [dispatch, attendanceTimeframe]);

    // Handle the Week/Month toggle
    const handleTogglePeriod = () => {
        const newTimeframe = attendanceTimeframe === "week" ? "month" : "week";
        dispatch(setAttendanceTimeframe(newTimeframe));
    };

    // Format the backend data for Recharts
    // Recharts needs a flat array of objects. We also format the date string to look nice.
    const chartData = React.useMemo(() => {
        if (!attendance?.overviewChart) return [];
        
        return attendance.overviewChart.map((item) => {
            const dateObj = new Date(item._id);
            return {
                ...item,
                // If viewing a week, show short day names (Mon, Tue). If month, show dates (Oct 12)
                day: attendanceTimeframe === "week" 
                    ? dateObj.toLocaleDateString("en-US", { weekday: "short" })
                    : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            };
        });
    }, [attendance?.overviewChart, attendanceTimeframe]);

    // Render a placeholder skeleton while SSR hydrating or fetching initial data
    if (!mounted || (isLoading && !attendance)) {
        return (
            <div className={`rounded-2xl p-5 min-w-0 h-[360px] md:h-[400px] flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                 <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-5 min-w-0
                transition-all duration-300 relative
                ${isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white shadow-sm"}
            `}
        >
            {/* Show a subtle loading overlay if fetching new data while old data is visible */}
            {isLoading && attendance && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

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
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize
                            transition-all duration-200
                            ${isDark
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                        `}
                        onClick={handleTogglePeriod}
                        disabled={isLoading}
                    >
                        {attendanceTimeframe}
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full h-[260px] sm:h-[300px] md:h-[320px]">
                {chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
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
                                allowDecimals={false} // Since we are counting people, no decimals
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
                )}
            </div>
        </div>
    );
};

export default AttendanceChart;