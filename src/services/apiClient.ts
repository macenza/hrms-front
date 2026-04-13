import axios from "axios";
import Cookies from "js-cookie"; // ✅ IMPORTANT

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api", // ✅ backend URL
});

// ✅ Interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); // get token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;