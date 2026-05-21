import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

// --- General / Company Settings ---
export function useCompanySettings() {
    return useQuery({
        queryKey: ['settings', 'company'],
        queryFn: async () => {
            const res = await apiClient.get('/settings/company');
            return res.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 mins cache
    });
}

export function useUpdateCompanySettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            // Can accept standard JSON object or FormData for files
            const res = await apiClient.put('/settings/company', data);
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'company'] });
        }
    });
}

// --- Notifications ---
export function useNotificationPreferences() {
    return useQuery({
        queryKey: ['settings', 'notifications'],
        queryFn: async () => {
            const res = await apiClient.get('/settings/notifications');
            return res.data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.put('/settings/notifications', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
        }
    });
}

// --- Security ---
export function useUpdatePassword() {
    return useMutation({
        mutationFn: async ({ currentPassword, newPassword }: any) => {
            const res = await apiClient.patch('/auth/update-password', { currentPassword, newPassword });
            return res.data;
        }
    });
}

// --- Active Session Management ---
export function useActiveSessions() {
    return useQuery({
        queryKey: ['settings', 'sessions'],
        queryFn: async () => {
            const res = await apiClient.get('/settings/sessions');
            return res.data.data;
        },
        staleTime: 30 * 1000, // 30 seconds
    });
}

export function useRevokeOtherSessions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.post('/settings/sessions/revoke-others');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] });
        }
    });
}

// --- Admin Overrides ---
export function useSearchEmployees(query: string) {
    return useQuery({
        queryKey: ['settings', 'admin', 'search-users', query],
        queryFn: async () => {
            if (!query) return [];
            const res = await apiClient.get(`/settings/admin/search-users?q=${encodeURIComponent(query)}`);
            return res.data.data;
        },
        enabled: query.trim().length >= 2,
        staleTime: 5000,
    });
}

export function useAdminPasswordOverride() {
    return useMutation({
        mutationFn: async ({ targetUserId, newPassword }: any) => {
            const res = await apiClient.post('/settings/admin/change-password', { targetUserId, newPassword });
            return res.data;
        }
    });
}