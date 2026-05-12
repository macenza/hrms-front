// src/hooks/api/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';

export function useEmployeeProfile(employeeId: string | undefined) {
    return useQuery({
        queryKey: ['profile', employeeId],
        queryFn: () => employeeService.getById(employeeId as string),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, // 5 mins
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

export function useAddNote(employeeId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => employeeService.addNote(employeeId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', employeeId] });
        }
    });
}