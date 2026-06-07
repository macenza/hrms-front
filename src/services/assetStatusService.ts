import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export interface AssetStatusPayload {
    name: string;
    color?: string;
    sequence?: number;
    isDefault?: boolean;
    isActive?: boolean;
}

export const assetStatusService = {
    getStatuses: async (page: number = 1, limit: number = 10, search: string = '', isActive?: boolean) => {
        try {
            let url = `${ENDPOINTS.ASSET_STATUS.BASE}?page=${page}&limit=${limit}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (isActive !== undefined) url += `&isActive=${isActive}`;
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching asset statuses:", error);
            throw error;
        }
    },

    getStatusById: async (id: string) => {
        try {
            const response = await apiClient.get(`${ENDPOINTS.ASSET_STATUS.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching asset status ${id}:`, error);
            throw error;
        }
    },

    createStatus: async (payload: AssetStatusPayload) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ASSET_STATUS.BASE, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating asset status:", error);
            throw error;
        }
    },

    updateStatus: async (id: string, payload: AssetStatusPayload) => {
        try {
            const response = await apiClient.put(`${ENDPOINTS.ASSET_STATUS.BASE}/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating asset status ${id}:`, error);
            throw error;
        }
    },

    deleteStatus: async (id: string) => {
        try {
            const response = await apiClient.delete(`${ENDPOINTS.ASSET_STATUS.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting asset status ${id}:`, error);
            throw error;
        }
    }
};
