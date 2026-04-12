import apiClient from './apiClient';

export const taskService = {
    getByProject: async (projectId: string) => {
        try {
            const response = await apiClient.get(`/tasks/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }
    },
    create: async (taskData: any) => {
        try {
            const response = await apiClient.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    },
    updateStatus: async (taskId: string, status: string) => {
        try {
            const response = await apiClient.put(`/tasks/${taskId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error("Error updating task status:", error);
            throw error;
        }
    }
};