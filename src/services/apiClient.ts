// src/services/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from '../constants/endpoints';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    withCredentials: true, // CRITICAL: Ensures HttpOnly cookies are always sent
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && originalRequest) {
            // DO NOT intercept 401s from Login or Register. Pass them directly to the UI.
            const isAuthRoute =
                originalRequest.url?.includes('login') || originalRequest.url?.includes('register');
            if (isAuthRoute) {
                return Promise.reject(error);
            }

            if (originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH)) {
                if (typeof window !== 'undefined') {
                    console.error('Refresh token expired. Forcing logout.');
                    window.location.href = '/login?error=session_expired';
                }
                return Promise.reject(error);
            }

            if (!originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(() => apiClient(originalRequest))
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await apiClient.post(ENDPOINTS.AUTH.REFRESH);
                    processQueue(null);
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as Error, null);

                    if (typeof window !== 'undefined') {
                        console.error('Session permanently expired. Redirecting.');
                        window.location.href = '/login?error=session_expired';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        } else if (error.response?.status === 403) {
            console.warn('Access Denied (403): You do not have permission for this API route.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;