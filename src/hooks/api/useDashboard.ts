import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { ENDPOINTS } from '@/constants/endpoints';
import {
    normalizeDashboardAttendance,
    normalizeDashboardStats,
} from '@/lib/dashboard';
import type { DashboardAttendance, DashboardStats } from '@/store/dashboardSlice';

export function useDashboardStats(enabled: boolean) {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.DASHBOARD.STATS);
            return normalizeDashboardStats(data);
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDashboardAttendance(timeframe: 'week' | 'month') {
    return useQuery<DashboardAttendance>({
        queryKey: ['dashboard', 'attendance', timeframe],
        queryFn: async () => {
            const { data } = await apiClient.get(ENDPOINTS.DASHBOARD.ATTENDANCE, {
                params: { timeframe },
            });
            return normalizeDashboardAttendance(data);
        },
        staleTime: 5 * 60 * 1000,
    });
}
