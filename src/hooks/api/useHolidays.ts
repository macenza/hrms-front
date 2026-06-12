import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holidayService, Holiday } from '@/services/holidayService';
import { toast } from 'sonner';

/**
 * Fetches all holidays with optional filters.
 */
export function useHolidays(params?: { year?: number; country?: string; type?: string; includeDeleted?: boolean }) {
    return useQuery<Holiday[]>({
        queryKey: ['holidays', params],
        queryFn: async () => {
            const data = await holidayService.getAll(params);
            return data.holidays || [];
        },
    });
}

/**
 * Creates a new holiday.
 */
export function useCreateHoliday() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Holiday>) => holidayService.create(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(data.message || 'Holiday created successfully');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to create holiday');
        }
    });
}

/**
 * Updates an existing holiday.
 */
export function useUpdateHoliday() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Holiday> }) => holidayService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(data.message || 'Holiday updated successfully');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to update holiday');
        }
    });
}

/**
 * Soft deletes a holiday.
 */
export function useDeleteHoliday() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => holidayService.remove(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(data.message || 'Holiday deleted successfully');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to delete holiday');
        }
    });
}

/**
 * Restores a soft-deleted holiday.
 */
export function useRestoreHoliday() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => holidayService.restore(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(data.message || 'Holiday restored successfully');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to restore holiday');
        }
    });
}

/**
 * Bulk imports holidays from CSV/Excel.
 */
export function useBulkImportHolidays() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => holidayService.bulkImport(formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            toast.success(data.message || 'Bulk import completed');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Bulk import failed');
        }
    });
}
