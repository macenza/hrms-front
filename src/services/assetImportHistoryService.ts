import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export interface ImportHistoryFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export const assetImportHistoryService = {
    getImportHistory: async (params: ImportHistoryFilterParams = {}) => {
        try {
            let url = `${ENDPOINTS.ASSET.IMPORT_HISTORY}?page=${params.page || 1}&limit=${params.limit || 10}`;
            if (params.search) url += `&search=${encodeURIComponent(params.search)}`;
            if (params.startDate) url += `&startDate=${params.startDate}`;
            if (params.endDate) url += `&endDate=${params.endDate}`;
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching asset import history:", error);
            throw error;
        }
    }
};
