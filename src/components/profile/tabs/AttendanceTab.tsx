'use client';

import React from 'react';
import { CheckCircle2, XCircle, CalendarRange, Clock, Loader2 } from 'lucide-react';

// UI Components
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Data Contracts for Backend Integration
export interface EmployeeAttendanceStats {
    present: number;
    absent: number;
    onLeave: number;
    lateCheckIns: number;
}

export type AttendanceLogStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export interface AttendanceLogRecord {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    status: AttendanceLogStatus;
}

interface AttendanceTabProps {
    stats?: EmployeeAttendanceStats;
    logs?: AttendanceLogRecord[];
    isLoading?: boolean; // <-- Added loading state
}

// Dynamic UI Helper for Badges
const getStatusBadgeVariant = (status: AttendanceLogStatus) => {
    switch (status) {
        case 'Present': return 'success';
        case 'Late': return 'warning';
        case 'Half Day': return 'info';
        case 'Absent': return 'error';
        default: return 'default';
    }
};

export default function AttendanceTab({
    stats,
    logs = [],
    isLoading = false // Default to false
}: AttendanceTabProps) {
    
    // Show a loading spinner while the parent component fetches the data
    if (isLoading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading attendance records...</p>
            </div>
        );
    }

    // Structure stats for clean mapping
    const statCards = [
        {
            title: "Present Days",
            value: stats.present,
            icon: <CheckCircle2 size={18} className="text-emerald-500" />,
        },
        {
            title: "Absent",
            value: stats.absent,
            icon: <XCircle size={18} className="text-red-500" />,
        },
        {
            title: "On Leave",
            value: stats.onLeave,
            icon: <CalendarRange size={18} className="text-yellow-500" />,
        },
        {
            title: "Late Check-ins",
            value: stats.lateCheckIns,
            icon: <Clock size={18} className="text-purple-500" />,
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Overview Stats */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance Overview (This Month)</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    {stat.icon}
                                </div>
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Logs Table */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Logs</h2>
                <Card className="border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">DATE</th>
                                    <th className="px-6 py-4">CHECK IN</th>
                                    <th className="px-6 py-4">CHECK OUT</th>
                                    <th className="px-6 py-4">TOTAL HOURS</th>
                                    <th className="px-6 py-4">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No attendance logs found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{log.date}</td>
                                            <td className="px-6 py-4 text-gray-600">{log.checkIn}</td>
                                            <td className="px-6 py-4 text-gray-600">{log.checkOut}</td>
                                            <td className="px-6 py-4 text-gray-600">{log.totalHours}</td>
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