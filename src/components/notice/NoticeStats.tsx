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

const getNoticeStatStyles = (index: number) => {
    switch (index) {
        case 1: // Pinned/Important (Red)
            return {
                borderLine: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500',
                cardClass: 'hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-300 dark:hover:border-red-800'
            };
        case 2: // Upcoming Events (Green)
            return {
                borderLine: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400',
                cardClass: 'hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-800'
            };
        case 3: // This Month (Purple)
            return {
                borderLine: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500',
                cardClass: 'hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-800'
            };
        default: // Total Notices (Blue)
            return {
                borderLine: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
                cardClass: 'hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-800'
            };
    }
};

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
            {statCards.map((stat, index) => {
                const styles = getNoticeStatStyles(index);
                return (
                    <Card 
                        key={index} 
                        className={cn(
                            "border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-all duration-300 group relative overflow-hidden pt-7 pb-6",
                            styles.cardClass
                        )}
                    >
                        {/* Top gradient border line */}
                        <div className={cn("absolute top-0 left-0 right-0 h-[4px]", styles.borderLine)} />
                        
                        <CardContent className="p-5 pt-0 flex items-start justify-between">
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
                );
            })}
        </div>
    );
}