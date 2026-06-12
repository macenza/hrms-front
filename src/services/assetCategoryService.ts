import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export interface AssetCategoryPayload {
    name: string;
    description?: string;
    isActive?: boolean;
}

export const assetCategoryService = {
    getCategories: async (page: number = 1, limit: number = 10, search: string = '', isActive?: boolean) => {
        try {
            let url = `${ENDPOINTS.ASSET_CATEGORY.BASE}?page=${page}&limit=${limit}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (isActive !== undefined) url += `&isActive=${isActive}`;
            
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching asset categories:", error);
            throw error;
        }
    },

    getCategoryById: async (id: string) => {
        try {
            const response = await apiClient.get(`${ENDPOINTS.ASSET_CATEGORY.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching asset category ${id}:`, error);
            throw error;
        }
    },

    createCategory: async (payload: AssetCategoryPayload) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ASSET_CATEGORY.BASE, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating asset category:", error);
            throw error;
        }
    },

    updateCategory: async (id: string, payload: AssetCategoryPayload) => {
        try {
            const response = await apiClient.put(`${ENDPOINTS.ASSET_CATEGORY.BASE}/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating asset category ${id}:`, error);
            throw error;
        }
    },

    deleteCategory: async (id: string) => {
        try {
            const response = await apiClient.delete(`${ENDPOINTS.ASSET_CATEGORY.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting asset category ${id}:`, error);
            throw error;
        }
    }
};
