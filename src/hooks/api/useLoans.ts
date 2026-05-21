import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '@/services/loanService';
import { employeeService } from '@/services/employeeService';
import { LoanApplicationPayload } from '@/components/loan/ApplyLoanModal';
import type { LoanRecord } from '@/components/loan/LoanTable';

export interface UseLoansParams {
    page: number;
    limit: number;
    search: string;
    status: string;
    type: string;
    employeeId?: string | null;
}

export function useLoans(params: UseLoansParams) {
    return useQuery({
        queryKey: ['loans', 'list', params],
        queryFn: async () => {
            const data = await loanService.getDashboardData({
                page: params.page,
                limit: params.limit,
                search: params.search,
                status: params.status,
                type: params.type,
                employeeId: params.employeeId
            });

            // Fallback client-side logic to handle un-paginated/un-filtered backend endpoints
            const rawRecords = data.records || [];
            const mappedRecords = rawRecords.map((rec: any): LoanRecord & {
                reason?: string;
                deductionStart?: string;
                createdAt?: string;
                remarks?: string;
                approvedAmount?: number;
                interestRate?: number;
                rawUser?: any;
            } => ({
                id: rec._id || rec.id,
                employeeName: rec.user?.name || rec.employeeName || 'Unknown',
                employeeId: rec.user?.employeeId || rec.employeeId || 'N/A',
                type: rec.loanType || rec.type || 'Personal Loan',
                amount: rec.amount || 0,
                emi: rec.emiAmount || rec.emi || 0,
                tenureMonths: rec.tenure || rec.tenureMonths || 0,
                status: rec.status || 'Pending',
                reason: rec.reason || '',
                deductionStart: rec.deductionStart || '',
                createdAt: rec.createdAt || '',
                remarks: rec.remarks || '',
                approvedAmount: rec.approvedAmount || rec.amount || 0,
                interestRate: rec.interestRate || 0,
                rawUser: rec.user
            }));

            // Filter records locally as a resilient fallback
            let filtered = [...mappedRecords];

            // 1. Search Query
            if (params.search) {
                const q = params.search.toLowerCase();
                filtered = filtered.filter(
                    (rec) =>
                        rec.employeeName.toLowerCase().includes(q) ||
                        rec.employeeId.toLowerCase().includes(q) ||
                        rec.id.toLowerCase().includes(q)
                );
            }

            // 2. Status filter
            if (params.status && params.status !== 'All') {
                filtered = filtered.filter(
                    (rec) => rec.status.toLowerCase() === params.status.toLowerCase()
                );
            }

            // 3. Loan Type filter
            if (params.type && params.type !== 'All') {
                const t = params.type.toLowerCase();
                filtered = filtered.filter((rec) => {
                    const recType = rec.type.toLowerCase();
                    if (t.includes('advance') || recType.includes('advance')) {
                        return recType.includes('advance') || recType.includes('salary');
                    }
                    if (t.includes('medical') || recType.includes('medical')) {
                        return recType.includes('medical') || recType.includes('emergency');
                    }
                    if (t.includes('personal') || recType.includes('personal')) {
                        return recType.includes('personal');
                    }
                    return recType === t;
                });
            }

            // 4. Employee Gating (User-level RBAC)
            if (params.employeeId) {
                filtered = filtered.filter((rec) => {
                    const recUserId = rec.rawUser?._id || rec.rawUser?.id || rec.rawUser || rec.employeeId;
                    return recUserId === params.employeeId || rec.employeeId === params.employeeId;
                });
            }

            const totalCount = filtered.length;

            // Paginate locally
            const startIndex = (params.page - 1) * params.limit;
            const paginatedRecords = filtered.slice(startIndex, startIndex + params.limit);

            return {
                stats: data.stats || null,
                records: paginatedRecords,
                totalCount,
                allFilteredRecords: filtered, // Return entire filtered list so components can compute metrics dynamically if needed
            };
        },
        staleTime: 2 * 60 * 1000,
    });
}

// Kept for backward compatibility if needed elsewhere
export function useLoanDashboard() {
    return useQuery({
        queryKey: ['loans', 'dashboard'],
        queryFn: async () => {
            const data = await loanService.getDashboardData();
            return {
                stats: data.stats,
                records: (data.records || []).map((rec: any): LoanRecord => ({
                    id: rec._id || rec.id,
                    employeeName: rec.user?.name || 'Unknown',
                    employeeId: rec.user?.employeeId || 'N/A',
                    type: rec.loanType || rec.type || 'Personal Loan',
                    amount: rec.amount || 0,
                    emi: rec.emiAmount || rec.emi || 0,
                    tenureMonths: rec.tenure || rec.tenureMonths || 0,
                    status: rec.status || 'Pending',
                }))
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useLoanEmployees(enabled: boolean) {
    return useQuery({
        queryKey: ['loans', 'employees'],
        queryFn: async () => {
            const empResponse = await employeeService.getAll(1, 100);
            return (empResponse.employees || []).map((emp: any, index: number) => ({
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
            deductionStartMonth: payload.deductionStart,
            reason: payload.reason
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
    });
}

export function useReviewLoan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ loanId, payload }: {
            loanId: string;
            payload: {
                status: 'Active' | 'Rejected';
                remarks: string;
                approvedAmount?: number;
                interestRate?: number;
            };
        }) => loanService.reviewLoan(loanId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
    });
}

export function useCancelLoan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (loanId: string) => loanService.cancelLoan(loanId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
    });
}

export function useForecloseLoan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (loanId: string) => loanService.forecloseLoan(loanId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
    });
}

export function useTogglePauseEmi() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ loanId, isPaused }: { loanId: string; isPaused: boolean }) =>
            loanService.togglePauseEmi(loanId, isPaused),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        }
    });
}