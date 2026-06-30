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
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Rose
    '#6366f1', // Indigo
    '#ec4899', // Pink
];

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
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors relative overflow-hidden group">
                <CardHeader className="pb-2 border-b border-gray-50 dark:border-gray-800/50">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">Category Distribution</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Breakdown of total inventory items by category</p>
                </CardHeader>
                <CardContent className="pt-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    padding: '8px 12px',
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(value: any, name: any) => [`${value} items`, name]}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    paddingTop: '10px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bar Chart Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors relative overflow-hidden group">
                <CardHeader className="pb-2 border-b border-gray-50 dark:border-gray-800/50">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">Cost Summary</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total procurement investment grouped by category</p>
                </CardHeader>
                <CardContent className="pt-6 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryCosts} margin={{ top: 15, right: 10, left: 15, bottom: 15 }}>
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
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
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    padding: '8px 12px',
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}
                                labelStyle={{ color: '#64748b', fontWeight: 500, fontSize: '11px', marginBottom: '4px' }}
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Cost']}
                            />
                            <Bar 
                                dataKey="cost" 
                                radius={[6, 6, 0, 0]}
                                maxBarSize={45}
                            >
                                {categoryCosts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
}
