// src/hooks/api/useAssets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { employeeService } from '@/services/employeeService';
import { AddAssetPayload } from '@/components/assets/AddAssetModal';
import { AssignAssetPayload } from '@/components/assets/AssignAssetModal';

export function useAssetData() {
    return useQuery({
        queryKey: ['assets', 'dashboard'],
        queryFn: async () => {
            const data = await assetService.getDashboardData();
            
            const mappedRecords = data.records.map((rec: any) => ({
                id: rec.assetTag,
                name: rec.name,
                category: rec.category,
                assignee: rec.assignee?.name || null,
                date: rec.assignedDate ? new Date(rec.assignedDate).toLocaleDateString() : null,
                status: rec.status,
                dbId: rec._id
            }));

            return { stats: data.stats, records: mappedRecords };
        },
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
            queryClient.invalidateQueries({ queryKey: ['assets', 'dashboard'] });
        }
    });
}

export function useAssignAsset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AssignAssetPayload) => assetService.assignAsset(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets', 'dashboard'] });
        }
    });
}