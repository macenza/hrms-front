import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetCategoryService, AssetCategoryPayload } from '@/services/assetCategoryService';

export interface AssetCategory {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export function useAssetCategoryData(page: number = 1, limit: number = 10, search: string = '', isActive?: boolean) {
    return useQuery({
        queryKey: ['asset-categories', 'list', page, limit, search, isActive],
        queryFn: async () => {
            const data = await assetCategoryService.getCategories(page, limit, search, isActive);
            
            // Map records cleanly
            const records: AssetCategory[] = (data.records || []).map((rec: any) => ({
                _id: rec._id,
                name: rec.name,
                description: rec.description || '',
                isActive: rec.isActive !== false,
                createdBy: rec.createdBy ? {
                    _id: rec.createdBy._id,
                    name: rec.createdBy.name || 'Unknown',
                    email: rec.createdBy.email || ''
                } : undefined,
                createdAt: rec.createdAt,
                updatedAt: rec.updatedAt
            }));

            return {
                records,
                pagination: data.pagination || { currentPage: 1, totalPages: 1, totalEntries: 0, entriesPerPage: 10 }
            };
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useCreateAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AssetCategoryPayload) => assetCategoryService.createCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
        }
    });
}

export function useUpdateAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AssetCategoryPayload }) => 
            assetCategoryService.updateCategory(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
        }
    });
}

export function useDeleteAssetCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => assetCategoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-categories'] });
        }
    });
}
