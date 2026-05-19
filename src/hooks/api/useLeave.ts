import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { useAppSelector } from '@/store/hooks';
import { Leave } from '@/types';

export function useLeaveStats(employeeId?: string) {
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role;

    return useQuery({
        queryKey: ['leave', 'stats', employeeId, role],
        queryFn: async () => {
            let url = '/leaves/stats';
            if (role === 'Admin' && !employeeId) {
                url = '/admin/leaves/stats';
            } else if (role === 'HR' && !employeeId) {
                url = '/hr/leaves/stats';
            } else if (employeeId) {
                url = `/leaves/stats/${employeeId}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useLeaveRequests(employeeId?: string) {
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role;

    return useQuery<Leave[]>({
        queryKey: ['leave', 'requests', employeeId, role],
        queryFn: async () => {
            let url = '/leaves';
            if (role === 'Admin') {
                url = employeeId ? `/admin/leaves/employee/${employeeId}` : '/admin/leaves';
            } else if (role === 'HR') {
                url = employeeId ? `/hr/leaves/employee/${employeeId}` : '/hr/leaves';
            } else {
                url = employeeId ? `/leaves?employeeId=${employeeId}` : '/leaves';
            }
            const response = await apiClient.get(url);
            const rawData = response.data;
            if (Array.isArray(rawData)) return rawData;
            if (rawData?.leaves && Array.isArray(rawData.leaves)) return rawData.leaves;
            if (rawData?.data && Array.isArray(rawData.data)) return rawData.data;
            return [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useApplyLeave() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leaveData: any) => {
            const response = await apiClient.post('/leaves', leaveData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave'] });
        }
    });
}