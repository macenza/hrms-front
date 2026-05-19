'use client';

import React from 'react';
import { IndianRupee, CreditCard, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

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

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

// Skeleton Loader for Stats
const StatSkeleton = () => (
    <Card className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors">
        <CardContent className="p-5 flex items-start justify-between">
            <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
            </div>
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ml-4 shrink-0" />
        </CardContent>
    </Card>
);

export default function LoanStats({ data, isLoading = false }: LoanStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
            </div>
        );
    }

    const safeData = data || { activeLoans: 0, pendingRequests: 0, totalDisbursed: 0, monthlyRecovery: 0 };

    const statCards = [
        {
            title: "Total Active Loans",
            value: safeData.activeLoans.toString(),
            icon: <Activity size={22} />,
            colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
        },
        {
            title: "Pending Requests",
            value: safeData.pendingRequests.toString(),
            icon: <Clock size={22} />,
            colorClass: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
        },
        {
            title: "Total Disbursed",
            value: formatINR(safeData.totalDisbursed),
            icon: <IndianRupee size={22} />,
            colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
            title: "Monthly EMI Recovery",
            value: formatINR(safeData.monthlyRecovery),
            icon: <CreditCard size={22} />,
            colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {statCards.map((stat, index) => (
                <Card 
                    key={index} 
                    className="border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 bg-white dark:bg-gray-900 transition-all duration-300 group"
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