'use client';

import React, { useEffect, useState } from 'react';
import AttendanceTable, { AttendanceRecord } from '@/components/attendance/AttendanceTable';
import apiClient from '@/services/apiClient'; // Or use an attendanceService

export default function AttendancePage() {
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchTodayAttendance = async () => {
            setIsLoading(true);
            try {
                // Fetch today's global attendance
                const response = await apiClient.get('/attendance/daily', {
                    params: { date: selectedDate }
                });
                
                // Map the backend data to match the UI contracts
                const mappedData: AttendanceRecord[] = response.data.map((log: any) => ({
                    dbId: log._id,
                    id: log.user?.employeeId || 'N/A',
                    name: log.user?.name || 'Unknown',
                    dept: log.user?.profile?.department || 'Unassigned',
                    date: new Date(log.date).toLocaleDateString(),
                    checkIn: log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
                    checkOut: log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
                    hours: log.totalHours ? `${log.totalHours}h` : '0h',
                    late: log.status === 'Late' ? 'Yes' : null, // Backend can calculate exact late minutes if needed
                    status: log.status
                }));

                setAttendanceData(mappedData);
            } catch (error) {
                console.error("Failed to fetch today's attendance:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodayAttendance();
    }, [selectedDate]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Attendance</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">Monitor employee check-ins and working hours.</p>
            </div>

            <AttendanceTable 
                data={attendanceData} 
                isLoading={isLoading} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate} // Pass the state updater down
            />
        </div>
    );
}