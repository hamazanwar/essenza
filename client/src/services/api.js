import axios from "axios";

const api = axios.create({
  baseURL: "https://essenza-fe6i.onrender.com/api",
});

export default api;