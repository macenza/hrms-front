import apiClient from './apiClient';

export type GetNoticesParams = {
    page?: number;
    limit?: number;
    category?: string;
};

export const noticeService = {
    createNotice: async (data: FormData) => {
        const response = await apiClient.post('/notices', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getNotices: async (params: GetNoticesParams = {}) => {
        const { page = 1, limit = 10, category } = params;
        const searchParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        
        if (category && category !== 'all') {
            searchParams.set('category', category);
        }
        
        const response = await apiClient.get(`/notices?${searchParams.toString()}`);
        return response.data; 
    },

    getNoticeStats: async () => {
        const response = await apiClient.get('/notices/stats');
        return response.data;
    },

    updateNotice: async (id: string, data: FormData) => {
        const response = await apiClient.put(`/notices/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteNotice: async (id: string) => {
        const response = await apiClient.delete(`/notices/${id}`);
        return response.data;
    },
    
    toggleNoticePin: async (id: string) => {
        const response = await apiClient.patch(`/notices/${id}/pin`);
        return response.data;
    }
};