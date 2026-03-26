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
    data?: NoticeStatsData;
}

// Mock Data Fallback
const mockNoticeStats: NoticeStatsData = {
    totalNotices: 42,
    pinnedImportant: 3,
    upcomingEvents: 4,
    thisMonth: 12,
};

export default function NoticeStats({ data = mockNoticeStats }: NoticeStatsProps) {

    // Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Notices",
            value: data.totalNotices,
            icon: <Megaphone size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pinned / Important",
            value: data.pinnedImportant,
            icon: <Pin size={20} />,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
        {
            title: "Upcoming Events",
            value: data.upcomingEvents,
            icon: <CalendarDays size={20} />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            title: "This Month",
            value: data.thisMonth,
            icon: <BellRing size={20} />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Map over the array using the standardized Card component */}
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