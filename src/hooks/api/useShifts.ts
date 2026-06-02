import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftService } from '@/services/shiftService';

export function useShifts() {
    return useQuery({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateShift() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: { name: string; startTime: string; endTime: string }) => shiftService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        }
    });
}

export function useUpdateShift() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; startTime?: string; endTime?: string } }) => 
            shiftService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            // Also invalidate employees because their profile shifts might have changed
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
}

export function useDeleteShift() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => shiftService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        }
    });
}
