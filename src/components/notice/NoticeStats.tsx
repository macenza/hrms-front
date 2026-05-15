import React from 'react';
import { Megaphone, Pin, CalendarDays, BellRing } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

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

// Skeleton Loader for Stats
const StatSkeleton = () => (
    <Card className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors">
        <CardContent className="p-5 flex items-start justify-between">
            <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse shrink-0" />
        </CardContent>
    </Card>
);

export default function NoticeStats({ data, isLoading }: NoticeStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((n) => <StatSkeleton key={n} />)}
            </div>
        );
    }

    const safeData: NoticeStatsData = data || {
        totalNotices: 0,
        pinnedImportant: 0,
        upcomingEvents: 0,
        thisMonth: 0,
    };

    const statCards = [
        {
            title: "Total Notices",
            value: safeData.totalNotices,
            icon: <Megaphone size={22} />,
            colorClass: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
            title: "Pinned / Important",
            value: safeData.pinnedImportant,
            icon: <Pin size={22} />,
            colorClass: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
        },
        {
            title: "Upcoming Events",
            value: safeData.upcomingEvents,
            icon: <CalendarDays size={22} />,
            colorClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
            title: "This Month",
            value: safeData.thisMonth,
            icon: <BellRing size={22} />,
            colorClass: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {statCards.map((stat, index) => (
                <Card 
                    key={index} 
                    className="border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group"
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
                        <div className={cn("p-3 rounded-xl shrink-0 shadow-sm dark:shadow-none transition-colors", stat.colorClass)}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}