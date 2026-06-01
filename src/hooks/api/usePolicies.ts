import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

export interface Policy {
    _id: string;
    category: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedBy: {
        _id: string;
        name: string;
        email: string;
        profile?: {
            avatar?: string | null;
        };
    } | string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Hook to fetch all company policies.
 * Accessible to all authenticated users.
 */
export function usePolicies() {
    return useQuery<Policy[]>({
        queryKey: ['policies'],
        queryFn: async () => {
            const res = await apiClient.get('/policies');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}

/**
 * Hook to upload or update a policy.
 * Updates are automatically reflected across queries.
 */
export function useUploadPolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await apiClient.post('/policies', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        },
        onSuccess: () => {
            // Invalidate policy cache to trigger a live sync
            queryClient.invalidateQueries({ queryKey: ['policies'] });
        },
    });
}
