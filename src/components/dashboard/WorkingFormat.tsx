// src/components/dashboard/WorkingFormat.tsx
"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const ROLE_COLORS: Record<string, string> = {
    "Admin": "#8B5CF6",    // purple-500
    "HR": "#EC4899",       // pink-500
    "Employee": "#3B82F6", // blue-500
    "Unspecified": "#9CA3AF" // gray-400
};

interface WorkingFormatProps {
    formatData?: Record<string, number>;
    isLoading?: boolean;
    disableAnimations?: boolean;
}

// Custom tooltip to ensure perfect Tailwind dark mode support
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-lg transition-colors">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {payload[0].payload.label}: <span className="text-blue-600 dark:text-blue-400">{payload[0].value} employees</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function WorkingFormat({ 
    formatData = {}, 
    isLoading = false, 
    disableAnimations = false 
}: WorkingFormatProps) {
    
    const chartData = useMemo(() => {
        if (!formatData) return [];
        return Object.entries(formatData).map(([label, count]) => ({
            label,
            count,
            color: ROLE_COLORS[label] || ROLE_COLORS["Unspecified"]
        }));
    }, [formatData]);

    const total = chartData.reduce((acc, s) => acc + s.count, 0);

    // Premium Skeleton Loader
    if (isLoading && chartData.length === 0) {
        return (
            <div className="rounded-xl p-5 flex items-center justify-center h-full min-h-[340px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-xl p-5 flex flex-col gap-4 h-full min-w-0 relative min-h-[340px]",
                "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none",
                !disableAnimations && "transition-colors duration-300"
            )}
        >
            {/* Background Fetching Overlay */}
            {isLoading && chartData.length > 0 && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl transition-opacity">
                    <Loader2 className={cn("w-6 h-6 text-blue-500", !disableAnimations && "animate-spin")} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Role Distribution
                </h3>
                <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md">
                    See All
                </button>
            </div>

            {/* Content */}
            {chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl mt-2 transition-colors">
                    No role data available.
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4 flex-1">            
                    
                    {/* Chart Container */}
                    <div className="relative w-40 h-40 shrink-0">
                        <PieChart width={160} height={160}>
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={3}
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                                isAnimationActive={!disableAnimations}
                            >
                                {chartData.map((segment) => (
                                    <Cell 
                                        key={segment.label} 
                                        fill={segment.color} 
                                        style={{ outline: 'none' }} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                        </PieChart>
                        
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black leading-none mb-1 tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                                {total}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">
                                Total
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        {chartData.map((segment) => (
                            <div key={segment.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-sm flex items-center justify-between gap-4 w-full text-gray-600 dark:text-gray-400 transition-colors">
                                    <span className="text-xs font-medium">{segment.label}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                        {segment.count}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}