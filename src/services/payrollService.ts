import apiClient from './apiClient';

export const payrollService = {
    getDashboardData: async () => {
        try {
            const response = await apiClient.get('/payroll');
            return response.data;
        } catch (error) {
            console.error("Error fetching payroll data:", error);
            throw error;
        }
    },
    runPayroll: async () => {
        try {
            const response = await apiClient.post('/payroll/run');
            return response.data;
        } catch (error) {
            console.error("Error running payroll:", error);
            throw error;
        }
    }
};