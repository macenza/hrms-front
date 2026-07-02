// src/app/(main)/attendance/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import AttendanceTable, { AttendanceRecord } from '@/components/attendance/AttendanceTable';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import MarkAttendanceModal from '@/components/attendance/MarkAttendanceModal';
import { useDailyAttendance } from '@/hooks/api/useAttendance';
import { toast } from 'sonner';

export default function AttendancePage() {
    const router = useRouter();
    
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';

    // 2. Local UI State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    // 3. React Query Data Layer
    const { data: attendanceData = [], isLoading } = useDailyAttendance(
        selectedDate, 
        isAuthenticated && isAdminOrHR
    );

    // Kick unauthorized employees back to their personal profile
    useEffect(() => {
        if (isAuthenticated && !isAdminOrHR) {
            console.warn("Unauthorized access attempt. Redirecting to personal profile.");
            router.replace('/profile');
        }
    }, [isAuthenticated, isAdminOrHR, router]);

    // Calculate aggregate statistics for the selected date
    const stats = useMemo(() => {
        const total = attendanceData.length;
        let present = 0;
        let absent = 0;
        let late = 0;
        let onLeave = 0;
        let halfDay = 0;

        attendanceData.forEach((rec) => {
            if (rec.status === 'Present') present++;
            else if (rec.status === 'Absent') absent++;
            else if (rec.status === 'Late' || rec.late === 'Yes') {
                late++;
                present++;
            }
            else if (rec.status === 'On Leave') onLeave++;
            else if (rec.status === 'Half-Day') halfDay++;
        });

        return { total, present, absent, late, onLeave, halfDay };
    }, [attendanceData]);

    const handleExportAttendance = () => {
        if (attendanceData.length === 0) return toast.info("No records to export.");
        
        const headers = ['Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Late', 'Status'];
        const csvRows = attendanceData.map((rec) => [
            rec.id,
            `"${rec.name}"`,
            `"${rec.dept}"`,
            rec.checkIn || '-',
            rec.checkOut || '-',
            rec.hours,
            rec.late || 'No',
            rec.status
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Attendance_Report_${selectedDate}.csv`;
        link.click();
        toast.success('Attendance logs exported successfully!');
    };

    const handleAdjust = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setIsMarkModalOpen(true);
    };

    const handleOpenMarkModal = () => {
        setSelectedRecord(null);
        setIsMarkModalOpen(true);
    };

    // Prevent UI flashing before the redirect takes place
    if (!isAuthenticated || !isAdminOrHR) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-950 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                            Daily Attendance
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Monitor employee check-ins, working hours, and work environments
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Export CSV Button */}
                        <Button 
                            variant="outline" 
                            onClick={handleExportAttendance}
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold whitespace-nowrap"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span>Export CSV</span>
                        </Button>

                        {/* Date Picker */}
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-10 px-3 appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>

                        {/* Mark Attendance Button */}
                        <Button 
                            variant="primary" 
                            onClick={handleOpenMarkModal} 
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold whitespace-nowrap"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            <span>Mark Attendance</span>
                        </Button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <AttendanceStats data={stats} isLoading={isLoading} />

                {/* Table Component */}
                <AttendanceTable
                    data={attendanceData}
                    isLoading={isLoading}
                    onAdjust={handleAdjust}
                />
                
                {/* Adjust/Mark Modal */}
                <MarkAttendanceModal
                    isOpen={isMarkModalOpen}
                    onClose={() => setIsMarkModalOpen(false)}
                    selectedRecord={selectedRecord}
                    selectedDate={selectedDate}
                />
            </div>
        </div>
    );
}