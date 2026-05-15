import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '@/services/loanService';
import { employeeService } from '@/services/employeeService';
import { LoanApplicationPayload } from '@/components/loan/ApplyLoanModal';
import type { LoanRecord } from '@/components/loan/LoanTable';

export function useLoanDashboard() {
    return useQuery({
        queryKey: ['loans', 'dashboard'],
        queryFn: async () => {
            const data = await loanService.getDashboardData();
            return {
                stats: data.stats,
                records: data.records.map(
                    (rec: {
                        _id: string;
                        user?: { name?: string; employeeId?: string };
                        loanType: string;
                        amount: number;
                        emiAmount: number;
                        tenure: number;
                        status: LoanRecord['status'];
                    }): LoanRecord => ({
                        id: rec._id,
                        employeeName: rec.user?.name || 'Unknown',
                        employeeId: rec.user?.employeeId || 'N/A',
                        type: rec.loanType,
                        amount: rec.amount,
                        emi: rec.emiAmount,
                        tenureMonths: rec.tenure,
                        status: rec.status,
                    })
                )
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}

// Only fetch employees if the user is a Manager/Admin
export function useLoanEmployees(enabled: boolean) {
    return useQuery({
        queryKey: ['loans', 'employees'],
        queryFn: async () => {
            const empResponse = await employeeService.getAll(1, 100);
            return empResponse.employees.map((emp: any, index: number) => ({
                id: emp._id || emp.id || `temp-id-${index}`,
                label: `${emp.name} (${emp.employeeId || 'No ID'})`
            }));
        },
        enabled,
        staleTime: 10 * 60 * 1000,
    });
}

export function useApplyLoan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: LoanApplicationPayload) => loanService.applyForLoan({
            user: payload.employeeId,
            loanType: payload.loanType,
            amount: Number(payload.amount),
            tenure: Number(payload.tenure),
            deductionStart: payload.deductionStart,
            reason: payload.reason
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans', 'dashboard'] });
        }
    });
}