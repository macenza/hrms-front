import apiClient from './apiClient';

export interface Shift {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export const shiftService = {
    getAll: async (): Promise<Shift[]> => {
        try {
            const response = await apiClient.get('/shifts');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching shifts:", error);
            throw error;
        }
    },

    getById: async (id: string): Promise<Shift> => {
        try {
            const response = await apiClient.get(`/shifts/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching shift ${id}:`, error);
            throw error;
        }
    },

    create: async (shiftData: { name: string; startTime: string; endTime: string }): Promise<Shift> => {
        try {
            const response = await apiClient.post('/shifts', shiftData);
            return response.data.data;
        } catch (error) {
            console.error("Error creating shift:", error);
            throw error;
        }
    },

    update: async (id: string, shiftData: { name?: string; startTime?: string; endTime?: string }): Promise<Shift> => {
        try {
            const response = await apiClient.put(`/shifts/${id}`, shiftData);
            return response.data.data;
        } catch (error) {
            console.error(`Error updating shift ${id}:`, error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/shifts/${id}`);
        } catch (error) {
            console.error(`Error deleting shift ${id}:`, error);
            throw error;
        }
    }
};
