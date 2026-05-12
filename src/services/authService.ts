import Cookies from "js-cookie";
import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ENDPOINTS } from "../constants/endpoints";
import type { SignupPayload } from "@/types/index";


// Define strict types for credentials and responses
export interface LoginCredentials {

    email: string;
    password: string;
}

export interface AuthUser {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: 'Admin' | 'HR' | 'Employee';
    team?: string;
    isActive?: boolean;
    joinedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user: AuthUser;
}

interface ApiErrorResponse {
    message: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        const { token, accessToken, refreshToken, user } = response.data;
        const resolvedToken = accessToken || token;

        // Store tokens securely
        if (resolvedToken) {
            Cookies.set("token", resolvedToken, { secure: true, sameSite: 'strict' });
        }
        if (refreshToken) {
            Cookies.set("refreshToken", refreshToken, { secure: true, sameSite: 'strict' });
        }
        
        // Store user metadata
        localStorage.setItem("user", JSON.stringify(user));

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
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.AUTH.REGISTER,
            userData
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError = error.response?.data as ApiErrorResponse;
            throw new Error(apiError?.message || "Failed to register new user.");
        }
        throw new Error("An unexpected error occurred during registration.");
    }
};

export const logoutUser = async (): Promise<void> => {
    try 
    {
        const refreshToken = Cookies.get("refreshToken");
        
        if (refreshToken) 
        {
            await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
        }
    }
    catch (error: unknown) 
    {
        console.error("Backend logout failed:", error instanceof AxiosError ? error.message : error);
    } 
    finally 
    {
        // Always purge local data to ensure the user is logged out on the client
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        localStorage.removeItem("user");
    }
};