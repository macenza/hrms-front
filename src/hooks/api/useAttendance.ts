// src/hooks/api/useAttendance.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { AttendanceRecord } from '@/components/attendance/AttendanceTable';

export function useDailyAttendance(date: string, enabled: boolean) {
    return useQuery({
        // The queryKey includes the date, so React Query caches each day separately
        queryKey: ['attendance', 'daily', date],
        queryFn: async () => {
            const response = await apiClient.get('/attendance/daily', {
                params: { date }
            });
            
            // Map the raw backend payload to the frontend table contract
            return response.data.map((log: any): AttendanceRecord => ({
                dbId: log._id,
                id: log.user?.employeeId || 'N/A',
                name: log.user?.name || 'Unknown',
                dept: log.user?.profile?.department || 'Unassigned',
                date: new Date(log.date).toLocaleDateString(),
                checkIn: log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                checkOut: log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                hours: log.totalHours ? `${Number(log.totalHours).toFixed(1)}h` : '0h',
                late: log.status === 'Late' ? 'Yes' : null,
                status: log.status
            }));
        },
        enabled, // RBAC Gate: Only runs if the user is HR/Admin
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}