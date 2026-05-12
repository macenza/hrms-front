// src/components/assets/AssetStats.tsx
'use client';

import React from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface AssetStatsData {
    total: number;
    assigned: number;
    available: number;
    maintenance: number;
}

interface AssetStatsProps {
    data?: AssetStatsData | null;
    isLoading?: boolean;
}

export default function AssetStats({ data, isLoading = false }: AssetStatsProps) {
    
    // Premium Skeleton Loader aligned with Dark Mode Blueprint
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors">
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

    const safeData = data || { total: 0, assigned: 0, available: 0, maintenance: 0 };
    
    // Upgraded with proper dark mode tinting for premium contrast
    const statCards = [
        {
            title: "Total Assets",
            value: safeData.total,
            icon: <Laptop size={20} />,
            iconBg: "bg-gray-100 dark:bg-gray-800/80",
            iconColor: "text-gray-600 dark:text-gray-400",
        },
        {
            title: "Assigned",
            value: safeData.assigned,
            icon: <UserCheck size={20} />,
            iconBg: "bg-blue-50 dark:bg-blue-500/10",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Available",
            value: safeData.available,
            icon: <CheckCircle2 size={20} />,
            iconBg: "bg-green-50 dark:bg-green-500/10",
            iconColor: "text-green-600 dark:text-green-400",
        },
        {
            title: "Under Maintenance",
            value: safeData.maintenance,
            icon: <Wrench size={20} />,
            iconBg: "bg-orange-50 dark:bg-orange-500/10",
            iconColor: "text-orange-500 dark:text-orange-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {statCards.map((stat, index) => (
                <Card 
                    key={index} 
                    className="border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none group"
                >
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                {stat.value}
                            </p>
                        </div>
                        <div className={cn(
                            "p-3 rounded-xl shrink-0 shadow-sm dark:shadow-none transition-colors",
                            stat.iconBg, 
                            stat.iconColor
                        )}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}