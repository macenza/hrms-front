'use client';

import React from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// Define the data contract for backend integration
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
    
    // Loading State (Skeleton UI)
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-100 shadow-sm bg-white">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div className="space-y-3 w-full">
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                            </div>
                            <div className="h-12 w-12 bg-gray-100 rounded-xl animate-pulse ml-4 shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Safe fallback if data is missing after load
    const safeData = data || { total: 0, assigned: 0, available: 0, maintenance: 0 };

    // Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Assets",
            value: safeData.total,
            icon: <Laptop size={20} />,
            iconBg: "bg-gray-50",
            iconColor: "text-gray-600",
        },
        {
            title: "Assigned",
            value: safeData.assigned,
            icon: <UserCheck size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Available",
            value: safeData.available,
            icon: <CheckCircle2 size={20} />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Under Maintenance",
            value: safeData.maintenance,
            icon: <Wrench size={20} />,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Map over the array using our consistent UI components */}
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 border-none sm:border-solid hover:shadow-md transition-shadow duration-200 bg-white shadow-sm">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor} shrink-0 shadow-sm`}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}