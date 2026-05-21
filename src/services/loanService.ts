import apiClient from './apiClient';

export const loanService = {
    getDashboardData: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        type?: string;
        employeeId?: string | null;
    }) => {
        try {
            const response = await apiClient.get('/loans', { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching loan data:", error);
            throw error;
        }
    },
    applyForLoan: async (loanData: any) => {
        try {
            const response = await apiClient.post('/loans', loanData);
            return response.data;
        } catch (error) {
            console.error("Error applying for loan:", error);
            throw error;
        }
    },
    reviewLoan: async (
        loanId: string,
        payload: {
            status: 'Active' | 'Rejected';
            remarks: string;
            approvedAmount?: number;
            interestRate?: number;
        }
    ) => {
        try {
            const response = await apiClient.put(`/loans/${loanId}/review`, payload);
            return response.data;
        } catch (error) {
            console.error("Error reviewing loan:", error);
            throw error;
        }
    },
    cancelLoan: async (loanId: string) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/cancel`);
            return response.data;
        } catch (error) {
            console.error("Error cancelling loan:", error);
            throw error;
        }
    },
    forecloseLoan: async (loanId: string) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/foreclose`);
            return response.data;
        } catch (error) {
            console.error("Error foreclosing loan:", error);
            throw error;
        }
    },
    togglePauseEmi: async (loanId: string, isPaused: boolean) => {
        try {
            const response = await apiClient.post(`/loans/${loanId}/pause-emi`, { isPaused });
            return response.data;
        } catch (error) {
            console.error("Error toggling pause EMI:", error);
            throw error;
        }
    }
};