// src/components/assets/AssetStats.tsx
'use client';

import React from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { useAssetStatusData } from '@/hooks/api/useAssetStatuses';

export interface AssetStatsData {
    total: number;
    [key: string]: number;
}

interface AssetStatsProps {
    data?: AssetStatsData | null;
    isLoading?: boolean;
}

const getStatusIcon = (statusName: string) => {
    const lower = statusName.toLowerCase();
    if (lower.includes('available')) return <CheckCircle2 size={20} />;
    if (lower.includes('assign')) return <UserCheck size={20} />;
    if (lower.includes('maintenance')) return <Wrench size={20} />;
    return <Bookmark size={20} />;
};

export default function AssetStats({ data, isLoading = false }: AssetStatsProps) {
    const { data: statusData, isLoading: isStatusLoading } = useAssetStatusData(1, 100, '', true);
    const activeStatuses = statusData?.records || [];

    const isDataLoading = isLoading || isStatusLoading;

    if (isDataLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div className="space-y-3 w-full">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                            </div>
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse ml-4 shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const safeData = data || { total: 0 };
    
    // Sort keys based on sequence of status configurations, fallback to alphabetical
    const statsKeys = Object.keys(safeData).filter(key => key !== 'total');
    const sortedKeys = [...statsKeys].sort((a, b) => {
        const sA = activeStatuses.find(s => s.name.toLowerCase() === a.toLowerCase());
        const sB = activeStatuses.find(s => s.name.toLowerCase() === b.toLowerCase());
        return (sA?.sequence ?? 999) - (sB?.sequence ?? 999);
    });

    const totalCard = {
        title: "Total Assets",
        value: safeData.total || 0,
        icon: <Laptop size={20} />,
        style: {
            color: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
    };

    const statusCards = sortedKeys.map(key => {
        const matchedConfig = activeStatuses.find(s => s.name.toLowerCase() === key.toLowerCase());
        const statusColor = matchedConfig?.color || '#64748b'; // default slate

        return {
            title: key,
            value: safeData[key] || 0,
            icon: getStatusIcon(key),
            style: {
                color: statusColor,
                backgroundColor: `${statusColor}1a` // Hex opacity 10%
            }
        };
    });

    const allCards = [totalCard, ...statusCards];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr gap-4 animate-in fade-in duration-300">
            {allCards.map((stat, index) => (
                <Card 
                    key={index} 
                    className="border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none group relative overflow-hidden"
                >
                    {/* Glowing status-colored background accent */}
                    <div 
                        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity"
                        style={{ backgroundColor: stat.style.color }}
                    />
                    <CardContent className="p-5 flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                {stat.value}
                            </p>
                        </div>
                        <div 
                            className="p-3 rounded-xl shrink-0 shadow-sm dark:shadow-none transition-all duration-300 group-hover:scale-110"
                            style={stat.style}
                        >
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}