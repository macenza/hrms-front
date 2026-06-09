import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export interface AssetMappingTemplate {
    _id: string;
    name: string;
    description?: string;
    mappings: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface AssetMappingTemplatePayload {
    name: string;
    description?: string;
    mappings: Record<string, string>;
}

export const assetMappingTemplateService = {
    getTemplates: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.ASSET_MAPPING_TEMPLATE.BASE);
            return response.data;
        } catch (error) {
            console.error("Error fetching asset mapping templates:", error);
            throw error;
        }
    },

    createTemplate: async (payload: AssetMappingTemplatePayload) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ASSET_MAPPING_TEMPLATE.BASE, payload);
            return response.data;
        } catch (error) {
            console.error("Error creating asset mapping template:", error);
            throw error;
        }
    },

    updateTemplate: async (id: string, payload: AssetMappingTemplatePayload) => {
        try {
            const response = await apiClient.put(`${ENDPOINTS.ASSET_MAPPING_TEMPLATE.BASE}/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating asset mapping template ${id}:`, error);
            throw error;
        }
    },

    deleteTemplate: async (id: string) => {
        try {
            const response = await apiClient.delete(`${ENDPOINTS.ASSET_MAPPING_TEMPLATE.BASE}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting asset mapping template ${id}:`, error);
            throw error;
        }
    }
};
