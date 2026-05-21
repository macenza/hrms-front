'use client';

import React from 'react';
import { CheckCircle2, XCircle, CalendarRange, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface EmployeeAttendanceStats {
    present: number;
    absent: number;
    onLeave: number;
    lateCheckIns: number;
}

export type AttendanceLogStatus = 'Present' | 'Absent' | 'Late' | 'Half-Day' | 'On Leave';

export interface AttendanceLogRecord {
    id: string;
    _id?: string;
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    status: AttendanceLogStatus;
}

interface AttendanceTabProps {
    stats?: EmployeeAttendanceStats;
    logs?: AttendanceLogRecord[];
    isLoading?: boolean; 
}

const getStatusBadgeVariant = (status: AttendanceLogStatus) => {
    switch (status) {
        case 'Present': return 'success';
        case 'Late': return 'warning';
        case 'Half-Day': return 'info';
        case 'On Leave': return 'warning';
        case 'Absent': return 'error';
        default: return 'default';
    }
};

// Premium Skeleton Loaders
const StatCardSkeleton = () => (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors">
        <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse shrink-0" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mt-2" />
        </CardContent>
    </Card>
);

const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
    </tr>
);

export default function AttendanceTab({
    stats,
    logs = [],
    isLoading = false
}: AttendanceTabProps) {

    const safeStats = stats || { present: 0, absent: 0, onLeave: 0, lateCheckIns: 0 };

    const statCards = [
        {
            title: "Present Days",
            value: safeStats.present,
            icon: <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />,
            bgClass: "bg-emerald-50 dark:bg-emerald-500/10"
        },
        {
            title: "Absent",
            value: safeStats.absent,
            icon: <XCircle size={18} className="text-red-600 dark:text-red-400" />,
            bgClass: "bg-red-50 dark:bg-red-500/10"
        },
        {
            title: "On Leave",
            value: safeStats.onLeave,
            icon: <CalendarRange size={18} className="text-yellow-600 dark:text-yellow-400" />,
            bgClass: "bg-yellow-50 dark:bg-yellow-500/10"
        },
        {
            title: "Late Check-ins",
            value: safeStats.lateCheckIns,
            icon: <Clock size={18} className="text-purple-600 dark:text-purple-400" />,
            bgClass: "bg-purple-50 dark:bg-purple-500/10"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Stats Overview */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Attendance Overview (This Month)</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        statCards.map((stat, index) => (
                            <Card key={index} className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{stat.title}</p>
                                        <div className={cn("p-1.5 rounded-lg transition-colors", stat.bgClass)}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">{stat.value}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Logs Table */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Recent Logs</h2>
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                <tr>
                                    <th className="px-6 py-4 uppercase text-xs tracking-wider">Date</th>
                                    <th className="px-6 py-4 uppercase text-xs tracking-wider">Check In</th>
                                    <th className="px-6 py-4 uppercase text-xs tracking-wider">Check Out</th>
                                    <th className="px-6 py-4 uppercase text-xs tracking-wider">Total Hours</th>
                                    <th className="px-6 py-4 uppercase text-xs tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                                    <Calendar size={24} className="text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No attendance logs found</p>
                                                <p className="text-sm mt-1">There are no attendance records for this period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                                                ) : (
                                    logs.map((log, index) => (
                                        <tr key={log.id || log._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium transition-colors">{log.date}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">{log.checkIn || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">{log.checkOut || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors">{log.totalHours}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusBadgeVariant(log.status)}>
                                                    {log.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}