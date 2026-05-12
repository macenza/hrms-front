// src/hooks/api/usePayroll.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/services/payrollService';

export function usePayrollData(enabled: boolean) {
    return useQuery({
        queryKey: ['payroll', 'dashboard'],
        queryFn: async () => {
            const data = await payrollService.getDashboardData();
            
            const mappedRecords = data.records.map((rec: any) => ({
                id: rec.user?.employeeId || 'N/A',
                name: rec.user?.name || 'Unknown',
                department: rec.user?.profile?.department || 'Unassigned',
                basicSalary: rec.earnings?.basic || 0,
                grossSalary: rec.earnings?.total || 0,
                netPayable: rec.netPay || 0,
                status: rec.status,
                dbId: rec._id
            }));

            return { stats: data.stats, records: mappedRecords };
        },
        enabled, // RBAC Gate: Only fetch if Admin/HR
        staleTime: 5 * 60 * 1000,
    });
}

export function useRunPayroll() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () => payrollService.runPayroll(),
        onSuccess: () => {
            // Automatically refresh the payroll dashboard data upon successful run
            queryClient.invalidateQueries({ queryKey: ['payroll', 'dashboard'] });
        }
    });
}