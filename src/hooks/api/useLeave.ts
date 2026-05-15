import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

export function useLeaveStats(employeeId?: string) {
    return useQuery({
        queryKey: ['leave', 'stats', employeeId],
        queryFn: async () => {
            const url = employeeId ? `/leaves/stats/${employeeId}` : '/leaves/stats';
            const response = await apiClient.get(url);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useLeaveRequests(employeeId?: string) {
    return useQuery({
        queryKey: ['leave', 'requests', employeeId],
        queryFn: async () => {
            const url = employeeId ? `/leaves/requests?employeeId=${employeeId}` : '/leaves/requests';
            const response = await apiClient.get(url);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useApplyLeave() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leaveData: any) => {
            const response = await apiClient.post('/leaves/apply', leaveData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        }
    });
}