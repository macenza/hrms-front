import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export const projectService = {
    getAll: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.PROJECT.BASE);
            // The Unwrapper: Safely extract the array whether it's in .data, .projects, or root
            return response.data?.data || response.data?.projects || response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },
    create: async (projectData: any) => {
        try {
            const response = await apiClient.post(ENDPOINTS.PROJECT.BASE, projectData);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },
    update: async (id: string, updateData: any) => {
        try {
            const response = await apiClient.put(ENDPOINTS.PROJECT.UPDATE(id), updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }
    },
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.PROJECT.GET_BY_ID(id));
            // Unwrap single object
            return response.data?.data || response.data?.project || response.data;
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(ENDPOINTS.PROJECT.DELETE(id));
            return response.data;
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    },
};