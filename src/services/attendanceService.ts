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
    }
};