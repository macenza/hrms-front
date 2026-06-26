import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

// --- Fetch paginated notifications ---
export function useNotifications(page = 1, limit = 20, status?: string) {
    return useQuery({
        queryKey: ['notifications', page, limit, status],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit };
            if (status) params.status = status;
            const res = await apiClient.get('/notifications', { params });
            return res.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    });
}

// --- Fetch unread notification count ---
export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            const res = await apiClient.get('/notifications/unread-count');
            return res.data.count as number;
        },
        staleTime: 15 * 1000, // 15 seconds
        refetchInterval: 30 * 1000, // Poll every 30 seconds
    });
}

// --- Mark single notification as read ---
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await apiClient.put(`/notifications/${notificationId}/read`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

// --- Mark all notifications as read ---
export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.put('/notifications/read-all');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
