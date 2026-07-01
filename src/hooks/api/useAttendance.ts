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
                
                let hoursStr = '0.00 hrs';
                if (log.checkInTime && log.checkOutTime) {
                    const diffMs = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
                    if (diffMs > 0) {
                        const diffSecs = Math.floor(diffMs / 1000);
                        const diffMins = Math.floor(diffSecs / 60);
                        const hours = Math.floor(diffMins / 60);
                        
                        if (hours > 0) {
                            const hoursDecimal = diffMs / (1000 * 60 * 60);
                            hoursStr = `${hoursDecimal.toFixed(2)} hrs`;
                        } else if (diffMins > 0) {
                            const mins = diffMins;
                            const secs = diffSecs % 60;
                            hoursStr = `${mins} mins ${secs} secs`;
                        } else {
                            hoursStr = `${diffSecs} secs`;
                        }
                    }
                } else if (log.checkInTime && !log.checkOutTime) {
                    hoursStr = '--';
                } else if (!log.checkInTime) {
                    hoursStr = '-';
                }

                return {
                    dbId: log._id,
                    employeeUserId: log.user?._id || log.user?.id,
                    id: log.user?.employeeId || 'N/A',
                    name: log.user?.name || 'Unknown',
                    dept: log.user?.profile?.employment?.department || 'Unassigned',
                    date: new Date(logDate).toLocaleDateString(),
                    checkIn: log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    checkOut: log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                    hours: hoursStr,
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

export function useMyAttendance() {
    return useQuery({
        queryKey: ['attendance', 'me'],
        queryFn: () => attendanceService.getMyAttendance(),
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}

export function useClockIn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (workFormat: string = 'Office') => attendanceService.clockIn(workFormat),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        }
    });
}

export function useClockOut() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => attendanceService.clockOut(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        }
    });
}

export function useResetTodayAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => attendanceService.resetTodayAttendance(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });
}