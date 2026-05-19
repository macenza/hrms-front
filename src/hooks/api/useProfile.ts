import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import apiClient from '@/services/apiClient';

export function useEmployeeProfile(employeeId: string) {
    return useQuery({
        queryKey: ['employee', employeeId],
        queryFn: async () => {
            if (!employeeId) throw new Error("Employee ID is required");

            const { data } = await apiClient.get(`/employees/${employeeId}`);

            if (data.user) {
                return data.user;
            }

            return data.data ? data.data : data;
        },
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useEmployeeAttendanceLogs(employeeId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ['profile', 'attendance', employeeId],
        queryFn: () => employeeService.getAttendanceLogs(employeeId as string),
        enabled: !!employeeId && enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUploadDocument(employeeId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => employeeService.uploadDocument(employeeId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', employeeId] });
        }
    });
}

export function useUploadCertificate(employeeId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => employeeService.uploadCertificate(employeeId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', employeeId] });
        },
    });
}

export function useAddNote(employeeId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => employeeService.addNote(employeeId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', employeeId] });
        }
    });
}