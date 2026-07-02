// src/components/dashboard/AttendanceChart.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import { Loader2, BarChart2 } from "lucide-react";
import type { DailyAttendance, DashboardAttendance } from "@/store/dashboardSlice";
import { cn } from "@/utils/cn";

const CustomTooltip = ({ active, payload, label, colors }: any) => {
    if (active && payload && payload.length && colors) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-gray-200/85 dark:border-gray-800/85 p-3.5 rounded-2xl shadow-xl text-xs select-none">
                <p className="font-extrabold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wider text-[10px]">{label}</p>
                {payload.map((item: any) => (
                    <div key={item.name} className="flex items-center gap-2.5 font-bold py-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.name === 'present' ? colors.present : colors.absent }} />
                        <span className="text-gray-550 dark:text-gray-400 capitalize">{item.name}:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-mono ml-auto">{item.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface AttendanceChartProps {
    timeframe?: 'week' | 'month';
    isEmployee?: boolean;
    disableAnimations?: boolean;
    isLoading?: boolean;
    chartData?: Pick<DashboardAttendance, 'overviewChart'> | null;
    /** When a custom date range filter is active, pass it so labels render correctly */
    dateRange?: { from: string; to: string } | null;
    colorPaletteIndex?: number;
}

const PALETTES = [
    { present: "#3b82f6", absent: "#f43f5e" }, // Blue & Red
    { present: "#10b981", absent: "#f59e0b" }, // Emerald & Amber
    { present: "#6366f1", absent: "#ec4899" }, // Indigo & Pink-Rose
    { present: "#8b5cf6", absent: "#ef4444" }, // Purple & Red
    { present: "#06b6d4", absent: "#f97316" }, // Cyan & Orange
    { present: "#ec4899", absent: "#6366f1" }, // Pink & Indigo
];

const AttendanceChart = ({ 
    timeframe = 'week', 
    isEmployee = false,
    disableAnimations = false,
    isLoading = false,
    chartData: dataFromApi,
    dateRange = null,
    colorPaletteIndex = 0,
}: AttendanceChartProps) => {
    
    const colors = useMemo(() => {
        return PALETTES[colorPaletteIndex % PALETTES.length];
    }, [colorPaletteIndex]);

    const LEGEND = useMemo(() => [
        { label: "Present", color: colors.present, key: "present" },
        { label: "Absent", color: colors.absent, key: "absent" },
    ], [colors]);

    // Required to prevent hydration mismatch with Recharts
    const [mounted, setMounted] = useState(false);
    const [isBoxHovered, setIsBoxHovered] = useState(false);
    const [hoverColorIndex, setHoverColorIndex] = useState(0);
    const [activeKeys, setActiveKeys] = useState<string[]>(['present', 'absent']);
    const [activeValue, setActiveValue] = useState<number | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
    
    const activeHoverColor = useMemo(() => {
        return PALETTES[hoverColorIndex].present;
    }, [hoverColorIndex]);


    const handleLegendClick = (key: string) => {
        setActiveKeys((prev) => {
            if (prev.includes(key) && prev.length === 1) return prev;
            if (prev.includes(key)) {
                return prev.filter((k) => k !== key);
            } else {
                return [...prev, key];
            }
        });
    };
    
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
            // Always show "DD Mon" format for custom date ranges
            if (dateRange) {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                displayDay = `${day} ${monthNames[month]}`;
            } else if (timeframe === "week") {
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
    }, [dataFromApi?.overviewChart, timeframe, dateRange]);

    if (!mounted || (isLoading && !dataFromApi?.overviewChart?.length)) {
        return (
            <div className="rounded-2xl min-w-0 flex flex-col overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none animate-pulse" style={{ minHeight: '380px' }}>
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-70" />
                <div className="p-6 flex flex-col gap-6 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-1.5">
                                <div className="w-44 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                <div className="w-24 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500/50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            onMouseEnter={() => {
                if (!isBoxHovered) {
                    setHoverColorIndex(prev => (prev + 1) % PALETTES.length);
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
            className="rounded-2xl flex flex-col min-w-0 transition-all duration-300 relative border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none overflow-hidden"
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
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-300 shrink-0" 
            />

            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-black/30">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Refreshing…</span>
                    </div>
                </div>
            )}

            <div className="p-5 sm:p-6 flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-500/20 shadow-sm shrink-0">
                            <BarChart2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                                {isEmployee ? "My Monthly Attendance" : "Attendance Overview"}
                            </h3>
                            <p className="text-[10px] mt-0.5 text-gray-400 dark:text-gray-500 font-medium">
                                {isEmployee ? "Personal record" : "All employees · this period"}
                            </p>
                        </div>
                    </div>

                    {/* Controls (Legends & Switcher) */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Segmented Control Switcher */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
                            {(['bar', 'line', 'area'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md capitalize transition-all duration-205 cursor-pointer outline-none border-none",
                                        chartType === type 
                                            ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" 
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-650 dark:hover:text-gray-400"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Pill legend badges */}
                        <div className="flex items-center gap-2">
                            {LEGEND.map((l) => {
                                const isActive = activeKeys.includes(l.key);
                                return (
                                    <button
                                        key={l.label}
                                        onClick={() => handleLegendClick(l.key)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none"
                                        style={{
                                            backgroundColor: isActive ? `${l.color}12` : 'transparent',
                                            borderColor: isActive ? `${l.color}30` : 'rgba(148, 163, 184, 0.15)',
                                            color: isActive ? l.color : '#94A3B8',
                                            opacity: isActive ? 1 : 0.65,
                                        }}
                                    >
                                        <span 
                                            className="w-1.5 h-1.5 rounded-full transition-all duration-300" 
                                            style={{ 
                                                backgroundColor: isActive ? l.color : '#94A3B8',
                                                transform: isActive ? 'scale(1)' : 'scale(0.75)'
                                            }} 
                                        />
                                        {l.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="w-full h-[260px] sm:h-[300px] md:h-[320px]">
                {chartData.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <BarChart2 className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">No data for this period</p>
                        </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart
                                data={chartData}
                                barCategoryGap="25%"
                                barGap={4}
                                margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
                                onMouseMove={(state: any) => {
                                    if (state && state.activePayload && state.activePayload.length > 0) {
                                        const item = state.activePayload[0].payload;
                                        const val = Math.max(
                                            activeKeys.includes('present') ? (item.present || 0) : 0,
                                            activeKeys.includes('absent') ? (item.absent || 0) : 0
                                        );
                                        setActiveValue(val);
                                    } else {
                                        setActiveValue(null);
                                    }
                                }}
                                onMouseLeave={() => setActiveValue(null)}
                            >
                                <defs>
                                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors.present} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={colors.present} stopOpacity={0.35} />
                                    </linearGradient>
                                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors.absent} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={colors.absent} stopOpacity={0.35} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    stroke="#94a3b8"
                                    strokeOpacity={0.15} 
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={dateRange ? 'preserveStartEnd' : (timeframe === 'month' ? 4 : 0)}
                                    tickFormatter={(val) => {
                                        if (!dateRange && timeframe === 'month' && val) {
                                            const parts = val.split(' ');
                                            return parts[1] || val;
                                        }
                                        return val;
                                    }}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <Tooltip
                                    content={<CustomTooltip colors={colors} />}
                                    cursor={{ fill: "rgba(148, 163, 184, 0.06)" }}
                                />
                                {activeValue !== null && activeValue > 0 && (
                                    <ReferenceLine 
                                        y={activeValue} 
                                        stroke={colors.present} 
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        label={{ 
                                            value: `${activeValue}`, 
                                            position: 'left', 
                                            fill: colors.present,
                                            fontSize: 9,
                                            fontWeight: 'extrabold',
                                            offset: 10
                                        }}
                                    />
                                )}
                                {LEGEND.map((item) => (
                                    <Bar
                                        key={item.key}
                                        dataKey={item.key}
                                        fill={item.key === 'present' ? 'url(#presentGrad)' : 'url(#absentGrad)'}
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={14}
                                        isAnimationActive={!disableAnimations}
                                        animationDuration={800}
                                        hide={!activeKeys.includes(item.key)}
                                    />
                                ))}
                            </BarChart>
                        ) : chartType === 'line' ? (
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
                                onMouseMove={(state: any) => {
                                    if (state && state.activePayload && state.activePayload.length > 0) {
                                        const item = state.activePayload[0].payload;
                                        const val = Math.max(
                                            activeKeys.includes('present') ? (item.present || 0) : 0,
                                            activeKeys.includes('absent') ? (item.absent || 0) : 0
                                        );
                                        setActiveValue(val);
                                    } else {
                                        setActiveValue(null);
                                    }
                                }}
                                onMouseLeave={() => setActiveValue(null)}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="#94a3b8"
                                    strokeOpacity={0.15} 
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={dateRange ? 'preserveStartEnd' : (timeframe === 'month' ? 4 : 0)}
                                    tickFormatter={(val) => {
                                        if (!dateRange && timeframe === 'month' && val) {
                                            const parts = val.split(' ');
                                            return parts[1] || val;
                                        }
                                        return val;
                                    }}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <Tooltip
                                    content={<CustomTooltip colors={colors} />}
                                    cursor={{ stroke: 'rgba(148, 163, 184, 0.1)', strokeWidth: 1 }}
                                />
                                {activeValue !== null && activeValue > 0 && (
                                    <ReferenceLine 
                                        y={activeValue} 
                                        stroke={colors.present} 
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        label={{ 
                                            value: `${activeValue}`, 
                                            position: 'left', 
                                            fill: colors.present,
                                            fontSize: 9,
                                            fontWeight: 'extrabold',
                                            offset: 10
                                        }}
                                    />
                                )}
                                {LEGEND.map((item) => (
                                    <Line
                                        key={item.key}
                                        type="monotone"
                                        dataKey={item.key}
                                        stroke={item.color}
                                        strokeWidth={3}
                                        dot={{ r: 3, strokeWidth: 1.5, fill: item.color }}
                                        activeDot={{ r: 5, strokeWidth: 2 }}
                                        isAnimationActive={!disableAnimations}
                                        animationDuration={800}
                                        hide={!activeKeys.includes(item.key)}
                                    />
                                ))}
                            </LineChart>
                        ) : (
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
                                onMouseMove={(state: any) => {
                                    if (state && state.activePayload && state.activePayload.length > 0) {
                                        const item = state.activePayload[0].payload;
                                        const val = Math.max(
                                            activeKeys.includes('present') ? (item.present || 0) : 0,
                                            activeKeys.includes('absent') ? (item.absent || 0) : 0
                                        );
                                        setActiveValue(val);
                                    } else {
                                        setActiveValue(null);
                                    }
                                }}
                                onMouseLeave={() => setActiveValue(null)}
                            >
                                <defs>
                                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors.present} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={colors.present} stopOpacity={0.35} />
                                    </linearGradient>
                                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors.absent} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={colors.absent} stopOpacity={0.35} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    stroke="#94a3b8"
                                    strokeOpacity={0.15} 
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={dateRange ? 'preserveStartEnd' : (timeframe === 'month' ? 4 : 0)}
                                    tickFormatter={(val) => {
                                        if (!dateRange && timeframe === 'month' && val) {
                                            const parts = val.split(' ');
                                            return parts[1] || val;
                                        }
                                        return val;
                                    }}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
                                />
                                <Tooltip
                                    content={<CustomTooltip colors={colors} />}
                                    cursor={{ stroke: 'rgba(148, 163, 184, 0.1)', strokeWidth: 1 }}
                                />
                                {activeValue !== null && activeValue > 0 && (
                                    <ReferenceLine 
                                        y={activeValue} 
                                        stroke={colors.present} 
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        label={{ 
                                            value: `${activeValue}`, 
                                            position: 'left', 
                                            fill: colors.present,
                                            fontSize: 9,
                                            fontWeight: 'extrabold',
                                            offset: 10
                                        }}
                                    />
                                )}
                                {LEGEND.map((item) => (
                                    <Area
                                        key={item.key}
                                        type="monotone"
                                        dataKey={item.key}
                                        fill={item.key === 'present' ? 'url(#presentGrad)' : 'url(#absentGrad)'}
                                        stroke={item.color}
                                        strokeWidth={2.5}
                                        isAnimationActive={!disableAnimations}
                                        animationDuration={800}
                                        hide={!activeKeys.includes(item.key)}
                                    />
                                ))}
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;