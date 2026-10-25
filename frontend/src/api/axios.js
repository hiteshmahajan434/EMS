import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: SERVER_URL + "/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || "";
        if (
            error.response?.status === 403 &&
            message.toLowerCase().includes("organization has been deactivated")
        ) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;