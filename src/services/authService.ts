import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ENDPOINTS } from "../constants/endpoints";
import type { SignupPayload } from "@/types/index";
import { User } from "@/store/authSlice";

export interface LoginCredentials { email: string; password: string; }

export interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
    accessToken?: string;
    refreshToken?: string;
}

interface ApiErrorResponse { 
    success: boolean;
    message: string; 
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
        
        // Removed localStorage! Redux is the single source of truth for the UI now.
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            throw new Error(apiError?.message || "Failed to login. Please check your credentials.");
        }
        throw new Error("An unexpected error occurred during login.");
    }
};

export const registerUser = async (userData: SignupPayload): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    } catch (error: unknown) {
        // Catch actual backend validation errors (like "Email already exists")
        if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            throw new Error(apiError?.message || "Failed to register. Please check your details.");
        }
        throw new Error("An unexpected error occurred during registration.");
    }
};

export const logoutUser = async () => {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } finally {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
    }
};

export const fetchCurrentUser = async (): Promise<User> => {
    try {
        // Note: Check your backend routes. In your controllers, this was mapped to /profile.
        // Make sure it matches what you are actually using in routes/auth.js!
        const response = await apiClient.get<{success: boolean, user: User}>('/auth/profile'); 
        return response.data.user;
    } catch (error) {
        throw new Error("Session invalid or expired");
    }
};