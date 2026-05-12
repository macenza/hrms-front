// src/services/payrollService.ts
import apiClient from "./apiClient";

export const payrollService = {
    getDashboardData: async (payPeriod?: string) => {
        const url = payPeriod ? `/payroll?payPeriod=${payPeriod}` : '/payroll';
        const response = await apiClient.get(url);
        return response.data.data;
    },
    
    runPayroll: async (payPeriod?: string) => {
        const payload = payPeriod ? { payPeriod } : {};
        const response = await apiClient.post('/payroll/run', payload);
        return response.data;
    }
};