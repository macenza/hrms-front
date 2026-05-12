// src/app/(main)/attendance/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import { useDailyAttendance } from '@/hooks/api/useAttendance';

export default function AttendancePage() {
    const router = useRouter();
    
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';

    // 2. Local UI State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

    // Prevent UI flashing before the redirect takes place
    if (!isAuthenticated || !isAdminOrHR) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                        Daily Attendance
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                        Monitor employee check-ins and working hours.
                    </p>
                </div>

                {/* Table Component */}
                <AttendanceTable
                    data={attendanceData}
                    isLoading={isLoading}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate} 
                />
                
            </div>
        </div>
    );
}