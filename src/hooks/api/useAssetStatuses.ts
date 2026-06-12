import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetStatusService, AssetStatusPayload } from '@/services/assetStatusService';

export interface AssetStatus {
    _id: string;
    name: string;
    color: string;
    sequence: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export function useAssetStatusData(page: number = 1, limit: number = 10, search: string = '', isActive?: boolean) {
    return useQuery({
        queryKey: ['asset-statuses', 'list', page, limit, search, isActive],
        queryFn: async () => {
            const data = await assetStatusService.getStatuses(page, limit, search, isActive);
            
            const records: AssetStatus[] = (data.records || []).map((rec: any) => ({
                _id: rec._id,
                name: rec.name,
                color: rec.color || '#3b82f6',
                sequence: typeof rec.sequence === 'number' ? rec.sequence : 0,
                isDefault: !!rec.isDefault,
                isActive: rec.isActive !== false,
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

export function useCreateAssetStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AssetStatusPayload) => assetStatusService.createStatus(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-statuses'] });
        }
    });
}

export function useUpdateAssetStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AssetStatusPayload }) => 
            assetStatusService.updateStatus(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-statuses'] });
        }
    });
}

export function useDeleteAssetStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => assetStatusService.deleteStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-statuses'] });
        }
    });
}
