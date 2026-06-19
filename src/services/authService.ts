import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ENDPOINTS } from "../constants/endpoints";
import Cookies from "js-cookie";
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
            sessionStorage.removeItem('hrms_user');
            sessionStorage.removeItem('hrms_token');
            sessionStorage.removeItem('hrms_refreshToken');
            sessionStorage.removeItem('customer_user');
            sessionStorage.removeItem('customer_token');
            sessionStorage.removeItem('persist:employeeAuth');
            sessionStorage.removeItem('persist:customerAuth');

            localStorage.removeItem('hrms_user');
            localStorage.removeItem('hrms_token');
            localStorage.removeItem('hrms_refreshToken');
            localStorage.removeItem('customer_user');
            localStorage.removeItem('customer_token');
            localStorage.removeItem('persist:employeeAuth');
            localStorage.removeItem('persist:customerAuth');

            Cookies.remove('hrms_token', { path: '/' });
            Cookies.remove('hrms_role', { path: '/' });
            Cookies.remove('role', { path: '/' });
            Cookies.remove('customer_token', { path: '/' });
            Cookies.remove('customer_refreshToken', { path: '/' });
        }
    }
};

export const fetchCurrentUser = async (): Promise<User> => {
    try {
        const response = await apiClient.get<{success: boolean, user: User}>('/auth/profile'); 
        return response.data.user;
    } catch (error) {
        throw new Error("Session invalid or expired");
    }
};

export interface CustomerRegisterPayload {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyEmail?: string;
    subscriptionPlan: string;
    phone?: string;
    address?: string;
    country?: string;
    state?: string;
    district?: string;
    city?: string;
    zipCode?: string;
}

export interface CustomerAuthResponse {
    success: boolean;
    message: string;
    customer: any;
    accessToken?: string;
}

export const registerCustomer = async (payload: CustomerRegisterPayload): Promise<CustomerAuthResponse> => {
    try {
        const response = await apiClient.post<CustomerAuthResponse>(ENDPOINTS.CUSTOMERS.REGISTER, payload);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            throw new Error(apiError?.message || "Failed to register workspace.");
        }
        throw new Error("An unexpected error occurred during workspace registration.");
    }
};

export const loginCustomer = async (credentials: LoginCredentials): Promise<CustomerAuthResponse> => {
    try {
        const response = await apiClient.post<CustomerAuthResponse>(ENDPOINTS.CUSTOMERS.LOGIN, credentials);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            throw new Error(apiError?.message || "Failed to login. Please check your credentials.");
        }
        throw new Error("An unexpected error occurred during login.");
    }
};

export const logoutCustomer = async () => {
    try {
        const response = await apiClient.post(ENDPOINTS.CUSTOMERS.LOGOUT);
        return response.data;
    } finally {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('hrms_user');
            sessionStorage.removeItem('hrms_token');
            sessionStorage.removeItem('hrms_refreshToken');
            sessionStorage.removeItem('customer_user');
            sessionStorage.removeItem('customer_token');
            sessionStorage.removeItem('persist:employeeAuth');
            sessionStorage.removeItem('persist:customerAuth');

            localStorage.removeItem('hrms_user');
            localStorage.removeItem('hrms_token');
            localStorage.removeItem('hrms_refreshToken');
            localStorage.removeItem('customer_user');
            localStorage.removeItem('customer_token');
            localStorage.removeItem('persist:employeeAuth');
            localStorage.removeItem('persist:customerAuth');

            Cookies.remove('hrms_token', { path: '/' });
            Cookies.remove('hrms_role', { path: '/' });
            Cookies.remove('role', { path: '/' });
            Cookies.remove('customer_token', { path: '/' });
            Cookies.remove('customer_refreshToken', { path: '/' });
        }
    }
};