import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import Cookies from 'js-cookie';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Automatically attach Bearer token from localStorage for cookieless clients (cross-domain)
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const hrmsToken = localStorage.getItem('hrms_token');
            const customerToken = localStorage.getItem('customer_token');
            
            // Inspect Request URL directly to determine portal context strictly
            const isCustomerApi = config.url?.includes('/api/customers') || config.url?.includes('/customers');
            const token = isCustomerApi ? customerToken : hrmsToken;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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
            const isAuthRoute =
                originalRequest.url?.includes('login') || originalRequest.url?.includes('register');
            
            if (isAuthRoute) {
                return Promise.reject(error);
            }

            const PUBLIC_ROUTES = ['/', '/login', '/signup', '/hrms-login', '/privacy-policy', '/terms-and-conditions'];

            // Prevent infinite refresh loops
            if (originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH)) {
                if (typeof window !== 'undefined') {
                    console.log('Refresh token expired. Forcing logout.');
                    localStorage.removeItem('hrms_user');
                    localStorage.removeItem('hrms_token');
                    localStorage.removeItem('hrms_refreshToken');
                    Cookies.remove('hrms_token');
                    Cookies.remove('hrms_role');
                    Cookies.remove('role');

                    const isPublicRoute = PUBLIC_ROUTES.includes(window.location.pathname);
                    if (!isPublicRoute) {
                        window.location.href = '/hrms-login?error=session_expired';
                    }
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
                    const localRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('hrms_refreshToken') : null;
                    const refreshResponse = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { 
                        refreshToken: localRefreshToken 
                    });
                    
                    const newAccessToken = refreshResponse.data?.accessToken;
                    if (newAccessToken && typeof window !== 'undefined') {
                        localStorage.setItem('hrms_token', newAccessToken);
                        Cookies.set('hrms_token', newAccessToken, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                    }
                    
                    processQueue(null);
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as Error, null);
                    if (typeof window !== 'undefined') {
                        console.log('Session permanently expired. Redirecting.');
                        localStorage.removeItem('hrms_user');
                        localStorage.removeItem('hrms_token');
                        localStorage.removeItem('hrms_refreshToken');
                        Cookies.remove('hrms_token');
                        Cookies.remove('hrms_role');
                        Cookies.remove('role');

                        const isPublicRoute = PUBLIC_ROUTES.includes(window.location.pathname);
                        if (!isPublicRoute) {
                            window.location.href = '/hrms-login?error=session_expired';
                        }
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