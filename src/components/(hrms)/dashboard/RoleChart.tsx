'use client';

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#EC4899", "#F59E0B", "#EF4444"];

interface RoleChartProps {
    roleDistribution?: { name: string; value: number }[];
    isLoading?: boolean;
    disableAnimations?: boolean;
}

// Custom tooltip to ensure perfect Tailwind dark mode support
const CustomTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length) {
        let style: React.CSSProperties = {};
        if (coordinate) {
            const { x, y } = coordinate;
            const vx = x - 80;
            const vy = y - 80;
            const len = Math.sqrt(vx * vx + vy * vy);
            if (len > 0) {
                // Offset the tooltip radially outward by 55px
                const dx = (vx / len) * 55;
                const dy = (vy / len) * 55;
                style = {
                    transform: `translate(${dx}px, ${dy}px)`,
                };
            }
        }
        return (
            <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl shadow-lg transition-colors pointer-events-none"
                style={style}
            >
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    {payload[0].name}
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                    {payload[0].value} {payload[0].value === 1 ? 'employee' : 'employees'}
                </p>
            </div>
        );
    }
    return null;
};

export default function RoleChart({ 
    roleDistribution = [], 
    isLoading = false, 
    disableAnimations = false 
}: RoleChartProps) {
    
    // Bulletproof Unwrapper
    const data = useMemo(() => {
        if (!roleDistribution || !Array.isArray(roleDistribution)) {
            return [];
        }
        return roleDistribution.filter(item => item && typeof item.name === 'string' && typeof item.value === 'number');
    }, [roleDistribution]);

    const total = useMemo(() => {
        return data.reduce((acc, s) => acc + s.value, 0);
    }, [data]);

    // Premium Skeleton Loader
    if (isLoading && data.length === 0) {
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
            {isLoading && data.length > 0 && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl transition-opacity">
                    <Loader2 className={cn("w-6 h-6 text-blue-500", !disableAnimations && "animate-spin")} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Role Distribution
                </h3>
            </div>

            {/* Content */}
            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl mt-2 transition-colors">
                    No role data available.
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4 flex-1">            
                    
                    {/* Chart Container */}
                    <div className="relative w-40 h-40 shrink-0">
                        <PieChart width={160} height={160}>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
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
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={entry.name} 
                                        fill={COLORS[index % COLORS.length]} 
                                        style={{ outline: 'none' }} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} wrapperStyle={{ zIndex: 100 }} />
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
                        {data.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm flex items-center justify-between gap-4 w-full text-gray-600 dark:text-gray-400 transition-colors">
                                    <span className="text-xs font-medium">{entry.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                        {entry.value}
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
