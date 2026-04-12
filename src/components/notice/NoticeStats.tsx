// src/components/notice/NoticeStats.tsx

import React from 'react';
import { Megaphone, Pin, CalendarDays, BellRing } from 'lucide-react';

// UI Components
import { Card, CardContent } from '@/components/ui/Card';

// Data Contract for Backend Integration
export interface NoticeStatsData {
    totalNotices: number;
    pinnedImportant: number;
    upcomingEvents: number;
    thisMonth: number;
}

interface NoticeStatsProps {
    data: NoticeStatsData | null;
    isLoading: boolean;
}

export default function NoticeStats({ data, isLoading }: NoticeStatsProps) {
    // 1. Handle Loading State with Skeletons
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                    <Card key={n} className="border-gray-100 shadow-sm animate-pulse">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div className="w-full">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-12 w-12 bg-gray-100 rounded-xl"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // 2. Safe Fallback for missing data
    // If API succeeds but returns null/undefined, default to zeros
    const safeData: NoticeStatsData = data || {
        totalNotices: 0,
        pinnedImportant: 0,
        upcomingEvents: 0,
        thisMonth: 0,
    };

    // Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Notices",
            value: safeData.totalNotices,
            icon: <Megaphone size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pinned / Important",
            value: safeData.pinnedImportant,
            icon: <Pin size={20} />,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
        {
            title: "Upcoming Events",
            value: safeData.upcomingEvents,
            icon: <CalendarDays size={20} />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            title: "This Month",
            value: safeData.thisMonth,
            icon: <BellRing size={20} />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {stat.value}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}