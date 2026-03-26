import React from 'react';
import { Calendar, Thermometer, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// Data Contract for Backend Integration
export interface LeaveBalance {
    used: number;
    total: number;
}

export interface LeaveStatsData {
    annual: LeaveBalance;
    sick: LeaveBalance;
    pendingRequests: number;
    approvedYTD: number;
}

interface LeaveStatsProps {
    data?: LeaveStatsData;
}

// Mock Data Fallback
const mockLeaveStats: LeaveStatsData = {
    annual: { used: 12, total: 20 },
    sick: { used: 5, total: 10 },
    pendingRequests: 1,
    approvedYTD: 8,
};

export default function LeaveStats({ data = mockLeaveStats }: LeaveStatsProps) {

    // Structure the data for easy rendering
    const statCards = [
        {
            title: "Annual Leave",
            value: data.annual.used,
            suffix: `/ ${data.annual.total} days`,
            icon: <Calendar size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Sick Leave",
            value: data.sick.used,
            suffix: `/ ${data.sick.total} days`,
            icon: <Thermometer size={20} />,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
        {
            title: "Pending Requests",
            value: data.pendingRequests,
            suffix: null,
            icon: <Clock size={20} />,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: "Approved (YTD)",
            value: data.approvedYTD,
            suffix: null,
            icon: <CheckCircle2 size={20} />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Map over the array using our consistent Card component */}
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {stat.value}
                                {stat.suffix && (
                                    <span className="text-sm font-medium text-gray-500 tracking-normal ml-1">
                                        {stat.suffix}
                                    </span>
                                )}
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