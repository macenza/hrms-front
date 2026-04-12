import apiClient from './apiClient';

export const assetService = {
    getDashboardData: async () => {
        try {
            const response = await apiClient.get('/assets');
            return response.data;
        } catch (error) {
            console.error("Error fetching asset data:", error);
            throw error;
        }
    },
    assignAsset: async (payload: any) => {
        try {
            const response = await apiClient.post('/assets/assign', payload);
            return response.data;
        } catch (error) {
            console.error("Error assigning asset:", error);
            throw error;
        }
    },
    createAsset: async (payload: any) => {
        try {
            const response = await apiClient.post('/assets', payload);
            return response.data;
        } catch (error) {
            console.error("Error creating asset:", error);
            throw error;
        }
    }
};