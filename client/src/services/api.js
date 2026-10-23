import axios from "axios";

const DEFAULT_API_URL = "https://essenza-0l7f.onrender.com/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
});

export default api;
