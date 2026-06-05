import apiClient from './apiClient';

export interface Holiday {
    _id: string;
    name: string;
    date: string;
    country: string;
    state?: string | null;
    type: 'National' | 'Regional' | 'Optional' | 'Company' | 'Religious';
    description?: string;
    status: 'Active' | 'Cancelled';
    isDeleted?: boolean;
    deletedAt?: string | null;
    createdBy?: { _id: string; name: string };
    updatedBy?: { _id: string; name: string };
    createdAt?: string;
    updatedAt?: string;
}

export interface BulkImportResult {
    created: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
}

export const holidayService = {
    getAll: async (params?: { year?: number; country?: string; type?: string; includeDeleted?: boolean }) => {
        const response = await apiClient.get('/holidays', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/holidays/${id}`);
        return response.data;
    },

    create: async (data: Partial<Holiday>) => {
        const response = await apiClient.post('/holidays', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Holiday>) => {
        const response = await apiClient.put(`/holidays/${id}`, data);
        return response.data;
    },

    remove: async (id: string) => {
        const response = await apiClient.delete(`/holidays/${id}`);
        return response.data;
    },

    restore: async (id: string) => {
        const response = await apiClient.patch(`/holidays/${id}/restore`);
        return response.data;
    },

    bulkImport: async (formData: FormData) => {
        const response = await apiClient.post('/holidays/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
