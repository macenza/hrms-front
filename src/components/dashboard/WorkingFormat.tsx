"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";

// Color mapping to reflect Roles instead of formats
const ROLE_COLORS: Record<string, string> = {
    "Admin": "#8B5CF6",    // purple-500
    "HR": "#EC4899",       // pink-500
    "Employee": "#3B82F6", // blue-500
    "Unspecified": "#9CA3AF" // gray-400
};

interface WorkingFormatProps {
    isDark?: boolean;
    disableAnimations?: boolean; // Accept animation flag
}

export default function WorkingFormat({ isDark = false, disableAnimations = false }: WorkingFormatProps) {
    const { attendance, isLoading } = useAppSelector((state) => state.dashboard);

    const chartData = React.useMemo(() => {
        if (!attendance?.workingFormat) return [];
        return Object.entries(attendance.workingFormat).map(([label, count]) => ({
            label,
            count,
            color: ROLE_COLORS[label] || ROLE_COLORS["Unspecified"]
        }));
    }, [attendance?.workingFormat]);

    const total = chartData.reduce((acc, s) => acc + s.count, 0);

    if (isLoading && !attendance) {
        return (
            <div className={`rounded-2xl p-5 flex items-center justify-center h-full min-h-[220px] transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border`}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-4 h-full min-w-0 relative
                transition-colors duration-300 shadow-sm border
                ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}
            `}
        >
            {isLoading && attendance && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Role Distribution
                </h3>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md">
                    See All
                </button>
            </div>
            
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                    No role data available.
                </div>
            ) : (
                <div className="flex items-center gap-6 mt-2">             
                    <div className="relative w-36 h-36 shrink-0">
                        <PieChart width={144} height={144}>
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={48}
                                outerRadius={70}
                                paddingAngle={3}
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                                isAnimationActive={!disableAnimations} // CHANGE 4: Conditional animation
                            >
                                {chartData.map((segment) => (
                                    <Cell 
                                        key={segment.label} 
                                        fill={segment.color} 
                                        style={{ outline: 'none' }} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{
                                    background: isDark ? "#1F2937" : "#fff",
                                    border: isDark ? "1px solid #374151" : "1px solid #E2E8F0",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: isDark ? "#E5E7EB" : "#111827",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                }}
                                formatter={(value: any) => [`${value ?? 0} employees`]}
                            />
                        </PieChart>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                                {total}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Total
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-1">
                        {chartData.map((segment) => (
                            <div key={segment.label} className="flex items-center gap-2.5">
                                <span
                                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className={`text-sm flex items-center gap-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {segment.count}
                                    </span>{" "}
                                    <span className="text-xs font-medium">{segment.label}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}