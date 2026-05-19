// src/hooks/api/useAssets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { employeeService } from '@/services/employeeService';
import { AddAssetPayload } from '@/components/assets/AddAssetModal';
import { AssignAssetPayload } from '@/components/assets/AssignAssetModal';

export function useAssetData(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: ['assets', 'dashboard', page, limit],
        queryFn: async () => {
            const data = await assetService.getDashboardData(page, limit);
            
            const mappedRecords = data.records.map((rec: any) => ({
                id: rec.assetTag,
                name: rec.name,
                category: rec.category,
                assignee: rec.assignee?.name || null,
                date: rec.assignedDate ? new Date(rec.assignedDate).toLocaleDateString() : null,
                status: rec.status,
                dbId: rec._id,
                serialNumber: rec.serialNumber || 'N/A',
                manufacturer: rec.manufacturer || 'N/A',
                model: rec.model || 'N/A',
                cost: rec.cost || 0,
                condition: rec.condition || 'New',
                notes: rec.notes || '',
                expectedReturnDate: rec.expectedReturnDate ? new Date(rec.expectedReturnDate).toLocaleDateString() : null,
                assignedBy: rec.assignedBy?.name || null,
            }));

            return { 
                stats: data.stats, 
                records: mappedRecords, 
                pagination: data.pagination 
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}

// Fetches all available assets for the assign asset modal select dropdown
export function useAvailableAssets(enabled: boolean) {
    return useQuery({
        queryKey: ['assets', 'available'],
        queryFn: async () => {
            const data = await assetService.getDashboardData(1, 1000);
            return data.records
                .filter((rec: any) => rec.status === 'Available')
                .map((rec: any) => ({
                    id: rec._id,
                    label: `${rec.name} (${rec.assetTag})`
                }));
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

// Only fetched if the user is a manager (RBAC gated in the component)
export function useAssetFormOptions(enabled: boolean) {
    return useQuery({
        queryKey: ['assets', 'employees'],
        queryFn: async () => {
            const empResponse = await employeeService.getAll(1, 100);
            return empResponse.employees.map((emp: any) => ({
                id: emp.id, 
                label: `${emp.name || 'Unknown'} (${emp.empId || 'No ID'})`
            }));
        },
        enabled,
        staleTime: 10 * 60 * 1000, 
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddAssetPayload) => assetService.createAsset(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
}

export function useAssignAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AssignAssetPayload) => assetService.assignAsset(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => assetService.deleteAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
}

export function useUpdateAssetStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => assetService.updateAssetStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });
}