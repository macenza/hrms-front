'use client';

import React from 'react';
import { IndianRupee, CreditCard, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// Data Contract for Backend Integration
export interface LoanStatsData {
    activeLoans: number;
    pendingRequests: number;
    totalDisbursed: number;
    monthlyRecovery: number;
}

interface LoanStatsProps {
    data?: LoanStatsData | null;
    isLoading?: boolean;
}

// Currency Formatter for Indian Rupees
const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0); // Added fallback to 0
};

export default function LoanStats({ data, isLoading = false }: LoanStatsProps) {

    // 1. Loading State (Skeleton UI)
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-100">
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

    // Safe fallback if data is somehow undefined after loading
    const safeData = data || { activeLoans: 0, pendingRequests: 0, totalDisbursed: 0, monthlyRecovery: 0 };

    // 2. Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Active Loans",
            value: safeData.activeLoans.toString(),
            icon: <Activity size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pending Requests",
            value: safeData.pendingRequests.toString(),
            icon: <Clock size={20} />,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: "Total Disbursed",
            value: formatINR(safeData.totalDisbursed),
            icon: <IndianRupee size={20} />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            title: "Monthly EMI Recovery",
            value: formatINR(safeData.monthlyRecovery),
            icon: <CreditCard size={20} />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Map over the array using the standardized Card component */}
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow duration-200 bg-white">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {stat.value}
                            </p>
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