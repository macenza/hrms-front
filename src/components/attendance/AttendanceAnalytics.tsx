'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AttendanceRecord } from './AttendanceTable';

interface AttendanceAnalyticsProps {
    records: AttendanceRecord[];
    isLoading?: boolean;
}

const COLORS = [
    '#10b981', // Emerald (Present)
    '#f43f5e', // Coral Rose (Absent)
    '#f59e0b', // Warm Amber (Late)
    '#8b5cf6', // Royal Violet (On Leave)
    '#06b6d4', // Cyan (Half-Day)
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    formatter?: (value: any) => string;
    showLabel?: boolean;
}

const CustomTooltip = ({ active, payload, label, formatter, showLabel = false }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const value = formatter ? formatter(data.value) : data.value;
        const color = data.payload.color || data.color || '#3b82f6';
        return (
            <div className="bg-white/95 dark:bg-gray-950/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-xl text-xs font-semibold animate-in fade-in zoom-in-95 duration-100 transition-colors">
                {showLabel && label && (
                    <p className="text-gray-400 dark:text-gray-500 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        {label}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                    <span className="text-gray-650 dark:text-gray-400 font-medium">{data.name || 'Value'}:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">{value}</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function AttendanceAnalytics({ records, isLoading = false }: AttendanceAnalyticsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const analyticsData = useMemo(() => {
        if (!records || records.length === 0) {
            return { statusCounts: [], formatCounts: [] };
        }

        const statusCountsMap: Record<string, number> = {
            'Present': 0,
            'Absent': 0,
            'Late': 0,
            'On Leave': 0,
            'Half-Day': 0,
        };

        const formatCountsMap: Record<string, number> = {
            'Office': 0,
            'Remote': 0,
            'Field': 0,
        };

        records.forEach((rec) => {
            // Count status
            const statusKey = rec.status;
            if (statusKey in statusCountsMap) {
                statusCountsMap[statusKey]++;
            } else {
                // fallback safety
                statusCountsMap['Present']++;
            }

            // Count format (check-in method/format)
            // Format can be stored in backend, but we need to infer/map it or check if it exists
            // Wait, let's look at logs mapping to see if workFormat is returned. Yes, in controllers we have `workFormat: 'Office'`.
            // Let's assume it defaults to Office if not specified
            // Note: in our AttendanceTable we had workFormat state. Let's make sure it's handled.
            // Wait, does AttendanceRecord have workFormat? We can add it or count based on it.
            // Let's check if the record contains it.
            const formatKey = (rec as any).workFormat || 'Office';
            formatCountsMap[formatKey] = (formatCountsMap[formatKey] || 0) + 1;
        });

        const statusCounts = Object.keys(statusCountsMap)
            .map((name, index) => ({
                name,
                value: statusCountsMap[name],
                color: COLORS[index % COLORS.length]
            }))
            .filter(item => item.value > 0); // only show statuses that have records

        const formatCounts = Object.keys(formatCountsMap).map((name, index) => ({
            name,
            count: formatCountsMap[name],
            color: ['#3b82f6', '#8b5cf6', '#06b6d4'][index % 3]
        }));

        return { statusCounts, formatCounts };
    }, [records]);

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors h-[350px] relative overflow-hidden">
                        <div className="p-6 h-full flex flex-col justify-between">
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-48 h-48 rounded-full border-8 border-gray-100 dark:border-gray-800 animate-spin" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {/* Status Breakdown Pie Chart */}
            <Card className="border-gray-200/80 dark:border-gray-800/60 shadow-sm bg-white dark:bg-gray-900 transition-all duration-300 rounded-2xl overflow-hidden min-h-[360px]">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/10 p-5">
                    <CardTitle className="text-sm font-extrabold text-gray-950 dark:text-gray-50 uppercase tracking-wider">
                        Roster Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-8">
                    {analyticsData.statusCounts.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold my-12">No data available</p>
                    ) : (
                        <>
                            <div className="w-[200px] h-[200px] shrink-0 relative">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Pie
                                            data={analyticsData.statusCounts}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {analyticsData.statusCounts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                    <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                                        {records.length}
                                    </span>
                                    <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        Total Roster
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                                {analyticsData.statusCounts.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                                            <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">
                                                {item.value} ({Math.round((item.value / records.length) * 100)}%)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Working Format Bar Chart */}
            <Card className="border-gray-200/80 dark:border-gray-800/60 shadow-sm bg-white dark:bg-gray-900 transition-all duration-300 rounded-2xl overflow-hidden min-h-[360px]">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/10 p-5">
                    <CardTitle className="text-sm font-extrabold text-gray-950 dark:text-gray-50 uppercase tracking-wider">
                        Work Format Environment
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {records.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold my-12 text-center">No data available</p>
                    ) : (
                        <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={analyticsData.formatCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip formatter={(val) => `${val} employees`} />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={32}>
                                        {analyticsData.formatCounts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
