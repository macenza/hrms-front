import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints'; // Ensure this path matches your project structure

export interface AssignAssetPayload {
    assetId: string;
    employeeId: string;
    assignmentDate: string;
    notes?: string;
}

export const assetService = {
    getDashboardData: async (page: number = 1, limit: number = 10, status: string = '', search: string = '') => {
        try {
            // Enforced BASE constant
            let url = `${ENDPOINTS.ASSET.BASE}?page=${page}&limit=${limit}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching asset data:", error);
            throw error;
        }
    },
    
    assignAsset: async (payload: AssignAssetPayload) => {
        try {
            // THE FIX: Extract assetId for the URL, send the rest as the request body
            const { assetId, ...bodyData } = payload;
            
            // Using the dynamic ASSIGN constant and the PUT method
            const response = await apiClient.put(ENDPOINTS.ASSET.ASSIGN(assetId), bodyData);
            return response.data;
        } catch (error) {
            console.error("Error assigning asset:", error);
            throw error;
        }
    },
    
    createAsset: async (payload: any) => {
        try {
            // Enforced BASE constant
            const response = await apiClient.post(ENDPOINTS.ASSET.BASE, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating asset:", error);
            throw error;
        }
    },
    
    deleteAsset: async (id: string) => {
        try {
            const response = await apiClient.delete(`${ENDPOINTS.ASSET.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting asset:", error);
            throw error;
        }
    },

    updateAssetStatus: async (id: string, status: string) => {
        try {
            const response = await apiClient.put(`${ENDPOINTS.ASSET.BASE}/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error("Error updating asset status:", error);
            throw error;
        }
    }
};