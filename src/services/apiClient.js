// src/services/apiClient.js
import axios from "axios";

const api = process.env.VUE_APP_APIKEY;

const axiosClient = axios.create({
    baseURL: api,
    withCredentials: true,
    withXSRFToken: true, // optional, good if using Laravel Sanctum
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Attach token to every request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Handle 401 globally
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized - redirecting to login");
            // Optional: auto logout
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
