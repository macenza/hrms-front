'use client';

import React from 'react';
import { IndianRupee, CreditCard, Clock, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface LoanStatsData {
    activeLoans: number;
    pendingRequests: number;
    totalDisbursed: number;
    monthlyRecovery: number;
}

export interface PersonalLoanStatsData {
    totalBorrowed: number;
    outstandingBalance: number;
    nextEmiAmount: number;
    nextEmiDate?: string;
    pendingRequests: number;
}

interface LoanStatsProps {
    data?: LoanStatsData | null;
    personalData?: PersonalLoanStatsData | null;
    isLoading?: boolean;
    isManagerial?: boolean;
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

export default function LoanStats({ 
    data, 
    personalData,
    isLoading = false, 
    isManagerial = false 
}: LoanStatsProps) {
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
            </div>
        );
    }

    if (isManagerial) {
        const safeData = data || { activeLoans: 0, pendingRequests: 0, totalDisbursed: 0, monthlyRecovery: 0 };

        const statCards = [
            {
                title: "Total Active Loans",
                value: safeData.activeLoans.toString(),
                icon: <Activity size={22} />,
                colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
                description: "Loans currently being recovered"
            },
            {
                title: "Pending Requests",
                value: safeData.pendingRequests.toString(),
                icon: <Clock size={22} />,
                colorClass: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
                description: "Awaiting review and approval"
            },
            {
                title: "Total Disbursed",
                value: formatINR(safeData.totalDisbursed),
                icon: <IndianRupee size={22} />,
                colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
                description: "Cumulative principal approved"
            },
            {
                title: "Monthly EMI Recovery",
                value: formatINR(safeData.monthlyRecovery),
                icon: <CreditCard size={22} />,
                colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
                description: "Target monthly payroll recovery"
            },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {statCards.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 bg-white dark:bg-gray-900 transition-all duration-300 group"
                    >
                        <CardContent className="p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 transition-colors">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                                    {stat.description}
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
    } else {
        // Employee View Stats
        const safePersonalData = personalData || {
            totalBorrowed: 0,
            outstandingBalance: 0,
            nextEmiAmount: 0,
            pendingRequests: 0,
            nextEmiDate: 'N/A'
        };

        const personalCards = [
            {
                title: "Total Borrowed",
                value: formatINR(safePersonalData.totalBorrowed),
                icon: <ShieldCheck size={22} />,
                colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
                description: "Total value of approved loans"
            },
            {
                title: "Outstanding Balance",
                value: formatINR(safePersonalData.outstandingBalance),
                icon: <IndianRupee size={22} />,
                colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
                description: "Remaining principal amount to pay"
            },
            {
                title: "Next EMI Due",
                value: formatINR(safePersonalData.nextEmiAmount),
                icon: <CreditCard size={22} />,
                colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
                description: safePersonalData.nextEmiDate ? `Due on: ${safePersonalData.nextEmiDate}` : "No active upcoming EMIs"
            },
            {
                title: "My Pending Requests",
                value: safePersonalData.pendingRequests.toString(),
                icon: <Clock size={22} />,
                colorClass: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
                description: "Applications awaiting HR review"
            },
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {personalCards.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 bg-white dark:bg-gray-900 transition-all duration-300 group"
                    >
                        <CardContent className="p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 transition-colors">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                                    {stat.description}
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
}