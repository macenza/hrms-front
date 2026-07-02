'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Asset } from './AssetTable';

interface AssetAnalyticsProps {
    assets: Asset[];
    isLoading?: boolean;
}

const COLORS = [
    '#3b82f6', // Sapphire Blue
    '#8b5cf6', // Royal Violet
    '#10b981', // Emerald
    '#f59e0b', // Warm Amber
    '#ec4899', // Rose Pink
    '#06b6d4', // Cyan
    '#f43f5e', // Coral Rose
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

export default function AssetAnalytics({ assets, isLoading = false }: AssetAnalyticsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const analyticsData = useMemo(() => {
        if (!assets || assets.length === 0) {
            return { categoryCounts: [], categoryCosts: [] };
        }

        const countsMap: { [key: string]: number } = {};
        const costsMap: { [key: string]: number } = {};

        assets.forEach((asset) => {
            const cat = asset.category || 'Other';
            countsMap[cat] = (countsMap[cat] || 0) + 1;
            
            const cost = Number(asset.cost) || 0;
            costsMap[cat] = (costsMap[cat] || 0) + cost;
        });

        const categoryCounts = Object.keys(countsMap).map((name, index) => ({
            name,
            value: countsMap[name],
            color: COLORS[index % COLORS.length]
        }));

        const categoryCosts = Object.keys(costsMap).map((name, index) => ({
            name,
            cost: costsMap[name],
            color: COLORS[index % COLORS.length]
        }));

        return { categoryCounts, categoryCosts };
    }, [assets]);

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors h-[350px] relative overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-1/2 animate-pulse" />
                            <div className="h-[200px] w-full bg-gray-50 dark:bg-gray-950/20 rounded-xl flex items-center justify-center animate-pulse" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    const { categoryCounts, categoryCosts } = analyticsData;
    const hasData = categoryCounts.length > 0;

    if (!hasData) {
        return (
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 p-8 text-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No assets loaded for analytics</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500 slide-in-from-top-4">
            
            {/* Pie Chart Card */}
            <Card className="border-gray-250 dark:border-gray-800/60 shadow-lg shadow-gray-100/10 dark:shadow-none bg-gradient-to-tr from-white to-gray-55/30 dark:from-gray-900 dark:to-gray-900/60 transition-all duration-300 relative overflow-hidden rounded-2xl group hover:border-gray-300 dark:hover:border-gray-700">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">Category Distribution</CardTitle>
                    <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold">Breakdown of total inventory items by category</p>
                </CardHeader>
                <CardContent className="pt-6 h-[290px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={categoryCounts}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {categoryCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip formatter={(val: any) => `${val} items`} />} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    paddingTop: '10px',
                                    color: '#475569'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bar Chart Card */}
            <Card className="border-gray-255 dark:border-gray-800/60 shadow-lg shadow-gray-100/10 dark:shadow-none bg-gradient-to-tr from-white to-gray-55/30 dark:from-gray-900 dark:to-gray-900/60 transition-all duration-300 relative overflow-hidden rounded-2xl group hover:border-gray-300 dark:hover:border-gray-700">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">Cost Summary</CardTitle>
                    <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold">Total procurement investment grouped by category</p>
                </CardHeader>
                <CardContent className="pt-6 h-[290px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={categoryCosts} margin={{ top: 15, right: 10, left: 15, bottom: 15 }}>
                            <defs>
                                {COLORS.map((color, index) => (
                                    <linearGradient id={`barGrad-${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0.25} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                                style={{ fontWeight: 500 }}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false}
                                width={45}
                                tickFormatter={(val) => {
                                    if (val >= 1000) {
                                        return `$${(val / 1000).toFixed(0)}k`;
                                    }
                                    return `$${val}`;
                                }}
                                style={{ fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} showLabel />} />
                            <Bar 
                                dataKey="cost" 
                                radius={[6, 6, 0, 0]}
                                maxBarSize={40}
                            >
                                {categoryCosts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#barGrad-${index % COLORS.length})`} stroke={entry.color} strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
}
