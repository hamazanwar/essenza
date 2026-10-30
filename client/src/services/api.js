
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the correct authentication token for the current tab
api.interceptors.request.use((config) => {
  const adminToken = sessionStorage.getItem("adminToken");
  const userToken = sessionStorage.getItem("token");

  const isAdminRequest = config.url?.startsWith("/admin/");

  const token = isAdminRequest ? adminToken : userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
