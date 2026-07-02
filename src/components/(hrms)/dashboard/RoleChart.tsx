'use client';

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#ec4899", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#f43f5e"];
const HOVER_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#ec4899", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#f43f5e"];
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-gray-200/85 dark:border-gray-800/85 p-3.5 rounded-2xl shadow-xl text-xs select-none pointer-events-none">
                <p className="font-extrabold text-gray-900 dark:text-gray-100 mb-1.5 uppercase tracking-wider text-[10px]">
                    {payload[0].payload?.name || payload[0].name}
                </p>
                <div className="flex items-center gap-2.5 font-bold py-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                    <span className="text-gray-550 dark:text-gray-400 capitalize">Employees:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono ml-auto">{payload[0].value}</span>
                </div>
            </div>
        );
    }
    return null;
};

interface RoleChartProps {
    roleDistribution?: { name: string; value: number }[];
    totalEmployees?: number;
    isLoading?: boolean;
    disableAnimations?: boolean;
}

export default function RoleChart({ 
    roleDistribution = [], 
    totalEmployees,
    isLoading = false, 
    disableAnimations = false 
}: RoleChartProps) {
    const [isBoxHovered, setIsBoxHovered] = useState(false);
    const [hoverColorIndex, setHoverColorIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const activeHoverColor = useMemo(() => {
        return HOVER_COLORS[hoverColorIndex % HOVER_COLORS.length];
    }, [hoverColorIndex]);

    // Bulletproof Unwrapper
    const data = useMemo(() => {
        if (!roleDistribution || !Array.isArray(roleDistribution)) {
            return [];
        }
        return roleDistribution.filter(item => item && typeof item.name === 'string' && typeof item.value === 'number');
    }, [roleDistribution]);

    const distributionTotal = useMemo(() => {
        return data.reduce((acc, s) => acc + s.value, 0);
    }, [data]);

    // Use the authoritative total from the API (same as the stat card); fall back
    // to the sum of the distribution array if not provided.
    const total = totalEmployees ?? distributionTotal;

    // Premium Skeleton Loader
    if (isLoading && data.length === 0) {
        return (
            <div className="rounded-2xl flex flex-col overflow-hidden h-full min-h-[340px] bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none animate-pulse">
                <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 opacity-70" />
                <div className="p-6 flex flex-col gap-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="space-y-1.5">
                            <div className="w-36 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
                            <div className="w-20 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-8 flex-1">
                        <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <div className="flex flex-col gap-3 flex-1">
                            {[1,2,3].map(i => (
                                <div key={i} className="space-y-1.5">
                                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onMouseEnter={() => {
                if (!isBoxHovered) {
                    setHoverColorIndex(prev => (prev + 1) % HOVER_COLORS.length);
                }
                setIsBoxHovered(true);
            }}
            onMouseLeave={() => {
                setIsBoxHovered(false);
            }}
            style={{
                transform: isBoxHovered ? 'translateY(-4px)' : 'none',
                borderColor: isBoxHovered ? `${activeHoverColor}50` : undefined,
                boxShadow: isBoxHovered 
                    ? `0 20px 25px -5px ${activeHoverColor}20, 0 8px 10px -6px ${activeHoverColor}15` 
                    : undefined,
            }}
            className={cn(
                "rounded-2xl flex flex-col overflow-hidden h-full min-w-0 relative min-h-[340px] border",
                "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none",
                "transition-all duration-300"
            )}
        >
            {/* Dynamic top color bar */}
            <div 
                style={{
                    background: isBoxHovered 
                        ? `linear-gradient(to right, ${activeHoverColor}, ${activeHoverColor}CC)` 
                        : undefined,
                    height: isBoxHovered ? '3px' : '0px',
                    opacity: isBoxHovered ? 0.95 : 0,
                }}
                className="w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-300 shrink-0" 
            />

            {/* Background Fetching Overlay */}
            {isLoading && data.length > 0 && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/30 flex items-center justify-center z-20 rounded-2xl">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                        <Loader2 className={cn("w-4 h-4 text-blue-500", !disableAnimations && "animate-spin")} />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Refreshing…</span>
                    </div>
                </div>
            )}

            <div className="p-6 flex flex-col gap-5 flex-1">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100/80 dark:border-violet-500/20 shadow-sm shrink-0">
                        <PieChartIcon className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                            Role Distribution
                        </h3>
                        <p className="text-[10px] mt-0.5 text-gray-400 dark:text-gray-500 font-medium">
                            {total} total employees
                        </p>
                    </div>
                </div>

                {/* Content */}
                {data.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <PieChartIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">No role data available</p>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1">

                        {/* Chart Container */}
                        <div className="relative w-40 h-40 shrink-0">
                            <style dangerouslySetInnerHTML={{ __html: `
                                @keyframes pulseDot {
                                    0%, 100% { transform: scale(1); opacity: 0.8; }
                                    50% { transform: scale(1.35); opacity: 1; filter: brightness(1.2) drop-shadow(0 0 3px currentColor); }
                                }
                                @keyframes pulseBar {
                                    0%, 100% { opacity: 0.7; }
                                    50% { opacity: 1; filter: brightness(1.1); }
                                }
                                @keyframes pulseSlice {
                                    0%, 100% { opacity: 1; filter: brightness(1); }
                                    50% { opacity: 0.65; filter: brightness(1.25); }
                                }
                                .animate-pulse-dot {
                                    animation: pulseDot 0.8s infinite ease-in-out;
                                    transform-origin: center;
                                }
                                .animate-pulse-bar {
                                    animation: pulseBar 0.8s infinite ease-in-out;
                                }
                                .animate-pulse-slice {
                                    animation: pulseSlice 0.8s infinite ease-in-out;
                                }
                            `}} />
                            <PieChart width={160} height={160} className="role-pie-chart">
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
                                    {data.map((entry, index) => {
                                        const isHovered = hoveredIndex === index;
                                        return (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                                onMouseEnter={() => setHoveredIndex(index)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                                className={cn(
                                                    "transition-all duration-200",
                                                    isHovered && "animate-pulse-slice"
                                                )}
                                                style={{ 
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} wrapperStyle={{ zIndex: 100 }} />
                            </PieChart>

                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black leading-none mb-1 tracking-tight text-gray-900 dark:text-gray-100">
                                    {total}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    Total
                                </span>
                            </div>
                        </div>

                        {/* Legend with progress bars */}
                        <div className="flex flex-col gap-2.5 w-full sm:w-auto flex-1">
                            {data.map((entry, index) => {
                                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                const color = COLORS[index % COLORS.length];
                                const isHovered = hoveredIndex === index;
                                return (
                                    <div 
                                        key={entry.name} 
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={cn(
                                            "flex flex-col gap-1 p-1 rounded-xl transition-all duration-205 cursor-pointer",
                                            isHovered && "bg-gray-50 dark:bg-gray-800/40 scale-[1.015]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "w-2 h-2 rounded-full shrink-0 transition-all duration-200",
                                                        isHovered && "animate-pulse-dot"
                                                    )}
                                                    style={{ 
                                                        backgroundColor: color,
                                                        color: color
                                                    }}
                                                />
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{entry.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-900 dark:text-gray-100 tabular-nums">{entry.value}</span>
                                                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tabular-nums w-8 text-right">{pct}%</span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700",
                                                    isHovered && "animate-pulse-bar"
                                                )}
                                                style={{ 
                                                    width: `${pct}%`, 
                                                    backgroundColor: color, 
                                                    opacity: isHovered ? 1 : 0.7 
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
