import apiClient from './apiClient';

export const projectService = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/projects');
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },
    
    create: async (projectData: any) => {
        try {
            const response = await apiClient.post('/projects', projectData);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    update: async (id: string, updateData: any) => {
        try {
            const response = await apiClient.put(`/projects/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }
    },
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    },
};