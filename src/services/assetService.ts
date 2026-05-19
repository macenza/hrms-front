import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints'; // Ensure this path matches your project structure

export interface AssignAssetPayload {
    assetId: string;
    employeeId: string;
    assignmentDate: string;
    notes?: string;
}

export const assetService = {
    getDashboardData: async (page: number = 1, limit: number = 10) => {
        try {
            // Enforced BASE constant
            const response = await apiClient.get(`${ENDPOINTS.ASSET.BASE}?page=${page}&limit=${limit}`);
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
    }
};