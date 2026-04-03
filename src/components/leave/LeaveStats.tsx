'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Thermometer, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { getLeaveStats, getAllLeaveStats } from '@/services/leaveService';

// Data Contract
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

export default function LeaveStats() {
    const { user } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState<LeaveStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                let rawData: any;
                if (user.role === 'HR' || user.role === 'Admin') {
                    rawData = await getAllLeaveStats();
                } else {
                    rawData = await getLeaveStats();
                }

                console.log("Raw Leave Stats Response:", rawData);

                // --- Safe Data Mapping ---
                // We extract the data, providing safe fallbacks (0) just in case 
                // the backend hasn't populated a specific field yet.
                const dataObj = rawData?.data || rawData || {};
                
                const mappedStats: LeaveStatsData = {
                    annual: {
                        used: dataObj.annual?.used || 0,
                        total: dataObj.annual?.total || 20, // Defaulting to 20 if backend doesn't provide
                    },
                    sick: {
                        used: dataObj.sick?.used || 0,
                        total: dataObj.sick?.total || 10,
                    },
                    pendingRequests: dataObj.pendingRequests || 0,
                    approvedYTD: dataObj.approvedYTD || 0,
                };

                setStats(mappedStats);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32 bg-gray-50 rounded-xl border border-gray-100">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
                <span className="text-gray-500 font-medium">Loading statistics...</span>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error || "Failed to load statistics."}
            </div>
        );
    }

    // Structure the data for easy rendering
    const statCards = [
        {
            title: user?.role === 'HR' || user?.role === 'Admin' ? "Org Annual Leaves Used" : "My Annual Leave",
            value: stats.annual.used,
            suffix: `/ ${stats.annual.total} days`,
            icon: <Calendar size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: user?.role === 'HR' || user?.role === 'Admin' ? "Org Sick Leaves Used" : "My Sick Leave",
            value: stats.sick.used,
            suffix: `/ ${stats.sick.total} days`,
            icon: <Thermometer size={20} />,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
        {
            title: user?.role === 'HR' || user?.role === 'Admin' ? "Org Pending Requests" : "My Pending Requests",
            value: stats.pendingRequests,
            suffix: null,
            icon: <Clock size={20} />,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: user?.role === 'HR' || user?.role === 'Admin' ? "Org Approved (YTD)" : "My Approved (YTD)",
            value: stats.approvedYTD,
            suffix: null,
            icon: <CheckCircle2 size={20} />,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
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