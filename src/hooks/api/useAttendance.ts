import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceRecord } from '@/components/attendance/AttendanceTable';

export function useDailyAttendance(date: string, enabled: boolean) {
    return useQuery({
        queryKey: ['attendance', 'daily', date],
        queryFn: async () => {
            const rawData = await attendanceService.getDailyAttendance(date);

            const logs = Array.isArray(rawData) 
                ? rawData 
                : (rawData.data || rawData.logs || rawData.attendance || []);

            // Safety check: If it's STILL not an array, return empty to prevent .map() crashes
            if (!Array.isArray(logs)) {
                console.warn("Expected an array of attendance logs but received:", rawData);
                return [];
            }

            return logs.map((log: any): AttendanceRecord => {
                const logDate = log.date || log.checkInTime || log.dateString || new Date();
                const minutes = log.totalWorkedMinutes || 0;
                const hoursValue = minutes / 60;

                return {
                    dbId: log._id,
                    employeeUserId: log.user?._id || log.user?.id,
                    id: log.user?.employeeId || 'N/A',
                    name: log.user?.name || 'Unknown',
                    dept: log.user?.profile?.employment?.department || 'Unassigned',
                    date: new Date(logDate).toLocaleDateString(),
                    checkIn: log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    checkOut: log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    hours: minutes > 0 ? `${Number(hoursValue).toFixed(1)}h` : '0h',
                    late: log.isLate ? 'Yes' : null,
                    status: log.isLate ? 'Late' : log.status,
                    shiftId: log.user?.profile?.employment?.shiftId || null
                };
            });
        },
        enabled, // RBAC Gate: Only runs if the user is HR/Admin
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

export function useMarkAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => attendanceService.markAttendance(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', 'daily'] });
            queryClient.invalidateQueries({ queryKey: ['attendance', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['attendance', 'calendar'] });
        }
    });
}

export function useCalendarAttendance(employeeId: string, month: number, year: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['attendance', 'calendar', employeeId, month, year],
        queryFn: () => attendanceService.getCalendarAttendance(employeeId, month, year),
        enabled: !!employeeId && enabled,
        staleTime: 5 * 60 * 1000,
    });
}