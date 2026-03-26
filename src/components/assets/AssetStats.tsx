import React from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// 1. Define the data contract for backend integration
export interface AssetStatsData {
    total: number;
    assigned: number;
    available: number;
    maintenance: number;
}

interface AssetStatsProps {
    data?: AssetStatsData;
}

// Temporary mock data until the API is integrated
const defaultData: AssetStatsData = {
    total: 145,
    assigned: 112,
    available: 28,
    maintenance: 5,
};

export default function AssetStats({ data = defaultData }: AssetStatsProps) {
    // 2. Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Assets",
            value: data.total,
            icon: <Laptop size={20} />,
            iconBg: "bg-gray-50",
            iconColor: "text-gray-600",
        },
        {
            title: "Assigned",
            value: data.assigned,
            icon: <UserCheck size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-[#4F7CF3]",
        },
        {
            title: "Available",
            value: data.available,
            icon: <CheckCircle2 size={20} />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Under Maintenance",
            value: data.maintenance,
            icon: <Wrench size={20} />,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 3. Map over the array using our consistent UI components */}
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 border-none sm:border-solid">
                    {/* We use pt-5 to override the default padding from CardContent if needed, keeping your original spacing */}
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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