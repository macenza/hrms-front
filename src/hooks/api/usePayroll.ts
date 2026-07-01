// src/hooks/api/usePayroll.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/services/payrollService';

export function usePayrollData(month: number, year: number, enabled: boolean) {
    return useQuery({
        queryKey: ['payroll', 'dashboard', month, year],
        queryFn: async () => {
            const res = await payrollService.getDashboardData(month, year);
            
            // CRITICAL: Bulletproof Unwrapper to prevent silent crashes
            const recordsList = Array.isArray(res?.data?.records) 
                ? res.data.records 
                : (res?.data?.records?.data || res?.data?.records?.payrolls || res?.data || []);
            
            const stats = res?.data?.stats || {
                totalDraft: 0,
                totalDisbursed: 0,
                pendingApprovals: 0,
                totalDeductions: 0
            };
            
            // Map records cleanly for frontend rendering
            const mappedRecords = recordsList.map((rec: any) => ({
                id: rec.employee?.employeeId || 'N/A',
                name: rec.employee?.name || 'Unknown',
                department: rec.employee?.profile?.employment?.department || 'Unassigned',
                role: rec.employee?.role || 'employee',
                baseSalary: rec.baseSalary || 0,
                basicSalary: rec.baseSalary || 0, // Fallback mapping for PayslipModal!
                grossSalary: rec.grossPay || 0,
                taxDeduction: rec.taxDeduction || 0,
                unpaidLeaveDeduction: rec.unpaidLeaveDeduction || 0,
                loanDeduction: rec.loanDeduction || 0,
                netPayable: rec.netPay || 0,
                status: rec.status,
                paymentDate: rec.paymentDate,
                month: rec.month,
                year: rec.year,
                dbId: rec._id
            }));

            return { stats, records: mappedRecords };
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function usePayrollBatches(enabled: boolean = true) {
    return useQuery({
        queryKey: ['payroll', 'batches'],
        queryFn: async () => {
            const res = await payrollService.getPayrollBatches();
            return res.data || [];
        },
        enabled,
        refetchInterval: (query) => {
            const data = query.state.data;
            const hasProcessing = Array.isArray(data) && data.some((b: any) => b.status === 'Processing');
            return hasProcessing ? 3000 : false;
        },
    });
}

export function useBatchRecords(batchId: string | null, isProcessing: boolean = false) {
    return useQuery({
        queryKey: ['payroll', 'batchRecords', batchId],
        queryFn: async () => {
            if (!batchId) return [];
            const res = await payrollService.getBatchRecords(batchId);
            return res.data || [];
        },
        enabled: !!batchId,
        refetchInterval: isProcessing ? 2000 : false,
    });
}

export function useRunPayroll() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ month, year }: { month: number; year: number }) => 
            payrollService.runPayroll(month, year),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', 'batches'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', 'by-period'] });
        }
    });
}

export function useProcessPayment() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (payrollId: string) => payrollService.processPayment(payrollId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll', 'dashboard'] });
        }
    });
}

export function useMyPayslips(enabled: boolean = true) {
    return useQuery({
        queryKey: ['payroll', 'my-slips'],
        queryFn: async () => {
            const res = await payrollService.getMyPayslips();
            
            // CRITICAL: Bulletproof Unwrapper to prevent silent crashes
            const recordsList = Array.isArray(res?.data) 
                ? res.data 
                : (res?.data?.data || res?.data?.payrolls || res || []);
            
            // Map records cleanly for frontend rendering
            const mappedRecords = recordsList.map((rec: any) => ({
                id: rec.employee?.employeeId || 'N/A',
                name: rec.employee?.name || 'Unknown',
                department: rec.employee?.profile?.employment?.department || 'Unassigned',
                role: rec.employee?.role || 'employee',
                baseSalary: rec.baseSalary || 0,
                basicSalary: rec.baseSalary || 0, // Fallback mapping for PayslipModal!
                grossSalary: rec.grossPay || 0,
                taxDeduction: rec.taxDeduction || 0,
                unpaidLeaveDeduction: rec.unpaidLeaveDeduction || 0,
                loanDeduction: rec.loanDeduction || 0,
                netPayable: rec.netPay || 0,
                status: rec.status,
                paymentDate: rec.paymentDate,
                month: rec.month,
                year: rec.year,
                dbId: rec._id
            }));

            return mappedRecords;
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRealTimeAccrual(page: number, limit: number, search: string = '') {
    return useQuery({
        queryKey: ['payroll', 'real-time', page, limit, search],
        queryFn: async () => {
            const res = await payrollService.getRealTimeAccrual(page, limit, search);
            return res || { data: [], totalCount: 0 };
        },
        staleTime: 30 * 1000,
    });
}

export function usePayrollHistory(page: number, limit: number) {
    return useQuery({
        queryKey: ['payroll', 'history', page, limit],
        queryFn: async () => {
            const res = await payrollService.getPayrollHistory(page, limit);
            return res || { data: [], totalCount: 0 };
        },
        staleTime: 2 * 60 * 1000,
    });
}

export function useFinalizeMonth() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ month, year }: { month: number; year: number }) => 
            payrollService.finalizeMonth(month, year),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll', 'real-time'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', 'by-period'] });
            queryClient.invalidateQueries({ queryKey: ['payroll', 'batches'] });
        }
    });
}

export function usePayrollBatchByPeriod(month: number, year: number) {
    return useQuery({
        queryKey: ['payroll', 'by-period', month, year],
        queryFn: async () => {
            const res = await payrollService.getPayrollBatchByPeriod(month, year);
            return res.data || null;
        },
        staleTime: 10 * 1000,
        refetchInterval: (query) => {
            const data = query.state.data;
            const status = data?.batch?.status;
            return status === 'Processing' ? 3000 : false;
        },
    });
}