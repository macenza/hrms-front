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
            const res = await apiClient.put('/settings/company', data);
            return res.data;
        },
        onSuccess: () => {
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

export function useToggle2FA() {
    return useMutation({
        mutationFn: async (enable: boolean) => {
            const res = await apiClient.post('/auth/2fa/toggle', { enable });
            return res.data;
        }
    });
}