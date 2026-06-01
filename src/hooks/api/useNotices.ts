import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeService } from '@/services/noticeService';

export function useNoticeStats() {
    return useQuery({
        queryKey: ['notices', 'stats'],
        queryFn: async () => {
            const payload = await noticeService.getNoticeStats();
            return payload.data || null;
        },
        staleTime: 5 * 60 * 1000, 
    });
}

export function useNotices(categoryFilter: string, page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: ['notices', 'feed', categoryFilter, page, limit],
        queryFn: async () => {
            const payload = await noticeService.getNotices({ category: categoryFilter, page, limit });
            return payload;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateNotice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => noticeService.createNotice(data),
        onSuccess: () => {
            // Refetch both feed and stats when a new notice is published
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
    });
}

export function useUpdateNotice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => noticeService.updateNotice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
    });
}

export function useDeleteNotice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => noticeService.deleteNotice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
    });
}

export function useToggleNoticePin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => noticeService.toggleNoticePin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
    });
}