import axios from "axios";

const api = axios.create({
  baseURL: "https://essenza-0l7f.onrender.com/api",
});

export default api;