// src/services/payrollService.ts
import apiClient from "./apiClient";
import { ENDPOINTS } from "../constants/endpoints";

export const payrollService = {
    getDashboardData: async (month: number, year: number) => {
        const response = await apiClient.get(`${ENDPOINTS.PAYROLL.BASE}?month=${month}&year=${year}`);
        return response.data;
    },
    
    getPayrollBatches: async () => {
        const response = await apiClient.get(ENDPOINTS.PAYROLL.BATCHES);
        return response.data;
    },

    getBatchRecords: async (batchId: string) => {
        const response = await apiClient.get(`${ENDPOINTS.PAYROLL.BATCHES}/${batchId}/records`);
        return response.data;
    },

    runPayroll: async (month: number, year: number) => {
        const response = await apiClient.post(ENDPOINTS.PAYROLL.RUN, { month, year });
        return response.data;
    },

    processPayment: async (payrollId: string) => {
        const response = await apiClient.post(ENDPOINTS.PAYROLL.PROCESS(payrollId));
        return response.data;
    },

    getMyPayslips: async () => {
        const response = await apiClient.get(ENDPOINTS.PAYROLL.MY_PAYROLL);
        return response.data;
    }
};