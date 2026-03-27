import apiClient from './apiClient';
import { ENDPOINTS } from '../constants/endpoints';

export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data; // Expected to return { user: {...}, token: "..." }
    } catch (error: any) {
        // Standardize error handling based on your backend response
        throw new Error(error.response?.data?.message || 'Failed to login');
    }
};