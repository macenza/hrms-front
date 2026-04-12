import apiClient from './apiClient';

export const loanService = {
    getDashboardData: async () => {
        try {
            const response = await apiClient.get('/loans');
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
    }
};