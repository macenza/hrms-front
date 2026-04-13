import Cookies from "js-cookie";
import apiClient from './apiClient';
import { ENDPOINTS } from '../constants/endpoints';

export const loginUser = async (credentials: {
    email: string;
    password: string;
}) => {
    try {
        const response = await apiClient.post(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        const { token, refreshToken, user } = response.data;

        // Store tokens
        Cookies.set("token", token);
        Cookies.set("refreshToken", refreshToken);

        // Store user
        localStorage.setItem("user", JSON.stringify(user));

        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Failed to login"
        );
    }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
      

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to register"
    );
  }
};

export const logoutUser = async () => {
    try {
        const refreshToken = Cookies.get("refreshToken");

        const response = await apiClient.post(
            ENDPOINTS.AUTH.LOGOUT,
            { refreshToken }
        );

        return response.data;
    } catch (error: any) {
        console.error(
            "Backend logout failed:",
            error.response?.data?.message
        );
    } finally {
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        localStorage.removeItem("user");
    }
};