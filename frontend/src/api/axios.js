import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: SERVER_URL + "/api"
});

//Attach Auth token to all network requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

export default api;