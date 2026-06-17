import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import Cookies from 'js-cookie';

const isPublicRoute = (pathname: string): boolean => {
    const PUBLIC_ROUTES = [
        '/',
        '/login',
        '/signup',
        '/hrms-login',
        '/kiosk',
        '/privacy-policy',
        '/terms-and-conditions',
        '/privacy',
        '/about',
        '/blog',
        '/contact',
        '/features',
        '/pricing',
        '/checkout-privacy',
        '/checkout-terms',
        '/register-company',
        '/payment-success'
    ];
    return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/careers');
};

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
            const hrmsToken = sessionStorage.getItem('hrms_token');
            const customerToken = sessionStorage.getItem('customer_token');
            
            // Inspect Request URL directly to determine portal context strictly
            const isCustomerApi = config.url?.includes('/api/customers') || config.url?.includes('/customers');
            const token = isCustomerApi ? (customerToken || hrmsToken) : hrmsToken;
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

            // Secure logout for B2B Customer context on 401
            const isCustomerApi = originalRequest.url?.includes('/customers');
            if (isCustomerApi) {
                if (typeof window !== 'undefined') {
                    console.log('Customer session expired. Forcing logout.');
                    sessionStorage.removeItem('customer_user');
                    sessionStorage.removeItem('customer_token');
                    localStorage.removeItem('customer_user');
                    localStorage.removeItem('customer_token');
                    Cookies.remove('customer_token');
                    Cookies.remove('customer_refreshToken');
                    
                    // Call backend logout asynchronously to clear HttpOnly cookies
                    apiClient.post('/customers/logout').catch(() => {});
                    
                    const isProtectedRoute = window.location.pathname.startsWith('/billing') || 
                                             window.location.pathname.startsWith('/subscriptions');
                    if (isProtectedRoute) {
                        window.location.href = '/login?error=session_expired';
                    }
                }
                return Promise.reject(error);
            }

            // Prevent infinite refresh loops
            if (originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH)) {
                if (typeof window !== 'undefined') {
                    console.log('Refresh token expired. Forcing logout.');
                    sessionStorage.removeItem('hrms_user');
                    sessionStorage.removeItem('hrms_token');
                    sessionStorage.removeItem('hrms_refreshToken');
                    localStorage.removeItem('hrms_user');
                    localStorage.removeItem('hrms_token');
                    localStorage.removeItem('hrms_refreshToken');
                    Cookies.remove('hrms_token', { path: '/' });
                    Cookies.remove('hrms_role', { path: '/' });
                    Cookies.remove('role', { path: '/' });

                    const isPublic = isPublicRoute(window.location.pathname);
                    if (!isPublic) {
                        window.location.href = '/login?error=session_expired';
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
                    const localRefreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('hrms_refreshToken') : null;
                    const refreshResponse = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { 
                        refreshToken: localRefreshToken 
                    });
                    
                    const newAccessToken = refreshResponse.data?.accessToken;
                    if (newAccessToken && typeof window !== 'undefined') {
                        sessionStorage.setItem('hrms_token', newAccessToken);
                        Cookies.set('hrms_token', newAccessToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
                    }
                    
                    processQueue(null);
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as Error, null);
                    if (typeof window !== 'undefined') {
                        console.log('Session permanently expired. Redirecting.');
                        sessionStorage.removeItem('hrms_user');
                        sessionStorage.removeItem('hrms_token');
                        sessionStorage.removeItem('hrms_refreshToken');
                        localStorage.removeItem('hrms_user');
                        localStorage.removeItem('hrms_token');
                        localStorage.removeItem('hrms_refreshToken');
                        Cookies.remove('hrms_token', { path: '/' });
                        Cookies.remove('hrms_role', { path: '/' });
                        Cookies.remove('role', { path: '/' });

                        const isPublic = isPublicRoute(window.location.pathname);
                        if (!isPublic) {
                            window.location.href = '/login?error=session_expired';
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