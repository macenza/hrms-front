'use client';

import React from 'react';
import { 
    Download, 
    CheckSquare, 
    CheckCircle2, 
    XCircle, 
    CalendarRange, 
    Clock 
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// Feature Components
import AttendanceTable from '@/components/attendance/AttendanceTable';

// 1. Data contract for when you hook up your API
export interface AttendanceDashboardStats {
    present: number;
    absent: number;
    onLeave: number;
    late: number;
}

// Mock API Data
const mockStats: AttendanceDashboardStats = {
    present: 450,
    absent: 25,
    onLeave: 15,
    late: 18
};

export default function AttendancePage() {
    // In the future, this is where data hooks will go:
    // const { data: stats, isLoading: statsLoading } = useAttendanceStats();
    // const { data: attendanceRecords } = useDailyAttendance();

    const statsData = mockStats; // Swap this when API is ready

    // 2. DRY approach: Array mapping for the stat cards
    const statCards = [
        {
            title: "Present Today",
            value: statsData.present,
            icon: <CheckCircle2 size={24} />,
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
        },
        {
            title: "Absent Today",
            value: statsData.absent,
            icon: <XCircle size={24} />,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
        {
            title: "On Leave",
            value: statsData.onLeave,
            icon: <CalendarRange size={24} />,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-500",
        },
        {
            title: "Late Check-ins",
            value: statsData.late,
            icon: <Clock size={24} />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor and manage daily employee attendance records
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </Button>
                    <Button variant="primary" className="gap-2 shadow-sm shadow-blue-500/30">
                        <CheckSquare size={16} />
                        Mark Attendance
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                        <CardContent className="p-5 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.iconBg} ${stat.iconColor}`}>
                                {stat.icon}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Data Table */}
            {/* When API is ready, pass the data: <AttendanceTable data={attendanceRecords} /> */}
            <AttendanceTable />
        </div>
    );
}