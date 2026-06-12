import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export const attendanceService = {
    getDailyAttendance: async (date: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.ATTENDANCE.DAILY, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching daily attendance:", error);
            throw error;
        }
    },
    
    clockIn: async () => {
        const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CLOCK_IN);
        return response.data;
    },
    
    clockOut: async () => {
        const response = await apiClient.post(ENDPOINTS.ATTENDANCE.CLOCK_OUT);
        return response.data;
    },
    
    markAttendance: async (payload: {
        employeeId: string;
        dateString: string;
        status: string;
        checkInTime?: string;
        checkOutTime?: string;
        isLate?: boolean;
        lateByMinutes?: number;
        workFormat?: string;
        notes?: string;
    }) => {
        const response = await apiClient.post('/attendance/mark', payload);
        return response.data;
    },
    
    getCalendarAttendance: async (employeeId: string, month: number, year: number) => {
        try {
            const response = await apiClient.get('/attendance/calendar', {
                params: { employeeId, month, year }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching calendar attendance:", error);
            throw error;
        }
    }
};