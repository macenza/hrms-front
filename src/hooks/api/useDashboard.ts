// src/hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export function useDashboardStats(enabled: boolean) {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.DASHBOARD?.STATS || '/dashboard/stats');
            return data;
        },
        enabled, // RBAC Gate: Only runs if the user is HR/Admin
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent spamming the backend
    });
}

export function useDashboardAttendance(timeframe: string) {
    return useQuery({
        queryKey: ['dashboard', 'attendance', timeframe],
        queryFn: async () => {
            const { data } = await apiClient.get(`${ENDPOINTS.DASHBOARD?.ATTENDANCE || '/dashboard/attendance'}?timeframe=${timeframe}`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}